import { z } from "zod";

/**
 * Schéma unifié create+edit (le `name`). `id` absent → création, présent →
 * édition. Les `permissionIds` ne sont PAS ici : comme les items de galerie,
 * ils transitent par un input caché JSON parsé à part dans l'action.
 */
export const saveRoleFormSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1, "Le nom est obligatoire."),
});

export type SaveRoleFormValues = z.infer<typeof saveRoleFormSchema>;