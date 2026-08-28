import type { PrismaClient } from "@prisma/client";

import type { StorageFolderNode, StorageNode } from "@contracts/storage";

/**
 * Renomme les dossiers d'ESPACE DE GROUPE avec le nom EXACT du groupe en base
 * (accents/casse d'origine), au lieu du segment technique `<slug>-<cuid>`.
 *
 * Le CHEMIN reste intact (`…/groups/<slug>-<cuid>` = identité de stockage) ;
 * seul le `name` affiché change. Clé = cuid, stable même si le groupe est
 * renommé (le slug du chemin peut être périmé, le nom retourné reste courant).
 *
 * Appliqué côté listing (`getTree` + `list`) : toutes les vues du finder en
 * profitent, et `friendlySpaceFolderLabel` (front) devient un no-op.
 *
 * Ne couvre QUE les espaces de groupe ; les espaces perso gardent le repli
 * front (à étendre avec une map userId → nom si besoin).
 */

const GROUP_SPACE_RE = /\/groups\/[^/]+-(c[a-z0-9]{24})$/;

function hasGroupSpace(node: StorageNode): boolean {
  if (node.type === "folder") {
    if (GROUP_SPACE_RE.test(node.path)) return true;
    return (node.children ?? []).some(hasGroupSpace);
  }
  return false;
}

async function groupNameByCuid(
  prisma: PrismaClient,
): Promise<Map<string, string>> {
  const groups = await prisma.memberGroup.findMany({
    select: { id: true, name: true },
  });
  return new Map(groups.map((g) => [g.id, g.name] as const));
}

function renamed(
  node: StorageFolderNode,
  names: Map<string, string>,
): StorageFolderNode {
  const m = node.path.match(GROUP_SPACE_RE);
  if (!m) return node;
  const exact = names.get(m[1]);
  return exact ? { ...node, name: exact } : node;
}

/** Renomme les dossiers de groupe d'une liste plate (résultat de `list`). */
export async function applyGroupSpaceNamesToFolders(
  folders: ReadonlyArray<StorageFolderNode>,
  prisma: PrismaClient,
): Promise<StorageFolderNode[]> {
  if (!folders.some((f) => GROUP_SPACE_RE.test(f.path))) return [...folders];
  const names = await groupNameByCuid(prisma);
  return folders.map((f) => renamed(f, names));
}

/** Renomme récursivement les dossiers de groupe d'un arbre (résultat de `getTree`). */
export async function applyGroupSpaceNamesToTree(
  root: StorageFolderNode,
  prisma: PrismaClient,
): Promise<StorageFolderNode> {
  if (!hasGroupSpace(root)) return root;
  const names = await groupNameByCuid(prisma);
  const walk = (node: StorageNode): StorageNode => {
    if (node.type !== "folder") return node;
    const r = renamed(node, names);
    if (!node.children) return r;
    return { ...r, children: node.children.map(walk) };
  };
  return walk(root) as StorageFolderNode;
}
