import { z } from "zod";
import { slugSchema } from "@contracts/slug/slug.schema";

/** Schéma unifié create+edit. `id` absent → création, présent → édition. */
export const saveFamilyFormSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1, "Le nom est obligatoire.").max(120),
  slug: slugSchema,
  sortOrder: z.number().int().min(0),
});

export type SaveFamilyFormValues = z.infer<typeof saveFamilyFormSchema>;