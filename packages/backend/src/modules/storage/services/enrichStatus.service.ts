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
 * ─── Clés interrogées ──────────────────────────────────────────────────────
 *
 * Le `path` d'un node est la clé R2, AVEC extension. Par tolérance héritée,
 * on interroge aussi le chemin suffixé de son `format` (sans effet quand le
 * chemin porte déjà son extension), et on résout dans le même ordre.
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

type ResolvedMeta = { status?: LifecycleStatus; human?: string; uploaderName?: string };

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
      fullPath: { in: keys },
    },
    select: {
      fullPath: true,
      status: true,
      displayName: true,
      originalFileName: true,
      uploaderUserId: true,
    },
  });

  // Résolution batchée des noms d'expéditeur (un lookup pour tout le lot).
  const uploaderIds = [
    ...new Set(rows.map((r) => r.uploaderUserId).filter(Boolean)),
  ] as string[];
  const users = uploaderIds.length
    ? await prisma.user.findMany({
        where: { id: { in: uploaderIds } },
        select: { id: true, firstName: true, lastName: true, pseudo: true },
      })
    : [];
  const nameById = new Map(
    users.map((u) => [
      u.id,
      [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
        u.pseudo ||
        "Utilisateur",
    ]),
  );

  for (const row of rows) {
    // La cle de stockage est slugifiee : c'est ici qu'on
    // rend au finder le nom lisible. displayName cure sinon nom d'origine ;
    // l'extension/format est geree par les helpers d'affichage du front.
    const human = row.displayName?.trim() || row.originalFileName || undefined;
    const status = isLifecycleStatus(row.status) ? row.status : undefined;
    const uploaderName = row.uploaderUserId
      ? nameById.get(row.uploaderUserId)
      : undefined;
    const meta: ResolvedMeta = { status, human, uploaderName };
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
        if (hit.status || hit.uploaderName) {
          file.metadata = {
            ...(file.metadata ?? {}),
            ...(hit.status ? { status: hit.status } : {}),
            ...(hit.uploaderName ? { uploaderName: hit.uploaderName } : {}),
          };
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
