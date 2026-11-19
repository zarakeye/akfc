import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type ConfirmGuardianField = "isLegalRepresentative" | "birthDate" | "confirmAdult";

/** En cas de succès : les changements par rapport aux souhaits, ou le membre devenu majeur. */
export type ConfirmGuardianFormState = FormActionState<{ changes: string[]; becameAdult: boolean }, ConfirmGuardianField>;

/** Défini ICI et non dans l'action : un module "use server" n'exporte que des fonctions async. */
export const initialConfirmGuardianFormState: ConfirmGuardianFormState = { status: "idle" };
