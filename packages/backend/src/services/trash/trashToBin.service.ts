import type { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

import { cloudinary } from "packages/backend/src/cloudinary/cloudinary.client";
import type { TrashToBinInput, TrashToBinOutput } from "packages/contracts/src/trash/trash.mutations";
import type { TrashEntryDTO } from "packages/contracts/src/trash/trash.dto";

import { buildPreviousPathShort, normalizePath, bigIntToSafeNumber } from "./trash.utils";

/**
 * trashToBin.service.ts
 *
 * Ticket 3 : envoyer du contenu vers la corbeille.
 *
 * Design validé :
 * - Bin est une liste plate (pas de structure parent conservée).
 * - Le stockage Cloudinary réel est caché : `${appRoot}/bin/.trash/<uuid>/...`.
 * - On crée une TrashEntry avec :
 *   - previousPath (tooltip + restore cible)
 *   - displayName (nom affiché dans le bin)
 *   - storageRoot (prefix réel caché)
 *   - sizeBytes (somme bytes du sous-arbre / fichier)
 *   - cloudinaryCreatedAt (max created_at)
 *
 * IMPORTANT :
 * - Aucune action ne doit toucher à `.trash` en dehors du trashRouter.
 * - Ce service NE fait que "normal -> bin".
 */

type CloudinaryResourceType = "image" | "video" | "raw";

type ListedAsset = {
  public_id: string;
  resource_type: CloudinaryResourceType;
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

async function getAssetInfo(publicId: string): Promise<{ resource_type: CloudinaryResourceType; bytes?: number; created_at?: string }>
{
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const res = await cloudinary.api.resource(publicId, {
        type: "authenticated",
        resource_type: rt,
      });
      if (res?.public_id) {
        return {
          resource_type: rt,
          bytes: typeof res.bytes === "number" ? res.bytes : undefined,
          created_at: res.created_at ? String(res.created_at) : undefined,
        };
      }
    } catch {
      // try next
    }
  }

  throw new Error(`Asset not found (any resource_type): ${publicId}`);
}

async function listAssetsByPrefix(prefix: string): Promise<ListedAsset[]> {
  const out: ListedAsset[] = [];

  for (const rt of ["image", "video", "raw"] as const) {
    let nextCursor: string | undefined;

    do {
      const res = await cloudinary.api.resources({
        type: "authenticated",
        resource_type: rt,
        prefix,
        max_results: 500,
        next_cursor: nextCursor,
      });

      for (const asset of res.resources ?? []) {
        out.push({
          public_id: asset.public_id as string,
          resource_type: rt,
          bytes: typeof asset.bytes === "number" ? asset.bytes : undefined,
          created_at: asset.created_at ? String(asset.created_at) : undefined,
        });
      }

      nextCursor = res.next_cursor;
    } while (nextCursor);
  }

  return out;
}

async function renameAsset(from: string, to: string, resourceType: CloudinaryResourceType) {
  await cloudinary.uploader.rename(from, to, {
    type: "authenticated",
    resource_type: resourceType,
    overwrite: true,
  });
}

async function moveFolderRecursively(sourcePrefix: string, targetPrefix: string) {
  for (const rt of ["image", "video", "raw"] as const) {
    let nextCursor: string | undefined;

    do {
      const res = await cloudinary.api.resources({
        type: "authenticated",
        resource_type: rt,
        prefix: sourcePrefix,
        max_results: 500,
        next_cursor: nextCursor,
      });

      for (const asset of res.resources ?? []) {
        const newPublicId = String(asset.public_id).replace(sourcePrefix, targetPrefix);
        await renameAsset(String(asset.public_id), newPublicId, rt);
      }

      nextCursor = res.next_cursor;
    } while (nextCursor);
  }
}

async function detectKind(params: { prisma: PrismaClient; appRoot: string; fullPath: string }):
  Promise<"folder" | "file"> {
  const { prisma, appRoot, fullPath } = params;
  const p = normalizePath(fullPath);

  // 1) Si on a un registre folder DB, c'est un folder.
  const folder = await prisma.cloudinaryFolder.findFirst({
    where: { appRoot, fullPath: p },
    select: { id: true },
  });
  if (folder) return "folder";

  // 2) Si Cloudinary connaît la ressource exacte => file.
  try {
    await getAssetInfo(p);
    return "file";
  } catch {
    // continue
  }

  // 3) Si on a au moins un asset sous prefix => folder.
  const assets = await listAssetsByPrefix(`${p}/`);
  if (assets.length > 0) return "folder";

  throw new Error(`Unable to detect kind (file/folder) for: ${p}`);
}

function computeAggregateFromAssets(assets: Array<{ bytes?: number; created_at?: string }>): {
  sizeBytes?: bigint;
  cloudinaryCreatedAt?: Date;
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
    cloudinaryCreatedAt: maxCreated ?? undefined,
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

    // 1) Calcul des agrégats (sizeBytes + createdAt)
    let sizeBytes: bigint | undefined;
    let cloudinaryCreatedAt: Date | undefined;

    if (source.kind === "file") {
      const info = await getAssetInfo(normalized);
      sizeBytes = typeof info.bytes === "number" ? BigInt(info.bytes) : undefined;
      cloudinaryCreatedAt = info.created_at ? new Date(info.created_at) : undefined;
    } else {
      // ✅ trailing slash pour éviter les collisions de prefix (ex: cours1 vs cours10)
      const assets = await listAssetsByPrefix(`${normalized}/`);
      const agg = computeAggregateFromAssets(assets);
      sizeBytes = agg.sizeBytes;
      cloudinaryCreatedAt = agg.cloudinaryCreatedAt;
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
        cloudinaryCreatedAt,
      },
    });

    // 3) Déplacement Cloudinary vers storageRoot
    if (source.kind === "file") {
      const info = await getAssetInfo(normalized);
      await renameAsset(normalized, storageRoot, info.resource_type);
    } else {
      // ✅ trailing slash pour éviter les collisions de prefix
      await moveFolderRecursively(`${normalized}/`, `${storageRoot}/`);

      // 4) Nettoyage registry DB des dossiers :
      //    Si tu jettes un dossier, il ne doit plus exister "à l'ancien endroit".
      //    Donc on supprime les CloudinaryFolder dont le fullPath est dans ce sous-arbre.
      await prisma.cloudinaryFolder.deleteMany({
        where: {
          appRoot,
          fullPath: {
            startsWith: normalized,
          },
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
      createdAt: cloudinaryCreatedAt ? cloudinaryCreatedAt.toISOString() : undefined,
    });
  }

  return {
    trashed: results,
    message: `${results.length} item(s) moved to bin`,
  };
}
