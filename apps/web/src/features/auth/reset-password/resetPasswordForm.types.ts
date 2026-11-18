import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type ResetPasswordField = "newPassword" | "confirmPassword";

export type ResetPasswordFormState = FormActionState<undefined, ResetPasswordField>;

export type ResetPasswordFormValues = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans "use server") et NON dans
 * l'action : un module "use server" ne peut exporter que des fonctions async.
 */
export const initialResetPasswordFormState: ResetPasswordFormState = {
  status: "idle",
};
