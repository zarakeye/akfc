import { z } from "zod";

export const authSchema = z.object({
  email: z.string().refine((value) => {
    // Regular expression to validate email format
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, 'Invalid email format'),
  password: z.string().min(12, "Le mot de passe doit avoir au moins 12 caractères"),
});

export type AuthInput = z.infer<typeof authSchema>;

/**
 * Changement de mot de passe pour un utilisateur CONNECTÉ.
 * `currentPassword` : vérifié côté serveur (doit correspondre au hash actuel).
 * `newPassword` : min 12 (même règle que la connexion / le reset).
 * (La confirmation est validée côté formulaire, pas nécessaire au serveur.)
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z
    .string()
    .min(12, "Le nouveau mot de passe doit faire au moins 12 caractères"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
