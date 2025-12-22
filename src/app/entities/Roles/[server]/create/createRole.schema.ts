import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string().min(3, "Le nom doit avoir au moins 3 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),

  permissions: z
    .array(z.number().int().positive())
    .min(1, "Vous devez choisir au moins une permission"),

  description: z
    .string()
    .min(10, "La description doit avoir au moins 10 caractères")
    .max(200, "La description ne peut pas dépasser 200 caractères")
});