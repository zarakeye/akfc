'use server';

import { headers } from "next/headers";

import { requestPasswordResetSchema } from "@akfc/contracts/auth/auth.schema.ts";
import { requestPasswordReset } from "@akfc/backend/modules/auth/services/passwordReset.service.ts";
import { getRequestIp } from "@akfc/backend/lib/security/requestIp.ts";
import type { RequestPasswordResetFormState } from "#features/auth/forgot-password/requestPasswordResetForm.types.ts";

/**
 * « Mot de passe oublié » : la server action du formulaire.
 *
 * Elle ne contient pas la logique de réinitialisation : elle lit le formulaire, le valide avec le
 * schéma partagé, puis appelle le même service que la procédure tRPC auth.requestPasswordReset.
 *
 * Pas de vérification de droits : la page est publique, par nature (on a oublié son mot de passe).
 * La réponse est la même que le compte existe ou non : seule une adresse mal formée est refusée,
 * avec un message sous le champ.
 */
export async function requestPasswordResetFormAction(
  _prevState: RequestPasswordResetFormState,
  formData: FormData,
): Promise<RequestPasswordResetFormState> {
  // FormData est une matière première : une valeur absente vaut null, on la ramène à une chaîne.
  const parsed = requestPasswordResetSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Adresse e-mail invalide.";
    return { status: "error", error: message, fieldErrors: { email: message } };
  }

  const h = await headers();
  try {
    await requestPasswordReset({
      email: parsed.data.email,
      requestIp: getRequestIp(h),
      userAgent: h.get("user-agent"),
    });
  } catch (err) {
    // Une vraie panne (base injoignable) : journalisée, message générique, sans rien révéler.
    console.error("[auth] demande de réinitialisation impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Une erreur est survenue. Réessaie plus tard." };
  }

  return { status: "success" };
}
