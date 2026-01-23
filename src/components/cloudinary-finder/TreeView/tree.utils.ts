import { FolderNode, TreeNode, VirtualFolderNode } from "../types";

// 🔍 Est-ce un dossier ?
/**
 * Returns a unique key for a folder node, which is either its path if it's a real folder, or a virtual key if it's a virtual folder.
 *
 * @param node - The folder node to get the key for.
 * @returns A unique key for the folder node.
 */
export function getFolderKey(node: FolderNode | VirtualFolderNode): string {
  return node.type === 'folder'
    ? node.path
    : `__virtual__/${node.kind}`;
}

export function buildFolderIndex(root: FolderNode): Map<string, FolderNode> {
  const map = new Map<string, FolderNode>();

  function walk(node: FolderNode) {
    map.set(node.path, node); // Add the path to the map with the folder node

    for (const child of node.children) {
      if (child.type === 'folder') {
        walk(child);
      }
    }
  }

  walk(root);

  return map;
}