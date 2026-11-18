import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type RequestPasswordResetField = "email";

export type RequestPasswordResetFormState = FormActionState<undefined, RequestPasswordResetField>;

export type RequestPasswordResetFormValues = {
  email: string;
};

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans "use server") et NON dans
 * l'action : un module "use server" ne peut exporter que des fonctions async.
 */
export const initialRequestPasswordResetFormState: RequestPasswordResetFormState = {
  status: "idle",
};
