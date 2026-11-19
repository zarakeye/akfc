import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type ConfirmMineFormState = FormActionState<undefined, "password">;

/** Défini ICI et non dans l'action : un module "use server" n'exporte que des fonctions async. */
export const initialConfirmMineFormState: ConfirmMineFormState = { status: "idle" };
