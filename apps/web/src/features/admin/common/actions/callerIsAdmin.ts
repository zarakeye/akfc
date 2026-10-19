import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";

/**
 * Garde des server actions d'administration.
 *
 * Une server action est un point d'accès HTTP public : Next lui attribue un identifiant que tout
 * navigateur peut appeler en POST, qu'il ait affiché ou non le formulaire qui l'utilise. Elle doit
 * donc vérifier les droits elle-même, comme une procédure tRPC, dès sa première ligne.
 *
 * Ce module n'est PAS un module "use server" : il n'exporte pas d'action, seulement une fonction
 * appelée par les actions.
 */
export async function callerIsAdmin(): Promise<boolean> {
  const session = await getSessionFromRequest().catch(() => null);
  return session?.user?.isAdmin === true;
}

/** Message renvoyé par une action d'administration appelée sans les droits. */
export const ADMIN_ONLY_MESSAGE = "Action réservée aux administrateurs.";
