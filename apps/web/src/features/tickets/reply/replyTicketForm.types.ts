import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

/** En cas de succès : l'e-mail est-il parti (non pour un compte de démonstration ou un envoi désactivé) ? */
export type ReplyTicketFormState = FormActionState<{ emailed: boolean }, "body">;

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans "use server") et NON dans
 * l'action : un module "use server" ne peut exporter que des fonctions async.
 */
export const initialReplyTicketFormState: ReplyTicketFormState = {
  status: "idle",
};
