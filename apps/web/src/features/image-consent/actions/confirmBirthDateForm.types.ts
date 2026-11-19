import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type ConfirmBirthDateField = "isLegalRepresentative" | "birthDate" | "confirmAdult";

/** En cas de succès : la date enregistrée, effacée, ou le membre devenu majeur. */
export type ConfirmBirthDateFormState = FormActionState<{ result: "SET" | "CLEARED" | "ADULT" }, ConfirmBirthDateField>;

/** Défini ICI et non dans l'action : un module "use server" n'exporte que des fonctions async. */
export const initialConfirmBirthDateFormState: ConfirmBirthDateFormState = { status: "idle" };
