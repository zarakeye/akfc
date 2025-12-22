import { z } from "zod";

// 🧩 1. Schéma de validation Zod
export const createActivityTypeSchema = z.object({
  type: z
    .string().min(3, "Le nom doit avoir au moins 3 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
});

export type CreateActivityTypeSchema = z.infer<typeof createActivityTypeSchema>;