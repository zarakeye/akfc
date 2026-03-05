import type {
  CloudinaryFolderNode,
  CloudinaryNode,
  CloudinaryFileNode,
} from "@server/contracts/cloudinary/tree.contract.v1";

import type {
  FolderNode,
  FileNode,
} from "@/features/cloudinary-finder/model/explorer/finder-ui.types";

/**
 * Maps a CloudinaryFolderNode to a FolderNode.
 *
 * @param folder - The CloudinaryFolderNode to map.
 * @returns - A FolderNode representing the mapped folder.
 */
export function mapCloudinaryFolderToClient(
  folder: CloudinaryFolderNode
): FolderNode {
  return {
    type: "folder",
    fullPath: folder.path, // 🔑 unifié
    name: folder.name,
    children: folder.children.map(mapCloudinaryNodeToClient),
  };
}

/**
 * Maps a CloudinaryFileNode to a FileNode.
 *
 * @param file - The CloudinaryFileNode to map.
 * @returns - A FileNode representing the mapped file.
 */
export function mapCloudinaryFileToClient(
  file: CloudinaryFileNode
): FileNode {
  return {
    type: "file",
    name: file.name,
    fullPath: file.publicId, // 🔑 publicId devient fullPath
    url: file.url,
  };
}

/**
 * Maps a CloudinaryNode to a FolderNode or FileNode.
 *
 * @param node - The CloudinaryNode to map.
 * @returns - A FolderNode or FileNode representing the mapped node.
 */
export function mapCloudinaryNodeToClient(
  node: CloudinaryNode
): FolderNode | FileNode {
  return node.type === "folder"
    ? mapCloudinaryFolderToClient(node)
    : mapCloudinaryFileToClient(node);
}