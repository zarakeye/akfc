import { z } from "zod";

/**
 * Création d'un groupe de membres : SOURCE UNIQUE de la règle, importée par la procédure
 * memberGroup.create, par la server action du formulaire et par le formulaire lui-même.
 * Sans parent, le groupe est rangé sous Administrateurs (service createMemberGroup).
 */
export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est obligatoire.")
    .max(120, "120 caractères au plus."),
  description: z.string().trim().max(500, "500 caractères au plus.").optional(),
  isCollaborative: z.boolean().optional(),
  parentGroupId: z.string().optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
