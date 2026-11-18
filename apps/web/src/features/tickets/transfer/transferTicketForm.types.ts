import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type TransferTicketField = "toUserId" | "note";

export type TransferTicketFormState = FormActionState<undefined, TransferTicketField>;

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans "use server") et NON dans
 * l'action : un module "use server" ne peut exporter que des fonctions async.
 */
export const initialTransferTicketFormState: TransferTicketFormState = {
  status: "idle",
};
