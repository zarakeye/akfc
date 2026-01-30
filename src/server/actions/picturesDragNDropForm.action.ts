'use server';

import { uploadToCloudinaryAuthenticated } from '@/server/cloudinary/services/upload';
import { prisma } from '@/server/prisma';
import slugify from 'slugify';

const APP_SHORT_NAME = process.env.APP_SHORT_NAME || 'my-app';

export type PicturesDragNDropFormState = {
  success: boolean;
  error?: string;
};

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
