import { FolderStatus } from "@/core/cloudinary/folder.types";
import { cloudinary } from "@server/cloudinary/cloudinary.client";
import { MoveIntent } from "@server/cloudinary/schemas/move.schema";

/**
 * Replace the status segment of a fullPath with a new status.
 *
 * @example
 * replaceStatusSegment("mon_app/pending/category/activity/img", "published") returns "mon_app/published/category/activity/img"
 *
 * @param fullPath The fullPath to modify.
 * @param nextStatus The new status to set.
 * @returns The modified fullPath.
 */
export function replaceStatusSegment(
  fullPath: string,
  nextStatus: FolderStatus
) {
  const parts = fullPath.split('/');

  if (parts.length < 2) {
    throw new Error(`Invalid fullPath: ${fullPath}`);
  }

  parts[1] = nextStatus;
  return parts.join('/');
}

/**
 * Move a file into a folder.
 *
 * @param filePath The full path of the file to move.
 * @param targetFolderPath The full path of the folder to move the file into.
 * @returns The full path of the file after moving it into the folder.
 */
export function moveFileIntoFolder(
  filePath: string,
  targetFolderPath: string
) {
  const fileName = filePath.split('/').pop();

  if (!fileName) {
    throw new Error(`Invalid filePath: ${filePath}`);
  }

  return `${targetFolderPath}/${fileName}`;
}

/**
 * Move a folder to a new prefix.
 *
 * @example
 * moveFolderPrefix("mon_app/pending/category/activity/img", "my_app") returns "my_app/pending/category/activity/img"
 *
 * @param {string} folderPath - The full path of the folder to move.
 * @param {string} targetPrefix - The new prefix to move the folder to.
 * @returns {string} - The full path of the folder after moving it to the new prefix.
 */
export function moveFolderPrefix(
  folderPath: string,
  targetPrefix: string
): string {
  const parts = folderPath.split('/');
  const [, , ...rest] = parts; // Skip app name and current status

  return `${targetPrefix}/${rest.join('/')}`;
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

