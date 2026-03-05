// src/server/cloudinary/cloudinary.delete.ts

import { cloudinary } from "../cloudinary.client";
import {
  isBin,
  isPendingOrPublished,
  moveToBin,
} from "./cloudinary.path";

/**
 * Deletes files from Cloudinary.
 *
 * Files are permanently deleted from Cloudinary storage and CDN and cannot be restored.
 * 
 * @param {string[]} publicIds - An array of publicIds to delete.
 * @throws {Error} If any of the publicIds is not valid.
 * @returns {Promise<void>} A promise that resolves when the files are deleted.
 */
export async function deleteFiles(publicIds: string[]): Promise<void> {
  for (const publicId of publicIds) {
    try {
      // 1️⃣ Déjà dans la corbeille → on ignore
      if (isBin(publicId)) continue;

      // 2️⃣ Sécurité : on ne touche qu'à pending / published
      if (!isPendingOrPublished(publicId)) {
        console.warn(
          `[Cloudinary] Refusing to delete non-managed file: ${publicId}`
        );
        continue;
      }

      const publicIdBin = moveToBin(publicId);

      // 3️⃣ On met dans la corbeille (Rename = déplacement dans la corbeille)
      await cloudinary.uploader.rename(
        publicId,
        publicIdBin,
        {
          resource_type: 'image',
          type: 'authenticated',
          overwrite: false,
          invalidate: true,
        }
      );

      // 4️⃣ On explicit
      await cloudinary.uploader.explicit(
        publicIdBin,
        {
          resource_type: 'image',
          type: 'authenticated',
          context: {
            back: publicId
          }
        }
      );
    } catch (error) {
      console.error(
        `[Cloudinary] Error deleting file: ${publicId}`,
        error
      );
    }
  }
}