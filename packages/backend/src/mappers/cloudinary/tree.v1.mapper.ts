import type {
  CloudinaryFolderNode,
  CloudinaryNode,
  CloudinaryFileNode,
} from "@contracts/cloudinary/tree.contract.v1";

import type {
  FolderNode,
  FileNode,
} from "@contracts/cloudinary/finder.types";

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

function resolveKind(format?: string): 'image' | 'video' | 'document' {
  if (!format) return 'document';

  if (/jpg|jpeg|png|webp|avif/.test(format)) return 'image';

  if (/mp4|webm|mov/.test(format)) return 'video';

  return 'document';
}

export function mapCloudinaryFileToClient(
  file: CloudinaryFileNode
): FileNode {
  return {
    type: "file",
    name: file.name,
    fullPath: file.publicId,
    publicId: file.publicId,
    url: file.url,
    format: file.format,
    kind: resolveKind(file.format),
  };
}

export function mapCloudinaryNodeToClient(
  node: CloudinaryNode
): FolderNode | FileNode {
  return node.type === "folder"
    ? mapCloudinaryFolderToClient(node)
    : mapCloudinaryFileToClient(node);
}