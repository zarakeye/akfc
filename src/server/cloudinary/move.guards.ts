import type { DragSource, MoveTarget } from "@/shared/cloudinary/move.types";

/**
 * Source
 */
export const isFileSource = (s:DragSource) => s.type === 'file';

export const isFolderSource = (s: DragSource) => s.type === 'folder';

/**
 * Target
 */
export const isFolderTarget = (t: MoveTarget) => t.type === 'folder';

export const isVirtualFolderTarget = (t: MoveTarget) => t.type === 'virtual-folder';

export const canMove = (
  source: DragSource,
  target: MoveTarget
): boolean => {
  // ❌ interdit : se dropper soi-même
  if (
    source.type === 'folder' &&
    target.type === 'folder' &&
    source.fullPath === target.fullPath
  ) {
    return false;
  }

  // ✅ File → Folder
  if (isFileSource(source) && isFolderTarget(target)) return true;

  // ✅ File → Virtual Folder
  if (isFileSource(source)&& isVirtualFolderTarget(target)) return true;

  // ✅ Folder → Folder
  if (isFolderSource(source) && isFolderTarget(target)) return true;

  // ✅ Folder → Virtual Folder
  if (isFolderSource(source) && isVirtualFolderTarget(target)) return true;

  return false;
};