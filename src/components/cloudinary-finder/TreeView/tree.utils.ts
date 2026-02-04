import { FolderNode } from "@/components/cloudinary-finder/types";

// 🔍 Est-ce un dossier ?
/**
 * Returns a unique key for a folder node, which is either its path if it's a real folder, or a virtual key if it's a virtual folder.
 *
 * @param node - The folder node to get the key for.
 * @returns A unique key for the folder node.
 */
export function getFolderKey(node: FolderNode): string {
  return node.fullPath;
}


/**
 * Builds an index of all folders in a tree, keyed by their path.
 * This index can be used to quickly look up a folder node by its path.
 *
 * @param root - The root folder node of the tree to build the index from.
 * @returns A Map of folder nodes, keyed by their path.
 */
export function buildFolderIndex(root: FolderNode): Map<string, FolderNode> {
  const map = new Map<string, FolderNode>();

  function walk(node: FolderNode) {
    map.set(node.fullPath, node); // Add the path to the map with the folder node

    for (const child of node.children) {
      if (child.type === 'folder') {
        walk(child);
      }
    }
  }

  walk(root);

  return map;
}

