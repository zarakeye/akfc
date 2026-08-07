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

type ResolvedMeta = { status?: LifecycleStatus; human?: string };

async function metaByKey(
  prisma: PrismaClient,
  appRoot: string,
  keys: string[],
): Promise<Map<string, ResolvedMeta>> {
  const map = new Map<string, ResolvedMeta>();
  if (keys.length === 0) return map;

  const rows = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      OR: [{ publicId: { in: keys } }, { fullPath: { in: keys } }],
    },
    select: {
      publicId: true,
      fullPath: true,
      status: true,
      displayName: true,
      originalFileName: true,
    },
  });

  for (const row of rows) {
    // La cle de stockage (publicId) est desormais slugifiee : c'est ici qu'on
    // rend au finder le nom lisible. displayName cure sinon nom d'origine ;
    // l'extension/format est geree par les helpers d'affichage du front.
    const human = row.displayName?.trim() || row.originalFileName || undefined;
    const status = isLifecycleStatus(row.status) ? row.status : undefined;
    const meta: ResolvedMeta = { status, human };
    if (row.publicId) map.set(row.publicId, meta);
    if (row.fullPath) map.set(row.fullPath, meta);
  }
  return map;
}

/** Pose `metadata.status` ET le nom d'affichage humain sur chaque fichier. */
export async function enrichFilesWithStatus(
  prisma: PrismaClient,
  appRoot: string,
  files: ReadonlyArray<StorageFileNode>,
): Promise<void> {
  if (files.length === 0) return;

  const allKeys = files.flatMap(candidateKeys);
  const byKey = await metaByKey(prisma, appRoot, allKeys);

  for (const file of files) {
    for (const key of candidateKeys(file)) {
      const hit = byKey.get(key);
      if (hit) {
        if (hit.status) {
          file.metadata = { ...(file.metadata ?? {}), status: hit.status };
        }
        // Le `name` stocke est le slug ; on affiche le nom humain quand connu.
        if (hit.human) file.name = hit.human;
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
