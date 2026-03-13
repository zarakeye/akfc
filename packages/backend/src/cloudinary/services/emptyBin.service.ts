import { cloudinary } from "packages/backend/src/cloudinary/cloudinary.client";

type ResourceType = "image" | "video" | "raw";

/**
 * Supprime irréversiblement la corbeille (bin) pour le projet.
 *
 * @param {string} projectRoot - Root du projet Cloudinary
 * @returns {Promise<void>} - Promesse qui se résout lorsque la corbeille est vide
 */
export async function emptyBinService(projectRoot: string): Promise<void> {
  const binPrefix = `${projectRoot}/bin`;

  for (const resource_type of ["image", "video", "raw"] as const satisfies ResourceType[]) {
    await cloudinary.api.delete_resources_by_prefix(binPrefix, {
      type: "authenticated",
      resource_type,
    });
  }
}
