import { FolderStatus } from "@/core/cloudinary/folder.types";
import { MoveIntent } from "@server/cloudinary/schemas/move.schema";

/**
 * Replaces the status segment of a Cloudinary path with a new status.
 *
 * @param {string} fullPath - The Cloudinary path to modify.
 * @param {FolderStatus} newStatus - The new status to set.
 * @returns {string} - The modified Cloudinary path.
 * @throws {Error} - If the input path is invalid (less than 2 parts).
 */
export function replaceStatusSegment(
  fullPath: string,
  newStatus: FolderStatus
): string {
  const parts = fullPath.split('/');

  if (parts.length < 2) {
    throw new Error(`Invalid Cloudinary path: ${fullPath}`);
  }

  // part[0] = app name
  // part[1] = status segment
  parts[1] = newStatus;
  return parts.join('/');
}

/**
 * Move a file into a folder.
 *
 * @param {string} filePath - The full path of the file to move.
 * @param {string} folderPath - The full path of the folder to move the file into.
 * @returns {string} - The full path of the file after moving it into the folder.
 * @throws {Error} - If the filePath is invalid.
 */
export function moveFileIntoFolder(
  filePath: string,
  folderPath: string
): string {
  const fileName = filePath.split('/').pop();

  if (!fileName) {
    throw new Error(`Invalid filePath: ${filePath}`);
  }

  return `${folderPath}/${fileName}`;
}

/**
 * Returns a virtual target with the given kind.
 *
 * @example
 * virtualTarget("published") returns { type: "virtual", kind: "published" }
 *
 * @param {FolderKind} kind - The kind of the virtual target.
 * @returns {Object} - A virtual target with the given kind.
 */
export function virtualTarget(status: FolderStatus): { type: 'virtual'; status: FolderStatus } {
  return { type: 'virtual', status } as const;
}

/**
 * Returns a folder target with the given fullPath.
 *
 * @example
 * folderTarget("mon_app/pending/category/activity/img") returns { type: "folder", fullPath: "mon_app/pending/category/activity/img" }
 *
 * @param {string} fullPath - The full path of the folder.
 * @returns {Object} - A folder target with the given fullPath.
 */
export function folderTarget(fullPath: string): { type: 'folder'; fullPath: string } {
  return { type: 'folder', fullPath } as const;
}

/**
 * Creates a MoveIntent object based on the given source and target.
 *
 * The source object should have a 'type' property with a value of either 'file' or 'folder', and a 'fullPath' property with the full path of the source file or folder.
 *
 * The target object should be a valid MoveIntent['target'] object.
 *
 * @param {Object} source - The source file or folder.
 * @param {Object} target - The target folder.
 * @returns {Object} - A MoveIntent object with the given source and target.
 */
export function makeMoveIntent(
  source: { type: 'file' | 'folder'; fullPath: string },
  target: MoveIntent['target']
): MoveIntent {
  return source.type === 'file'
    ? {
        source: { type: 'file', fullPath: source.fullPath },
        target,
      }
    : {
        source: { type: 'folder', fullPath: source.fullPath },
        target,
      };
}

