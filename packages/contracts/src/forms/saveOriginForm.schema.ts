import { z } from "zod";
import { slugSchema } from "@contracts/slug/slug.schema";

/**
 * Schéma unifié create+edit. `id` absent → création, présent → édition.
 *
 * Les champs optionnels sont déclarés en `z.string()` REQUIS (vide autorisé,
 * pas de `.min(1)`), et NON en `.nullable().optional()` : sinon le type inféré
 * par `zodResolver` les rend `string | null | undefined`, ce qui ne colle plus
 * au `FormValues` du form (strings contrôlées) → erreur de resolver TS2322.
 * La conversion `""` → `null` (pour la DB) se fait dans l'action, pas ici.
 *
 * `id` reste `z.coerce.number()` (vient du FormData) et est exclu du resolver
 * client via `.pick(...)`, donc son `.coerce` ne perturbe pas le typage du form.
 */
export const saveOriginFormSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1, "Le nom est obligatoire.").max(120),
  slug: slugSchema,
  description: z.string().trim().max(2000),
  country: z.string().trim().max(120),
  region: z.string().trim().max(120),
  flag: z.string().trim().max(16),
  historicalPeriod: z.string().trim().max(120),
  sortOrder: z.number().int().min(0),
});

export type SaveOriginFormValues = z.infer<typeof saveOriginFormSchema>;