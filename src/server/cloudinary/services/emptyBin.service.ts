import { cloudinary } from "@/server/cloudinary/cloudinary.client";

type ResourceType = "image" | "video" | "raw";

/**
 * Vide irréversiblement la corbeille (bin) pour le projet.
 * - Supporte authenticated
 * - Supprime image/video/raw
 *
 * ⚠️ IRRÉVERSIBLE
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
