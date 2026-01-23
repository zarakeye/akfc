import { v2 as cloudinary } from 'cloudinary';

/**
 * Supprime définitivement tous les fichiers Cloudinary
 * dont le public_id commence par le path donné.
 *
 * ⚠️ Action irréversible.
 */
export async function killAll(path: string): Promise<void> {
  let nextCursor: string | undefined;

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: path,
      max_results: 500,
      next_cursor: nextCursor,
    });

    const publicIds: string[] = result.resources.map(
      (resource: { public_id: string }) => resource.public_id
    );

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds, {
        resource_type: 'image', // ou 'raw' / 'video' si besoin
      });
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);
}