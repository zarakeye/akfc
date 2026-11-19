import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type RequestGuardianFormState = FormActionState<undefined, never>;

/** Défini ICI et non dans l'action : un module "use server" n'exporte que des fonctions async. */
export const initialRequestGuardianFormState: RequestGuardianFormState = { status: "idle" };
