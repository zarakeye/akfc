import { z } from "zod";

export const authSchema = z.object({
  email: z.string().refine((value) => {
    // Regular expression to validate email format
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, 'Invalid email format'),
  password: z.string().min(12, "Le mot de passe doit avoir au moins 12 caractères"),
});

export type AuthInput = z.infer<typeof authSchema>;