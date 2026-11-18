'use server';

import { TRPCError } from "@trpc/server";

import { changePasswordFormSchema } from "@akfc/contracts/auth/auth.schema.ts";
import { getSessionFromRequest } from "@akfc/backend/modules/auth/getSessionFromRequest.ts";
import { getCurrentSessionId } from "@akfc/backend/lib/session/session.server.ts";
import {
  CHANGE_PASSWORD_MESSAGES,
  changePassword,
} from "@akfc/backend/modules/auth/services/passwordChange.service.ts";
import type {
  ChangePasswordField,
  ChangePasswordFormState,
} from "#features/auth/change-password/changePasswordForm.types.ts";

/**
 * Changement de mot de passe (page profil) : la server action du formulaire.
 *
 * Elle valide le formulaire avec le schéma partagé (confirmation comprise), vérifie qu'un membre
 * est connecté, puis appelle le même service que la procédure tRPC auth.changePassword. Le membre
 * vient de la session, jamais du formulaire. Les deux refus attendus du service (mot de passe
 * actuel faux, nouveau identique) reviennent sous le champ concerné.
 */
export async function changePasswordFormAction(
  _prevState: ChangePasswordFormState,
  formData: FormData,
): Promise<ChangePasswordFormState> {
  // FormData est une matière première : une valeur absente vaut null, on la ramène à une chaîne.
  const parsed = changePasswordFormSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<ChangePasswordField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        (field === "currentPassword" || field === "newPassword" || field === "confirmPassword") &&
        !fieldErrors[field]
      ) {
        fieldErrors[field] = issue.message;
      }
    }
    return { status: "error", error: "Vérifiez les champs signalés.", fieldErrors };
  }

  const session = await getSessionFromRequest().catch(() => null);
  if (!session?.user) {
    return { status: "error", error: "Votre session a expiré. Reconnectez-vous." };
  }

  try {
    await changePassword({
      userId: session.user.id,
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
      currentSessionId: await getCurrentSessionId(),
    });
  } catch (err) {
    if (err instanceof TRPCError) {
      if (err.message === CHANGE_PASSWORD_MESSAGES.wrongCurrent) {
        return { status: "error", error: err.message, fieldErrors: { currentPassword: err.message } };
      }
      if (err.message === CHANGE_PASSWORD_MESSAGES.sameAsCurrent) {
        return { status: "error", error: err.message, fieldErrors: { newPassword: err.message } };
      }
      // Trop d'essais faux : un refus attendu, dont le message dit quand réessayer.
      if (err.code === "TOO_MANY_REQUESTS") {
        return { status: "error", error: err.message };
      }
    }
    console.error("[auth] changement de mot de passe impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Impossible de changer le mot de passe. Réessayez dans un instant." };
  }

  return { status: "success", message: "Mot de passe modifié. Les autres appareils ont été déconnectés." };
}
