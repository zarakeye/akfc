import { v2 as cloudinary } from "cloudinary";

type MoveFileArgs = {
  publicId: string;
  from: string;
  to: string;
};

/**
 * Move a file from one folder to another.
 * @param {MoveFileArgs} - The arguments for the moveFile function.
 * @param {string} publicId - The public id of the file to move.
 * @param {string} from - The current folder path of the file.
 * @param {string} to - The new folder path of the file.
 * @returns {Promise<void>} - A promise that resolves when the file has been moved.
 */
export async function moveFile({
  publicId,
  from,
  to,
}: MoveFileArgs): Promise<void> {
  const fileName = publicId.split("/").pop();
  
  if (!fileName) {
    throw new Error(`Invalid publicId: ${publicId}`);
  }

  const targetFolder = from.replace(/\/[^/]+$/, `/${to}`);
  const fromPublicId = `${from}/${fileName}`;
  const toPublicId = `${targetFolder}/${fileName}`;

  return cloudinary.uploader.rename(
    fromPublicId,
    toPublicId,
    {
      overwrite: true,
      invalidate: true,
    }
  );
}