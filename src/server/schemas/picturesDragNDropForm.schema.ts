import { z } from "zod";

export const CroppedImageSchema = z.object({
  base64: z.string(), // base64 encoded image
  name: z.string(),
})

export const picturesDragNDrogFormSchema = z.object({
  categoryId: z.string().nullable().optional(), // z.number().nullable(),
  activityId: z.string().nullable().optional(), // z.number().nullable().optional(),
  newActivityName: z.string().optional(),
  userId: z.string(),

  // array of base64 encoded images (Blob -> Base64)
  pictures: z.array(CroppedImageSchema).min(1, "Vous devez choisir au moins une image"),
});

export type PicturesDragNDrogFormValuesType = z.infer<typeof picturesDragNDrogFormSchema>;
export type CroppedImageSchema = z.infer<typeof CroppedImageSchema>;