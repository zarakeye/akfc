'use server';

import { uploadToCloudinaryAuthenticated } from '@workspace/backend/modules/cloudinary/services/upload';
import { prisma } from 'packages/backend/src/prisma';
import slugify from 'slugify';

const APP_SHORT_NAME = process.env.APP_SHORT_NAME || 'my-app';

export type PicturesDragNDropFormState = {
  success: boolean;
  error?: string;
};

/**
 * 🧩 Action Server
 * Uploads multiple files to Cloudinary and saves them to a Prisma database.
 *
 * The function takes a FormData object containing the following fields:
 * - userId: The ID of the user who is uploading the files.
 * - categoryId: The ID of the category where the files will be uploaded.
 * - activityId: The ID of the activity where the files will be uploaded.
 * - newActivityName: The name of the activity where the files will be uploaded (required if activityId is not provided).
 * - pictures: An array of File objects representing the files to be uploaded.
 *
 * The function returns an object with a success property and an error property.
 * If the upload is successful, success is true and error is an empty object.
 * If the upload fails, success is false and error is an object with a message property.
 *
 * @throws {Error} If any of the files are empty.
 */
export async function picturesDragNDropFormAction(
  _: { success: boolean; error?: string },
  formData: FormData
) {
  try {
    const userId = formData.get('userId')?.toString();
    const categoryId = formData.get('categoryId')?.toString();
    const activityId = formData.get('activityId')?.toString();
    const newActivityName = formData.get('newActivityName')?.toString();
    const files = formData.getAll('pictures') as File[];

    if (!userId) return { success: false, error: 'Utilisateur non authentifié' };
    if (!files.length) return { success: false, error: 'Aucune image fournie' };
    if (!categoryId) return { success: false, error: 'Catégorie requise' };

    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!category) {
      return { success: false, error: 'Catégorie invalide' };
    }

    let activitySlug: string;

    if (activityId) {
      const course = await prisma.course.findUnique({
        where: { id: Number(activityId) },
      });

      if (!course) {
        return { success: false, error: 'Activité invalide' };
      }

      activitySlug = slugify(course.label, { lower: true, strict: true });
    } else {
      if (!newActivityName) {
        return { success: false, error: 'Nom de l’activité requis' };
      }
      activitySlug = slugify(newActivityName, { lower: true, strict: true });
    }

    const categorySlug = slugify(category.type, { lower: true, strict: true });
    const folder = `${APP_SHORT_NAME}/pending/${categorySlug}/${activitySlug}`;

    for (const file of files) {
      if (file.size === 0) {
        throw new Error('Fichier vide détecté');
      }

      await uploadToCloudinaryAuthenticated(file, {
        folder,
        publicId: crypto.randomUUID(),
      });
    }

    return { success: true };
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Erreur lors de l’upload des images',
    };
  }
}
