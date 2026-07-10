import { z } from "zod";

/**
 * Validation d'UN label de permission. Réutilisée côté action, appliquée à
 * chaque label après découpe par virgule.
 */
export const permissionLabelSchema = z
  .string()
  .min(3, "Le nom doit avoir au moins 3 caractères")
  .max(50, "Le nom ne peut pas dépasser 50 caractères");

/**
 * Schéma du formulaire (resolver client). Le champ `name` peut contenir
 * plusieurs labels séparés par des virgules ; la validation fine par label se
 * fait côté action. Ici on s'assure seulement que le champ n'est pas vide,
 * pour ne pas bloquer la soumission. Pas de `.transform`/`.default`/`.coerce`
 * → le type d'entrée reste identique à `FormValues` (pas de TS2322).
 */
export const createPermissionFormSchema = z.object({
  name: z.string().min(1, "Saisis au moins un label"),
});

export type CreatePermissionFormValues = z.infer<typeof createPermissionFormSchema>;