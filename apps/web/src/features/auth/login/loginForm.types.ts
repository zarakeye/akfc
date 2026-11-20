import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type LoginField = "email" | "password";

export type LoginFormState = FormActionState<undefined, LoginField>;

export type LoginFormValues = { email: string; password: string };

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans "use server") et NON dans
 * l'action : un module "use server" ne peut exporter que des fonctions async.
 */
export const initialLoginFormState: LoginFormState = { status: "idle" };
