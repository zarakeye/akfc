import { z } from "zod";

/**
 * Règles des mots de passe et des formulaires d'authentification : SOURCE UNIQUE.
 *
 * Chaque règle est écrite ici une fois, puis importée des deux côtés : par les procédures tRPC
 * (`auth.login`, `auth.requestPasswordReset`, `auth.resetPassword`, `auth.changePassword`), qui
 * font foi, et par les formulaires, qui affichent la même règle avec le même message avant l'envoi.
 */

/** Longueur minimale d'un mot de passe. Les textes d'aide l'affichent à partir de cette valeur. */
export const PASSWORD_MIN_LENGTH = 12;

/**
 * Une adresse e-mail (connexion, mot de passe oublié, création d'un compte). Toujours en minuscules :
 * les adresses sont enregistrées ainsi, et une adresse tapée avec une majuscule retrouve son compte.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Saisissez votre adresse e-mail.")
  .email("Adresse e-mail invalide.");

/** Un mot de passe choisi par le membre (réinitialisation, changement). */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Le mot de passe doit faire au moins ${PASSWORD_MIN_LENGTH} caractères.`);

/**
 * Connexion. Un champ vide reçoit son propre message, avant les règles de forme : Zod renvoie les
 * problèmes dans l'ordre des vérifications, et le formulaire affiche le premier.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Saisissez votre mot de passe.").pipe(passwordSchema),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Demande d'un lien de réinitialisation (« Mot de passe oublié »). */
export const requestPasswordResetSchema = z.object({ email: emailSchema });

/** Réinitialisation (lien reçu par e-mail après « Mot de passe oublié »). */
export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Changement de mot de passe pour un utilisateur CONNECTÉ.
 * `currentPassword` : vérifié côté serveur (doit correspondre au hash actuel).
 * `newPassword` : même règle que partout ailleurs.
 * (La confirmation est validée côté formulaire, pas nécessaire au serveur.)
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
