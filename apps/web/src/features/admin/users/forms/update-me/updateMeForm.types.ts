import type { FormActionState } from "@contracts/forms/form-action.types";

export type UpdateMeField =
  "firstName" | "lastName" | "pseudo" | "aboutMe" | "phone" | "birthDate";

export type UpdateMeFormState = FormActionState<undefined, UpdateMeField>;

export type UpdateMeFormValues = {
  firstName: string;
  lastName: string;
  pseudo?: string;
  aboutMe?: string;
  phone?: string;
  birthDate?: string;
};

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans
 * "use server") et NON dans l'action : un module "use server" ne peut
 * exporter que des fonctions async (sinon crash au submit).
 */
export const initialUpdateMeFormState: UpdateMeFormState = {
  status: "idle",
};
