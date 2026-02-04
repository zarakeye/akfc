import {
  TreeNode,
  FolderNode,
  FileNode,
  BaseNode,
} from "@/components/cloudinary-finder/types";

/**
 * Checks if a TreeNode is a FolderNode or a VirtualFolderNode.
 *
 * @param node - The TreeNode to check.
 * @returns True if the node is a FolderNode or a VirtualFolderNode, false otherwise.
 */
export function isFolderNode(node: TreeNode): node is FolderNode {
  return node.type === "folder";
}

// 🔍 Est-ce un fichier ?
export function isFileNode(node: TreeNode): node is FileNode {
  return node.type === "file";
}

/**
 * Vérifie qu'un node existe et est un Folder
 * (utile quand on part d'un find / optional)
 */
export function isDefinedFolderNode(
  node: TreeNode | undefined
): node is FolderNode {
  return node !== undefined && node.type === 'folder';
}

/**
 * Vérifie qu'un node existe (base commune)
 */
export function isDefinedNode(
  node: BaseNode | undefined
): node is BaseNode {
  return node !== undefined;
}