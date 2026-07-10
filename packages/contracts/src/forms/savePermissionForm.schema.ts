import { z } from "zod";

/** Schéma unifié create+edit. `id` absent → création, présent → édition. */
export const savePermissionFormSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1, "Le nom est obligatoire."),
});

export type SavePermissionFormValues = z.infer<typeof savePermissionFormSchema>;