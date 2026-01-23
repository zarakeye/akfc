import { v2 as cloudinary } from 'cloudinary';

/**
 * Restaure tous les fichiers contenus dans un dossier virtuel de la corbeille
 * en utilisant metadata.back comme source de vérité.
 */
export async function restoreAll(path: string): Promise<void> {
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
      const back = resource.context?.custom?.back;

      if (!back) {
        throw new Error(
          `Impossible de restaurer ${resource.public_id} : metadata.back manquant`
        );
      }

      await cloudinary.uploader.rename(
        resource.public_id,
        back,
        {
          resource_type: 'image',
          overwrite: false,
          invalidate: true,
        }
      );

      // Nettoyage du context
      await cloudinary.uploader.explicit(back, {
        type: 'upload',
        resource_type: 'image',
        context: {
          custom: {
            back: '',
          },
        },
      });
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);
}