import { z } from "zod";

// 🧩 1. Schéma de validation Zod
export const createCategoryFormSchema = z.object({
  name: z
    .string().min(3, "Le nom doit avoir au moins 3 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
});

export type CreateCategoryFormSchema = z.infer<typeof createCategoryFormSchema>;