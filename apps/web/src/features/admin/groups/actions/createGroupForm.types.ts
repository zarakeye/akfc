import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type CreateGroupField = "name" | "parentGroupId";

/** En cas de succès, l'identifiant du groupe créé. */
export type CreateGroupFormState = FormActionState<{ id: string }, CreateGroupField>;

export type CreateGroupFormValues = {
  name: string;
  parentGroupId: string;
  isCollaborative: boolean;
};

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans "use server") et NON dans
 * l'action : un module "use server" ne peut exporter que des fonctions async.
 */
export const initialCreateGroupFormState: CreateGroupFormState = {
  status: "idle",
};
