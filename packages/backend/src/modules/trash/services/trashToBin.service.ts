import { TRPCError } from "@trpc/server";
import { purgeAtOf, trashRetentionDays, trashedByNameOf } from "@backend/modules/trash/services/trashRetention.service";
import type { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

import type { TrashToBinInput, TrashToBinOutput } from "@contracts/trash/trash.mutations";
import type { TrashEntryDTO } from "@contracts/trash/trash.dto";

import { buildPreviousPathShort, normalizePath, bigIntToSafeNumber } from "@backend/modules/trash/utils";
import { deriveMediaKind, type MediaKind } from "@backend/modules/media/helpers/deriveMediaKind";
import { isProtectedDisciplineFolderPath } from "@backend/modules/storage/protectedDisciplineFolder";
import { isProtectedEntityFolderPath } from "@backend/modules/storage/protectedEntityFolder";
import { requiredRootPaths } from "@backend/modules/storage/ensureContentRoots.service";
import { rewriteAssetPaths } from "@backend/modules/storage/mediaPaths";
import { assertTrashDoesntRemoveUsedAssets } from "@backend/modules/trash/services/trashedAssets.service";
import {
  r2Exists,
  r2GetInfo,
  r2ListByPrefix,
  r2MoveFile,
  r2MoveFolder,
} from "@backend/modules/trash/services/r2TrashOps";

/**
 * trashToBin.service.ts
 *
 * Ticket 3 : envoyer du contenu vers la corbeille.
 *
 * Design validé :
 * - Bin est une liste plate (pas de structure parent conservée).
 * - Le stockage R2 réel est caché : `${appRoot}/bin/.trash/<uuid>/...`.
 * - On crée une TrashEntry avec :
 *   - previousPath (tooltip + restore cible)
 *   - displayName (nom affiché dans le bin)
 *   - storageRoot (prefix réel caché)
 *   - sizeBytes (somme bytes du sous-arbre / fichier)
 *   - providerCreatedAt (max created_at)
 *
 * IMPORTANT :
 * - Aucune action ne doit toucher à `.trash` en dehors du trashRouter.
 * - Ce service NE fait que "normal -> bin".
 */

type ListedAsset = {
  bytes?: number;
  created_at?: string;
};

function lastSegment(path: string): string {
  const p = normalizePath(path);
  const parts = p.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? p;
}

/** Ni la racine, ni la corbeille elle-même, ni ce qu'elle contient déjà. */
function assertNotStatusOrRoot(appRoot: string, fullPath: string) {
  const p = normalizePath(fullPath);

  if (p === appRoot) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "La racine ne peut pas être mise à la corbeille." });
  }
  if (p === `${appRoot}/bin` || p.startsWith(`${appRoot}/bin/`)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Cet élément est déjà dans la corbeille." });
  }
}

/** Objets R2 sous un préfixe (taille, date) — pour les agrégats d'un dossier. */
async function listAssetsByPrefix(prefix: string): Promise<ListedAsset[]> {
  const objects = await r2ListByPrefix(prefix);
  return objects.map((o) => ({ bytes: o.bytes, created_at: o.createdAt?.toISOString() }));
}

/**
 * Type MIME d'un fichier connu en base. Seul moyen de reconnaître l'audio :
 * R2 n'expose que taille et date.
 */
async function knownMimeType(
  prisma: PrismaClient,
  appRoot: string,
  path: string,
): Promise<string | null> {
  const asset = await prisma.mediaAsset.findFirst({
    where: { appRoot, fullPath: path },
    select: { mimeType: true },
  });
  return asset?.mimeType ?? null;
}

/** Taille et date d'un fichier R2 ; throw s'il n'existe pas. */
async function fileInfo(path: string): Promise<{ bytes?: number; createdAt?: Date }> {
  const info = await r2GetInfo(path);
  if (!info) throw new TRPCError({ code: "NOT_FOUND", message: `Fichier introuvable : « ${lastSegment(path)} ».` });
  return info;
}

async function detectKind(params: { prisma: PrismaClient; appRoot: string; fullPath: string }):
  Promise<"folder" | "file"> {
  const { prisma, appRoot, fullPath } = params;
  const p = normalizePath(fullPath);

  // 1) Si on a un registre folder DB, c'est un folder.
  const folder = await prisma.folder.findFirst({
    where: { appRoot, fullPath: p },
    select: { id: true },
  });
  if (folder) return "folder";

  // 2) Si R2 connaît l'objet exact => file.
  if (await r2Exists(p)) return "file";

  // 3) Si on a au moins un asset sous prefix => folder.
  const assets = await listAssetsByPrefix(`${p}/`);
  if (assets.length > 0) return "folder";

  throw new TRPCError({ code: "NOT_FOUND", message: `Élément introuvable : « ${lastSegment(p)} ».` });
}

function computeAggregateFromAssets(assets: Array<{ bytes?: number; created_at?: string }>): {
  sizeBytes?: bigint;
  providerCreatedAt?: Date;
} {
  let total = 0;
  let hasBytes = false;
  let maxCreated: Date | null = null;

  for (const a of assets) {
    if (typeof a.bytes === "number") {
      total += a.bytes;
      hasBytes = true;
    }

    if (a.created_at) {
      const d = new Date(a.created_at);
      if (!Number.isNaN(d.valueOf())) {
        if (!maxCreated || d > maxCreated) maxCreated = d;
      }
    }
  }

  return {
    sizeBytes: hasBytes ? BigInt(total) : undefined,
    providerCreatedAt: maxCreated ?? undefined,
  };
}

type NormalizedSource = { kind: "folder" | "file"; fullPath: string };

async function normalizeSources(params: { prisma: PrismaClient; input: TrashToBinInput }): Promise<NormalizedSource[]> {
  const { prisma, input } = params;

  const out: NormalizedSource[] = [];
  const seen = new Set<string>();

  for (const s of input.sources) {
    if (s.kind === "selection") {
      for (const root of s.roots) {
        const p = normalizePath(root);
        if (seen.has(p)) continue;
        seen.add(p);

        // On détecte le kind pour être robuste.
        const kind = await detectKind({ prisma, appRoot: input.appRoot, fullPath: p });
        out.push({ kind, fullPath: p });
      }
      continue;
    }

    const p = normalizePath(s.fullPath);
    if (seen.has(p)) continue;
    seen.add(p);
    out.push({ kind: s.kind, fullPath: p });
  }

  return out;
}

export async function trashToBin(params: {
  prisma: PrismaClient;
  input: TrashToBinInput;
  /** Auteur de la mise à la corbeille (droits de restauration, colonne « Jeté par »). */
  trashedById?: string;
}): Promise<TrashToBinOutput> {
  const { prisma, input } = params;
  const appRoot = input.appRoot;

  // Durée de conservation et nom de l'auteur, pour la réponse (date de suppression, « Jeté par »).
  const days = await trashRetentionDays(prisma);
  const trashedByName = params.trashedById
    ? trashedByNameOf(
        await prisma.user.findUnique({
          where: { id: params.trashedById },
          select: { firstName: true, lastName: true, email: true },
        }),
      )
    : null;

  // Normalise la liste et déduplique.
  const sources = await normalizeSources({ prisma, input });

  // 🔒 Protection : les dossiers adossés à une ENTITÉ (espaces de groupe/perso,
  // avatars, et les conteneurs groups/persos/avatars) ne se suppriment PAS
  // depuis le finder — uniquement via le gestionnaire de l'entité. On refuse
  // AVANT tout déplacement (rien n'est déplacé si un seul est protégé).
  for (const source of sources) {
    if (
      source.kind === "folder" &&
      isProtectedEntityFolderPath(normalizePath(source.fullPath))
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Dossier protégé : « ${lastSegment(normalizePath(source.fullPath))} » est géré par une entité (groupe, espace perso, avatars) et ne peut pas être supprimé depuis le finder. Supprimez l'entité correspondante dans son gestionnaire.`,
      });
    }
  }

  // 🔒 Protection disciplines/catégories (DB-aware) : conteneur de catégorie,
  // sous-conteneur `new`, ou dossier de discipline → non supprimables depuis
  // le finder (passer par le gestionnaire de disciplines). Les racines de contenu
  // (stages, événements, espaces, dépôt commun) non plus : elles reçoivent les envois.
  const contentRoots = await requiredRootPaths(prisma, appRoot);
  for (const source of sources) {
    if (source.kind !== "folder") continue;
    const path = normalizePath(source.fullPath);
    if (contentRoots.includes(path)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `« ${lastSegment(path)} » est une racine de la bibliothèque : elle ne se met pas à la corbeille.`,
      });
    }
    if (await isProtectedDisciplineFolderPath(prisma, appRoot, path)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Dossier protégé : « ${lastSegment(path)} » correspond à une discipline ou une catégorie et ne peut pas être supprimé depuis le finder. Supprimez-la dans le gestionnaire de disciplines.`,
      });
    }
  }

  // 🔒 Fichier encore utilisé (page, galerie, documents des membres) : on refuse avant tout
  // déplacement, sinon le contenu afficherait un média cassé tant qu'il est dans la corbeille.
  await assertTrashDoesntRemoveUsedAssets(prisma, appRoot, sources);

  const results: TrashEntryDTO[] = [];

  for (const source of sources) {
    // Ni la racine, ni la corbeille, ni ce qu'elle contient déjà.
    assertNotStatusOrRoot(appRoot, source.fullPath);
    const normalized = normalizePath(source.fullPath);

    const displayName = lastSegment(normalized);
    const id = randomUUID();

    // NOTE : même pour un file, on stocke sous `.trash/<id>/<displayName>`
    // (bin navigable caché, collisions impossibles)
    const storageRoot = normalizePath(`${appRoot}/bin/.trash/${id}/${displayName}`);

    // 1) Calcul des agrégats (sizeBytes + createdAt) et du mediaKind
    let sizeBytes: bigint | undefined;
    let providerCreatedAt: Date | undefined;
    let mediaKind: MediaKind | undefined;

    if (source.kind === "file") {
      const info = await fileInfo(normalized);
      sizeBytes = typeof info.bytes === "number" ? BigInt(info.bytes) : undefined;
      providerCreatedAt = info.createdAt;
      mediaKind = deriveMediaKind(await knownMimeType(prisma, appRoot, normalized));
    } else {
      // ✅ trailing slash pour éviter les collisions de prefix (ex: cours1 vs cours10)
      const assets = await listAssetsByPrefix(`${normalized}/`);
      const agg = computeAggregateFromAssets(assets);
      sizeBytes = agg.sizeBytes;
      providerCreatedAt = agg.providerCreatedAt;
      // mediaKind reste undefined pour un folder (pas de type unique applicable)
    }

    const trashedAt = new Date();

    // 2) Création TrashEntry (avant move) : on "réserve" l'id et on garde la provenance.
    await prisma.trashEntry.create({
      data: {
        id,
        appRoot,
        kind: source.kind,
        status: "IN_BIN",
        displayName,
        previousPath: normalized,
        storageRoot,
        trashedAt,
        trashedById: params.trashedById ?? null,
        sizeBytes,
        providerCreatedAt,
        mediaKind,
      },
    });

    // 3) Déplacement physique vers storageRoot, puis la base suit : les lignes MediaAsset
    //    accompagnent leurs objets dans la quarantaine (statut, nom d'origine, description et
    //    auteur reviendront avec eux à la restauration, même à côté du chemin d'origine), et les
    //    lignes Folder du sous-arbre disparaissent de l'ancien endroit.
    //
    //    Pas de transaction commune entre le stockage et la base : on COMPENSE. Si l'une des deux
    //    étapes échoue, les objets reviennent à leur place et la TrashEntry réservée est retirée.
    const moveObjects = (from: string, to: string): Promise<void> =>
      source.kind === "file" ? r2MoveFile(from, to) : r2MoveFolder(`${from}/`, `${to}/`);
    const undo = async (): Promise<void> => {
      await moveObjects(storageRoot, normalized).catch((err) => {
        console.error("[trash] objets non ramenés", normalized, err);
      });
      await prisma.trashEntry.delete({ where: { id } }).catch(() => undefined);
    };

    try {
      await moveObjects(normalized, storageRoot);
    } catch (err) {
      await undo();
      throw err;
    }

    try {
      await prisma.$transaction([
        rewriteAssetPaths(prisma, appRoot, source.kind, normalized, storageRoot),
        // Le sous-arbre, c'est le dossier LUI-MÊME et ce qui est SOUS LUI — pas tout ce qui
        // commence par les mêmes lettres (`AKFC/courses/kali` n'emporte pas `kali-2`).
        prisma.folder.deleteMany({
          where: {
            appRoot,
            OR:
              source.kind === "folder"
                ? [{ fullPath: normalized }, { fullPath: { startsWith: `${normalized}/` } }]
                : [{ fullPath: normalized }],
          },
        }),
      ]);
    } catch (err) {
      await undo();
      throw err;
    }

    results.push({
      id,
      appRoot,
      kind: source.kind,
      status: "IN_BIN",
      displayName,
      previousPath: normalized,
      previousPathShort: buildPreviousPathShort(normalized),
      trashedAt: trashedAt.toISOString(),
      purgeAt: purgeAtOf(trashedAt, days).toISOString(),
      trashedByName,
      sizeBytes: bigIntToSafeNumber(sizeBytes),
      createdAt: providerCreatedAt ? providerCreatedAt.toISOString() : undefined,
      mediaKind,
    });
  }

  return {
    trashed: results,
    message: `${results.length} item(s) moved to bin`,
  };
}