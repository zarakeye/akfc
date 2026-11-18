import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";

export type SaveBreakingNewsField = "title" | "body" | "href" | "publicationDate" | "expiresAt";

/** En cas de succès, l'identifiant du flash info créé ou mis à jour. */
export type SaveBreakingNewsFormState = FormActionState<{ id: number }, SaveBreakingNewsField>;

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans "use server") et NON dans
 * l'action : un module "use server" ne peut exporter que des fonctions async.
 */
export const initialSaveBreakingNewsFormState: SaveBreakingNewsFormState = {
  status: "idle",
};
