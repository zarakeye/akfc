import { z } from 'zod';

export const pictureSchema = z.object({
  name: z.string(),
  publicId: z.string(),
  // url: z.string(),
});

export const picturesDragNDropFormSchema = z
  .object({
    userId: z.string().min(1, 'Utilisateur requis'), // ⛔ ne bloque plus
    categoryId: z.string().min(1, 'Veuillez choisir une catégorie'),
    activityId: z.string().nullable(),
    newActivityName: z.string().trim().min(1, 'Nom de l\'activité requis').optional(),
    pictures: z
      .array(pictureSchema)
      .min(1, 'Vous devez choisir au moins une image'),
  })
  .refine(
    data =>
      (data.activityId && !data.newActivityName) ||
      (!data.activityId && data.newActivityName),
    {
      message: 'Vous devez choisir soit une activité existante ou créer une nouvelle',
      path: ['activityId'],    
    }
  );

export type PicturesDragNDropFormValuesType =
  z.infer<typeof picturesDragNDropFormSchema>;
