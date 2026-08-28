import type { PrismaClient } from "@prisma/client";

import type { StorageFolderNode, StorageNode } from "@contracts/storage";

/**
 * Résout le NOM AFFICHÉ des dossiers dans le listing, sans jamais toucher au
 * chemin (identité de stockage). Priorité :
 *
 *   1. FolderLabel[path]   — libellé explicite édité par un admin (découplage).
 *   2. memberGroup.name    — pour un espace de groupe `…/groups/<slug>-<cuid>`.
 *   3. nom brut            — repli ; le front title-case le slug si besoin.
 *
 * Appliqué côté `list` (liste plate) et `getTree` (récursif) → toutes les vues
 * du finder et le picker en profitent.
 */

const GROUP_SPACE_RE = /\/groups\/[^/]+-(c[a-z0-9]{24})$/;

type NameMaps = {
  labelByPath: Map<string, string>;
  groupNameByCuid: Map<string, string>;
};

function treeHasGroupSpace(node: StorageNode): boolean {
  if (node.type !== "folder") return false;
  if (GROUP_SPACE_RE.test(node.path)) return true;
  return (node.children ?? []).some(treeHasGroupSpace);
}

async function loadNameMaps(
  prisma: PrismaClient,
  needGroups: boolean,
): Promise<NameMaps> {
  const [labels, groups] = await Promise.all([
    prisma.folderLabel.findMany({ select: { path: true, displayName: true } }),
    needGroups
      ? prisma.memberGroup.findMany({ select: { id: true, name: true } })
      : Promise.resolve([] as { id: string; name: string }[]),
  ]);
  return {
    labelByPath: new Map(labels.map((l) => [l.path, l.displayName] as const)),
    groupNameByCuid: new Map(groups.map((g) => [g.id, g.name] as const)),
  };
}

function displayNameFor(node: StorageFolderNode, maps: NameMaps): string {
  const label = maps.labelByPath.get(node.path);
  if (label) return label;
  const m = node.path.match(GROUP_SPACE_RE);
  if (m) {
    const g = maps.groupNameByCuid.get(m[1]);
    if (g) return g;
  }
  return node.name;
}

/** Résout les libellés d'une liste plate (résultat de `list`). */
export async function applyGroupSpaceNamesToFolders(
  folders: ReadonlyArray<StorageFolderNode>,
  prisma: PrismaClient,
): Promise<StorageFolderNode[]> {
  const maps = await loadNameMaps(
    prisma,
    folders.some((f) => GROUP_SPACE_RE.test(f.path)),
  );
  if (maps.labelByPath.size === 0 && maps.groupNameByCuid.size === 0) {
    return [...folders];
  }
  return folders.map((f) => {
    const name = displayNameFor(f, maps);
    return name === f.name ? f : { ...f, name };
  });
}

/** Résout récursivement les libellés d'un arbre (résultat de `getTree`). */
export async function applyGroupSpaceNamesToTree(
  root: StorageFolderNode,
  prisma: PrismaClient,
): Promise<StorageFolderNode> {
  const maps = await loadNameMaps(prisma, treeHasGroupSpace(root));
  if (maps.labelByPath.size === 0 && maps.groupNameByCuid.size === 0) {
    return root;
  }
  const walk = (node: StorageNode): StorageNode => {
    if (node.type !== "folder") return node;
    const name = displayNameFor(node, maps);
    const r = name === node.name ? node : { ...node, name };
    if (!node.children) return r;
    return { ...r, children: node.children.map(walk) };
  };
  return walk(root) as StorageFolderNode;
}
