import { cloudinary } from '@/server/cloudinary/cloudinary.client';
import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import {
  replaceStatusSegment,
  moveFileIntoFolder,
  moveFolderPrefix,
} from '@server/cloudinary/utils/cloudinary.utils';

/**
 * Execute a move intent.
 *
 * This function takes a move intent object and executes the corresponding move operation.
 *
 * It supports the following move operations:
 * - FILE → VIRTUAL
 * - FILE → FOLDER
 * - FOLDER → VIRTUAL
 * - FOLDER → FOLDER
 *
 * If the move intent is invalid, it throws an error.
 *
 * @param {MoveIntent} intent - The move intent to execute.
 * @returns {Promise<void>} - A promise that resolves when the move operation is complete.
 */
export async function moveService(intent: MoveIntent): Promise<void> {
  const { source, target } = intent;

  // 🔹 FILE → VIRTUAL
  if (target.type === 'virtual') {
    const newFullPath = replaceStatusSegment(source.fullPath, target.status);

    if (source.type === 'file') {
      await cloudinary.uploader.rename(source.fullPath, newFullPath, { overwrite: true });
    } else {
      await moveFolderRecursively(source.fullPath, newFullPath);
    }

    return;
  }

  // 🔹 FILE → FOLDER
  if (target.type === 'folder') {
    if (source.type === 'file') {
      const newFullPath = moveFileIntoFolder(source.fullPath, target.fullPath);
      await cloudinary.uploader.rename(source.fullPath, newFullPath, { overwrite: true });
    } else {
      moveFolderPrefix(
        source.fullPath,
        `${target.fullPath}/${source.fullPath.split('/').pop()}`
      );
    }
  }

  throw new Error('Invalid move intent');
}

/**
 * Recursively moves all assets under a folder prefix.
 * Move all assets in a given folder to a new folder.
 *
 * @param sourcePrefix - The prefix of the folder to move.
 * @param targetPrefix - The prefix of the folder to move to.
 */
async function moveFolderRecursively(
  sourcePrefix: string,
  targetPrefix: string
) {
  const resources = await cloudinary.api.resources({
    type: 'upload',
    prefix: sourcePrefix,
    max_results: 500,
  });

  for (const asset of resources.resources) {
    const newPath = asset.public_id.replace(sourcePrefix, targetPrefix);

    await cloudinary.uploader.rename(asset.public_id, newPath, { overwrite: true });
  }
}