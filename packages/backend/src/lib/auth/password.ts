import bcrypt from "bcryptjs";

/**
 * Mots de passe : SOURCE UNIQUE du hachage et de la vérification.
 *
 * Une empreinte bcrypt contient son sel et son coût : deux membres qui ont le même mot de passe
 * ont deux empreintes différentes, et la vérification n'a besoin que de l'empreinte.
 */

/** Coût bcrypt : 2^12 tours, environ 250 ms par calcul. Lent exprès, pour freiner les essais. */
export const PASSWORD_HASH_COST = 12;

/** L'empreinte à enregistrer pour un mot de passe en clair. */
export function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, PASSWORD_HASH_COST);
}

/** Le mot de passe en clair correspond-il à l'empreinte enregistrée ? */
export function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Empreinte d'un mot de passe aléatoire que personne ne connaît, au même coût que les vraies.
 * Sert quand l'adresse saisie n'a pas de compte : on vérifie quand même, contre cette empreinte,
 * pour que la réponse prenne le même temps. Sinon, la rapidité de la réponse trahirait qu'une
 * adresse est inconnue.
 */
export const UNKNOWN_ACCOUNT_HASH = "$2b$12$0mKIykkePGG1TWy0XVc0bewZAYuDz/KD4osvKCMECmza3MKtG4YV2";
