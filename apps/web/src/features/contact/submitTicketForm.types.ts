import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type SubmitTicketField = "categoryKey" | "subject" | "body";

export type SubmitTicketSent = { ref: string | null; dueAt: Date | null; acknowledged: boolean };

export type SubmitTicketFormState = FormActionState<SubmitTicketSent, SubmitTicketField>;

export type SubmitTicketFormValues = {
  categoryKey: string;
  subject: string;
  body: string;
  website?: string;
};

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans "use server") et NON dans
 * l'action : un module "use server" ne peut exporter que des fonctions async.
 */
export const initialSubmitTicketFormState: SubmitTicketFormState = { status: "idle" };
