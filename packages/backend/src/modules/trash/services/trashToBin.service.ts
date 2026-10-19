import type { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

import type { TrashToBinInput, TrashToBinOutput } from "@contracts/trash/trash.mutations";
import type { TrashEntryDTO } from "@contracts/trash/trash.dto";

import { buildPreviousPathShort, normalizePath, bigIntToSafeNumber } from "@backend/modules/trash/utils";
import { deriveMediaKind, type MediaKind } from "@backend/modules/media/helpers/deriveMediaKind";
import { isProtectedDisciplineFolderPath } from "@backend/modules/storage/protectedDisciplineFolder";
import { isProtectedEntityFolderPath } from "@backend/modules/storage/protectedEntityFolder";
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

function assertNotStatusOrRoot(appRoot: string, fullPath: string) {
  const p = normalizePath(fullPath);

  if (p === appRoot) {
    throw new Error("Cannot trash the app root");
  }

  const forbidden = [`${appRoot}/pending`, `${appRoot}/published`, `${appRoot}/bin`];
  if (forbidden.includes(p)) {
    throw new Error("Cannot trash a status folder root");
  }

  if (p.startsWith(`${appRoot}/bin/.trash/`)) {
    throw new Error("Cannot trash an item already in trash storage");
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
  if (!info) throw new Error(`Fichier introuvable : ${path}`);
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

  throw new Error(`Unable to detect kind (file/folder) for: ${p}`);
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
}): Promise<TrashToBinOutput> {
  const { prisma, input } = params;
  const appRoot = input.appRoot;

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
      throw new Error(
        `Dossier protégé : « ${lastSegment(normalizePath(source.fullPath))} » est géré par une entité (groupe, espace perso, avatars) et ne peut pas être supprimé depuis le finder. Supprimez l'entité correspondante dans son gestionnaire.`,
      );
    }
  }

  // 🔒 Protection disciplines/catégories (DB-aware) : conteneur de catégorie,
  // sous-conteneur `new`, ou dossier de discipline → non supprimables depuis
  // le finder (passer par le gestionnaire de disciplines).
  for (const source of sources) {
    if (source.kind !== "folder") continue;
    const path = normalizePath(source.fullPath);
    if (await isProtectedDisciplineFolderPath(prisma, appRoot, path)) {
      throw new Error(
        `Dossier protégé : « ${lastSegment(path)} » correspond à une discipline ou une catégorie et ne peut pas être supprimé depuis le finder. Supprimez-la dans le gestionnaire de disciplines.`,
      );
    }
  }

  // 🔒 Fichier encore utilisé (page, galerie, documents des membres) : on refuse avant tout
  // déplacement, sinon le contenu afficherait un média cassé tant qu'il est dans la corbeille.
  await assertTrashDoesntRemoveUsedAssets(prisma, appRoot, sources);

  const results: TrashEntryDTO[] = [];

  for (const source of sources) {
    assertNotStatusOrRoot(appRoot, source.fullPath);

    // Interdit d'envoyer un contenu déjà dans bin/trash.
    const normalized = normalizePath(source.fullPath);
    if (normalized.startsWith(`${appRoot}/bin/`)) {
      throw new Error("Cannot trash an item already under appRoot/bin");
    }

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
        trashedAt: new Date(),
        sizeBytes,
        providerCreatedAt,
        mediaKind,
      },
    });

    // 3) Déplacement physique vers storageRoot
    if (source.kind === "file") {
      await r2MoveFile(normalized, storageRoot);
    } else {
      // ✅ trailing slash pour éviter les collisions de prefix
      await r2MoveFolder(`${normalized}/`, `${storageRoot}/`);

      // 4) Nettoyage registry DB des dossiers :
      //    Si tu jettes un dossier, il ne doit plus exister "à l'ancien endroit".
      //    Donc on supprime les Folder dont le fullPath est dans ce sous-arbre.
      //
      // ⚠️ Le sous-arbre, c'est le dossier LUI-MÊME et ce qui est SOUS LUI —
      // pas tout ce qui commence par les mêmes lettres. Un `startsWith`
      // nu sur `AKFC/pending/cours` emportait aussi les lignes de
      // `AKFC/pending/cours-avance`, qui n'a rien à voir avec lui.
      //
      // C'est la collision de préfixe contre laquelle le déplacement ci-dessus
      // se prémunit (« trailing slash pour éviter les collisions ») : même
      // protection côté DB.
      await prisma.folder.deleteMany({
        where: {
          appRoot,
          OR: [
            { fullPath: normalized },
            { fullPath: { startsWith: `${normalized}/` } },
          ],
        },
      });
    }

    results.push({
      id,
      appRoot,
      kind: source.kind,
      status: "IN_BIN",
      displayName,
      previousPath: normalized,
      previousPathShort: buildPreviousPathShort(normalized),
      trashedAt: new Date().toISOString(),
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