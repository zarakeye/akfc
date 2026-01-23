import { cloudinary } from "./cloudinary.client";
import { isBin, isInsideApp } from "./cloudinary.path";

/**
 * Restores files from the `bin` folder to their original location.
 * 
 * Restoration relies exclusively on Cloudinary metadata:
 * - context.back must contain the original public_id
 * 
 * Files without a valid `back` reference are ignored.
 */
export async function restoreFiles(
  publicIds: string[],
): Promise<void> {
  for (const publicId of publicIds) {
    try {
      // 1️⃣ Only restore files from bin
      if (!isBin(publicId)) {
        continue;
      }

      // 2️⃣ Fetch metadata to retrieve `back`
      const resource = await cloudinary.api.resource(
        publicId,
        {
          resource_type: "image",
          type: "authenticated",
          context: true,
        }
      );

      const backPublicId: string | undefined = resource.context.back;

      if (!backPublicId) {
        console.warn(
          `[Cloudinary] No back reference found for ${publicId}`
        );
        continue;
      }

      // 3️⃣ Safety check: restore only inside app namespace
      if (!isInsideApp(backPublicId)) {
        console.warn(
          `[Cloudinary] Invalid back reference for ${publicId}: ${backPublicId}`
        );
        continue;
      }

      // 4️⃣ Restore via rename
      await cloudinary.uploader.rename(
        publicId,
        backPublicId,
        {
          resource_type: "image",
          type: "authenticated",
          overwrite: false,
        }
      );

      // 5️⃣ Clean metadata (remove `back`)
      await cloudinary.uploader.explicit(
        backPublicId,
        {
          type: "authenticated",
          resource_type: "image",
          context: {
            back: null,
          },
        }
      );
    } catch (err) {
      console.error(
        `[Cloudinary] Failed to restore ${publicId}`,
        err
      );
    }
  }
}