import { z } from 'zod';

export const pictureSchema = z.object({
  name: z.string().min(1),
  base64: z.string().min(1),
});

export const picturesDragNDropFormSchema = z
  .object({
    userId: z.string().optional(), // ⛔ ne bloque plus
    categoryId: z.string().min(1, 'Veuillez choisir une catégorie'),
    activityId: z.string().nullable().optional(),
    newActivityName: z.string().optional(),
    pictures: z
      .array(pictureSchema)
      .min(1, 'Vous devez choisir au moins une image'),
  })
  .superRefine((data, ctx) => {
    // 🧠 règle métier : catégorie "Cours" => activity obligatoire
    if (data.categoryId === '1' && !data.activityId) {
      ctx.addIssue({
        path: ['activityId'],
        code: z.ZodIssueCode.custom,
        message: 'Veuillez choisir un cours',
      });
    }
  });

export type PicturesDragNDropFormValuesType =
  z.infer<typeof picturesDragNDropFormSchema>;
