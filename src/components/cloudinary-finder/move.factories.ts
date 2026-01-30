import { FolderStatus } from "@/core/cloudinary/folder.types";

export type VirtualTarget = {
  type: 'virtual';
  kind: FolderStatus;
}

export type FolderTarget = {
  type: 'folder';
  fullPath: string;
}

export function virtualTarget(kind: FolderStatus): VirtualTarget {
  return {
    type: 'virtual',
    kind
  };
}

export function folderTarget(fullPath: string): FolderTarget {
  return {
    type: 'folder',
    fullPath
  };
}