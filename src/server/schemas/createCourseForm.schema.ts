import { z } from 'zod';

export const createCourseFormSchema = z.object({
  label: z
    .string()
    .min(3, 'Le titre doit avoir au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),

  content: z.any(),//z.custom<InputJsonValue>,//z.custom<CourseContentType>().nullable(),
  beginTime: z
    .number()
    .int()
    .min(0, 'L\'heure de début doit être un entier positif')
    .max(1439, 'L\'heure de début doit être inférieure ou égale à 2359'),

  endTime: z
    .number()
    .int()
    .min(0, 'L\'heure de fin doit être un entier positif')
    .max(1439, 'L\'heure de fin doit être inférieure ou égale à 2359'),

  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
});

export type CreateCourseFormTypes = z.infer<typeof createCourseFormSchema>;