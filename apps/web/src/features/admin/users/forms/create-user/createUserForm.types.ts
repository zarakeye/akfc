import type { FormActionState } from "@akfc/contracts/forms/form-action.types.ts";
import type { CreationLegalValue } from "@akfc/contracts/legal/creationLegal.ts";

/**
 * Adresse vide. Le schéma partagé dit « Saisissez votre adresse e-mail », écrit pour la connexion ;
 * ici, c'est l'administrateur qui saisit l'adresse d'un autre.
 */
export const EMAIL_REQUIRED_MESSAGE = "L'adresse e-mail est obligatoire.";

/** Les champs sous lesquels une erreur peut s'afficher : l'adresse, et le bloc « Majorité ». */
export type CreateUserField = "email" | "legal";

/** En cas de succès, l'identifiant du compte créé (pour ouvrir sa fiche). */
export type CreateUserFormState = FormActionState<{ id: string }, CreateUserField>;

export type CreateUserFormValues = {
  email: string;
  /** Statut (groupes système) et autres groupes, cochés. */
  groupIds: string[];
  /** Créneaux suivis ; pour un instructeur, sans être élève. */
  courseIds: number[];
  /** Instructeur : les créneaux qu'il donne. */
  taughtCourseIds: number[];
  /** Simple membre : date de naissance ou choix majeur/mineur ; mineur : parent référent. */
  legal: CreationLegalValue;
};

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans "use server") et NON dans
 * l'action : un module "use server" ne peut exporter que des fonctions async.
 */
export const initialCreateUserFormState: CreateUserFormState = {
  status: "idle",
};
