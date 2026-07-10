import { z } from "zod";

/**
 * Schéma unifié création + édition.
 *   - `id` ABSENT  → création
 *   - `id` PRÉSENT → édition
 *
 * `id` est `z.coerce.number()` car il provient d'un input caché (string dans
 * le FormData) et il est EXCLU du resolver client via `.pick({ type: true })`.
 * Le champ saisi (`type`) est le seul validé côté client ; l'action valide le
 * schéma complet.
 */
export const saveCategoryFormSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  type: z.string().trim().min(1, "Le type est obligatoire."),
});

export type SaveCategoryFormValues = z.infer<typeof saveCategoryFormSchema>;