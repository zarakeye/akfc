import type {
  CloudinaryFolderNode,
  CloudinaryNode,
  CloudinaryFileNode,
} from "@workspace/contracts/src/cloudinary/tree.contract.v1";

import type {
  FolderNode,
  FileNode,
} from "@workspace/contracts/src/cloudinary/finder.types";

export function mapCloudinaryFolderToClient(
  folder: CloudinaryFolderNode
): FolderNode {
  return {
    type: "folder",
    fullPath: folder.path,
    name: folder.name,
    children: folder.children.map(mapCloudinaryNodeToClient),
  };
}

export function mapCloudinaryFileToClient(
  file: CloudinaryFileNode
): FileNode {
  return {
    type: "file",
    name: file.name,
    fullPath: file.publicId,
    publicId: file.publicId,
  };
}

export function mapCloudinaryNodeToClient(
  node: CloudinaryNode
): FolderNode | FileNode {
  return node.type === "folder"
    ? mapCloudinaryFolderToClient(node)
    : mapCloudinaryFileToClient(node);
}