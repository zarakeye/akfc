import { deleteByPrefix } from "@workspace/backend/modules/cloudinary/services/cloudinary.service";

/**
 * Supprime irréversiblement la corbeille (bin) pour le projet.
 *
 * @param {string} projectRoot - Root du projet Cloudinary
 * @returns {Promise<void>} - Promesse qui se résout lorsque la corbeille est vide
 */
export async function emptyBinService(projectRoot: string): Promise<void> {
  const binPrefix = `${projectRoot}/bin`;
  await deleteByPrefix(binPrefix);
}
