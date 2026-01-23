import { v2 as cloudinary } from 'cloudinary';

/**
 * Supprime logiquement tous les fichiers d’un dossier virtuel
 * en les déplaçant vers la corbeille (bin).
 */
export async function deleteAll(path: string): Promise<void> {
  let nextCursor: string | undefined;

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      prefix: path,
      max_results: 100,
      next_cursor: nextCursor,
    });

    for (const resource of result.resources) {
      const originalPublicId = resource.public_id;

      const parts = originalPublicId.split('/');

      if (parts.length < 2) {
        throw new Error(`PublicId invalide : ${originalPublicId}`);
      }

      // insertion de "bin" après le prefix racine
      // mon_app/pending/... → mon_app/bin/pending/...
      const targetPublicId = [
        parts[0],
        'bin',
        ...parts.slice(1),
      ].join('/');

      await cloudinary.uploader.rename(
        originalPublicId,
        targetPublicId,
        {
          resource_type: 'image',
          overwrite: false,
          invalidate: true,
        }
      );

      // sauvegarde du back
      await cloudinary.uploader.explicit(targetPublicId, {
        type: 'upload',
        resource_type: 'image',
        context: {
          custom: {
            back: originalPublicId,
          },
        },
      });
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);
}