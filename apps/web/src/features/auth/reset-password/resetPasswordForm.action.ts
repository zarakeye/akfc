'use server';

import { resetPasswordFormSchema } from "@akfc/contracts/auth/auth.schema.ts";
import {
  RESET_LINK_MESSAGES,
  resetPassword,
  ResetLinkError,
} from "@akfc/backend/modules/auth/services/passwordReset.service.ts";
import type {
  ResetPasswordField,
  ResetPasswordFormState,
} from "#features/auth/reset-password/resetPasswordForm.types.ts";

/**
 * Réinitialisation du mot de passe : la server action du formulaire.
 *
 * Elle valide le formulaire avec le schéma partagé (mot de passe et confirmation), puis appelle
 * le même service que la procédure tRPC auth.resetPassword : vérification du lien, nouveau mot
 * de passe, lien consommé et sessions fermées, en une transaction.
 *
 * Pas de vérification de droits : la page est publique ; c'est le lien (le jeton) qui fait foi.
 */
export async function resetPasswordFormAction(
  _prevState: ResetPasswordFormState,
  formData: FormData,
): Promise<ResetPasswordFormState> {
  // FormData est une matière première : une valeur absente vaut null, on la ramène à une chaîne.
  const parsed = resetPasswordFormSchema.safeParse({
    token: String(formData.get("token") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<ResetPasswordField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "newPassword" || field === "confirmPassword") && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    // Un jeton absent ou tronqué n'a pas de champ où s'afficher : c'est le lien qui est en cause.
    if (Object.keys(fieldErrors).length === 0) {
      return { status: "error", error: RESET_LINK_MESSAGES.invalid };
    }
    return { status: "error", error: "Vérifie les champs signalés.", fieldErrors };
  }

  try {
    await resetPassword({ token: parsed.data.token, newPassword: parsed.data.newPassword });
  } catch (err) {
    // Lien inconnu, déjà utilisé ou expiré : un refus attendu, dont le message dit quoi faire.
    if (err instanceof ResetLinkError) {
      return { status: "error", error: err.message };
    }
    console.error("[auth] réinitialisation impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Une erreur est survenue. Réessaie plus tard." };
  }

  return { status: "success" };
}
