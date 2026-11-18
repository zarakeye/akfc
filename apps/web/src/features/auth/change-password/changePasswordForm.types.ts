import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type ChangePasswordField = "currentPassword" | "newPassword" | "confirmPassword";

export type ChangePasswordFormState = FormActionState<undefined, ChangePasswordField>;

export type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans "use server") et NON dans
 * l'action : un module "use server" ne peut exporter que des fonctions async.
 */
export const initialChangePasswordFormState: ChangePasswordFormState = {
  status: "idle",
};
