import { z } from "zod";

// 🧩 1. Schéma de validation Zod
export const updateMeFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "Le prénom doit avoir au moins 1 caractère"),
  
  lastName: z
    .string()
    .min(2, "Le nom de famille doit avoir au moins 2 caractères"),
  // email: z.string().refine((value) => {
  //   // Regular expression to validate email format
  //   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  // }, 'Veuillez fournir une adresse e-mail valide'),
  
  pseudo: z
    .string()
    .min(2)
    .optional()
    .or(z.literal('')),

  aboutMe: z
    .string()
    .max(1000)
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const cleaned = val.replace(/\D/g, ""); // supprime espaces, tirets, etc.
      return /^0[1-9]\d{8}$/.test(cleaned);
    }, "Le numéro de téléphone doit être valide (ex: 0XXXXXXXXX)"),

  birthDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return !Number.isNaN(Date.parse(val));
    }, "Date de naissance invalide"),

  // NB : l'avatar n'est PLUS géré par ce formulaire. Il suit un flux
  // AUTONOME (AvatarUploader → avatar.register → User.avatar), indépendant
  // du submit. Le retirer d'ici évite une double écriture et la validation
  // "URL invalide" (User.avatar stocke un publicId, pas une URL).
});

// 🧩 2. Type de données Zod
export type FormValues = z.infer<typeof updateMeFormSchema>;
