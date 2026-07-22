import type { PrismaClient } from "@prisma/client";
import type { StorageFileNode, StorageNode } from "@contracts/storage";

/**
 * Enrichissement du listing avec le statut de cycle de vie.
 *
 * Depuis l'aplatissement des chemins, le statut ne peut plus être dérivé du
 * path : il vit dans `MediaAsset.status`. Cette couche le rapatrie pour que
 * `meta.status` soit renseigné côté client (pastille de statut, filtres,
 * règle `isPickable`).
 *
 * ─── Le point délicat : deux conventions de clé ────────────────────────────
 *
 * Le `path` d'un node est ce que le provider expose :
 *   - Cloudinary image/vidéo : le public_id, SANS extension
 *       node.path = "AKFC/cours/x/photo"
 *   - Cloudinary raw et R2   : le chemin complet, AVEC extension
 *       node.path = "AKFC/general/doc.pdf"
 *
 * En base, `publicId` et `fullPath` portent l'extension dans les deux cas.
 * On interroge donc avec DEUX clés par fichier — le chemin nu et le chemin
 * suffixé de son `format` — et on résout dans le même ordre.
 */

type LifecycleStatus = "pending" | "published" | "bin";

function isLifecycleStatus(value: string): value is LifecycleStatus {
  return value === "pending" || value === "published" || value === "bin";
}

/** Les clés sous lesquelles ce fichier peut être connu en base. */
function candidateKeys(file: StorageFileNode): string[] {
  const keys = [file.path];
  const format = file.metadata?.format?.toLowerCase();
  if (format && !file.path.toLowerCase().endsWith(`.${format}`)) {
    keys.push(`${file.path}.${format}`);
  }
  return keys;
}

async function statusByKey(
  prisma: PrismaClient,
  appRoot: string,
  keys: string[],
): Promise<Map<string, LifecycleStatus>> {
  const map = new Map<string, LifecycleStatus>();
  if (keys.length === 0) return map;

  const rows = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      OR: [{ publicId: { in: keys } }, { fullPath: { in: keys } }],
    },
    select: { publicId: true, fullPath: true, status: true },
  });

  for (const row of rows) {
    if (!isLifecycleStatus(row.status)) continue;
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

  const allKeys = files.flatMap(candidateKeys);
  const byKey = await statusByKey(prisma, appRoot, allKeys);

  for (const file of files) {
    for (const key of candidateKeys(file)) {
      const status = byKey.get(key);
      if (status) {
        file.metadata = { ...(file.metadata ?? {}), status };
        break;
      }
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
