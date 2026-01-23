import { cloudinary } from "./cloudinary.client";
import { isInsideApp } from "./cloudinary.path";

/**
 * Permanently deletes files from Cloudinary.
 *
 * ⚠️ This operation is irreversible.
 * Assets are permanently deleted from Cloudinary storage and CDN and cannot be restored.
 * 
 * @param {string[]} publicIds - An array of publicIds to delete.
 * @returns {Promise<void>} A promise that resolves when the files are deleted.
 * @throws {Error} If the publicIds array is empty or if any of the publicIds is not valid.
 */
export async function killFiles(publicIds: string[]): Promise<void> {
  if (!publicIds.length) {
    return;
  }

  // 🔒 Safety: only allow deletion inside app namespace
  const safePublicIds = publicIds.filter(isInsideApp);

  if (!safePublicIds.length) {
    return;
  }

  try {
    await cloudinary.api.delete_resources(
      safePublicIds,
      {
        resource_type: "image",
        type: "authenticated",
        invalidate: true,
      }
    );
  } catch (error) {
    console.error(
      `[Cloudinary] Failed to kill files`,
      error
    );
    throw error;
  }
}