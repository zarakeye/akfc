import { z } from "zod";
import { CATEGORY_KEYS } from "@contracts/categories/categoryKey";

/**
 * Schéma unifié création + édition.
 *   - `id` ABSENT  → création
 *   - `id` PRÉSENT → édition
 *
 * `id` est `z.coerce.number()` car il provient d'un input caché (string dans
 * le FormData) et il est EXCLU du resolver client via `.pick({ key: true, type: true })`.
 * Les champs saisis (`key`, `type`) sont les seuls validés côté client ; l'action valide
 * le schéma complet.
 *
 * `key` est choisie dans la liste fixe : c'est elle que lit le code. `type` n'est que
 * le libellé affiché.
 */
export const saveCategoryFormSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  key: z.enum(CATEGORY_KEYS, { error: "Choisissez une catégorie de la liste." }),
  type: z.string().trim().min(1, "Le libellé est obligatoire."),
});

export type SaveCategoryFormValues = z.infer<typeof saveCategoryFormSchema>;