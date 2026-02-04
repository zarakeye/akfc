import { cloudinary } from '@/server/cloudinary/cloudinary.client';
import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import {
  replaceStatusSegment,
  moveFileIntoFolder,
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

  console.log('Executing move intent:', intent);

  // 🔹 FILE / FOLDER → VIRTUAL
  if (target.type === 'virtual-folder') {
    const newPrefix = replaceStatusSegment(
      source.fullPath,
      target.status
    );

    if (source.type === 'file') {
      await renameAsset(
        source.fullPath,
        newPrefix
      );
    } else {
      await moveFolderRecursively(
        source.fullPath, 
        newPrefix
      );
    }

    return;
  }

  // 🔹 FILE / FOLDER → FOLDER
  if (target.type === 'folder') {
    if (source.type === 'file') {
      const newPath = moveFileIntoFolder(
        source.fullPath,
        target.fullPath
      );

      await renameAsset(
        source.fullPath,
        newPath
      );
    } else {
      const folderName = source.fullPath.split('/').pop();

      if (!folderName) return;

      const targetPrefix = `${target.fullPath}/${folderName}`;

      await moveFolderRecursively(
        source.fullPath,
        targetPrefix
      );
    }

    return;
  }

  throw new Error('Invalid move intent');
}

/**
 * Renames an asset on Cloudinary.
 * @param from - The public ID of the asset to rename.
 * @param to - The new public ID of the asset.
 * @returns A promise that resolves when the asset has been renamed.
 */
async function renameAsset(
  from: string,
  to: string
) {
  await cloudinary.uploader.rename(
    from,
    to,
    {
      type: 'authenticated',
      overwrite: true
    }
  );
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
  let nextCursor: string | undefined;

  do {
    const res = await cloudinary.api.resources({
      type: 'authenticated',
      prefix: sourcePrefix,
      max_results: 500,
      next_cursor: nextCursor,
    });

    for (const asset of res.resources) {
      const newPubicId = asset.public_id.replace(
        sourcePrefix,
        targetPrefix
      );

      await renameAsset(
        asset.public_id,
        newPubicId
      );
    }

    nextCursor = res.next_cursor;
  } while (nextCursor);
}