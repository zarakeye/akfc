import { z } from "zod";

// 🧩 1. Schéma de validation Zod
export const createUserFormSchema = z.object({
  email: z.string().refine((value) => {
    // Regular expression to validate email format
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, 'Veuillez fournir une adresse e-mail valide'),
  roleId: z.number(),
  // password: z.string().min(12, "Le mot de passe doit avoir au moins 12 caractères"),
});

// 🧩 2. Type de données Zod
export type CreateUserFormSchema = z.infer<typeof createUserFormSchema>;