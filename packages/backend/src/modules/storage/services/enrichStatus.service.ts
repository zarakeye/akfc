import type { PrismaClient } from "@prisma/client";
import type { StorageFileNode, StorageNode } from "@contracts/storage";

/**
 * Enrichissement du listing avec le statut de cycle de vie.
 *
 * Depuis l'aplatissement des chemins, le statut ne peut plus être dérivé du
 * path : il vit dans `MediaAsset.status`. Cette couche le rapatrie pour que
 * `meta.status` soit renseigné côté client (badge « en attente », filtres,
 * règle `isPickable`).
 *
 * Le match couvre les deux providers en une requête :
 *   - Cloudinary : `node.path` === `MediaAsset.publicId` (sans extension) ;
 *   - R2         : `node.path` === `MediaAsset.fullPath`.
 */

type LifecycleStatus = "pending" | "published" | "bin";

function isLifecycleStatus(value: string): value is LifecycleStatus {
  return value === "pending" || value === "published" || value === "bin";
}

async function statusByPath(
  prisma: PrismaClient,
  appRoot: string,
  paths: string[],
): Promise<Map<string, LifecycleStatus>> {
  const map = new Map<string, LifecycleStatus>();
  if (paths.length === 0) return map;

  const rows = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      OR: [{ publicId: { in: paths } }, { fullPath: { in: paths } }],
    },
    select: { publicId: true, fullPath: true, status: true },
  });

  for (const row of rows) {
    if (!isLifecycleStatus(row.status)) continue;
    // On indexe sur les DEUX clés : selon le provider, le node porte l'une
    // ou l'autre. Une clé absente (publicId null pour R2) est ignorée.
    if (row.publicId) map.set(row.publicId, row.status);
    if (row.fullPath) map.set(row.fullPath, row.status);
  }
  return map;
}

/** Pose `metadata.status` sur chaque fichier d'une liste plate. */
export async function enrichFilesWithStatus(
  prisma: PrismaClient,
  appRoot: string,
  files: ReadonlyArray<StorageFileNode>,
): Promise<void> {
  if (files.length === 0) return;
  const byPath = await statusByPath(
    prisma,
    appRoot,
    files.map((f) => f.path),
  );
  for (const file of files) {
    const status = byPath.get(file.path);
    if (status) {
      file.metadata = { ...(file.metadata ?? {}), status };
    }
  }
}

/** Même chose, en parcourant récursivement un arbre. */
export async function enrichTreeWithStatus(
  prisma: PrismaClient,
  appRoot: string,
  root: StorageNode,
): Promise<void> {
  const files: StorageFileNode[] = [];
  const walk = (node: StorageNode): void => {
    if (node.type === "file") {
      files.push(node);
      return;
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(root);
  await enrichFilesWithStatus(prisma, appRoot, files);
}
