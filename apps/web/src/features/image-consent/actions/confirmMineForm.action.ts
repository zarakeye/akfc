'use server';

import { TRPCError } from "@trpc/server";

import { prisma } from "@akfc/backend/prisma.ts";
import { getSessionFromRequest } from "@akfc/backend/modules/auth/getSessionFromRequest.ts";
import {
  CONSENT_WRONG_PASSWORD,
  confirmMemberConsent,
} from "@akfc/backend/modules/imageConsent/imageConsentOnline.service.ts";
import { confirmMineSchema } from "@akfc/contracts/legal/imageConsentForms.schema.ts";
import { choicesFromFormData } from "#features/image-consent/actions/consentFormData.ts";
import type { ConfirmMineFormState } from "#features/image-consent/actions/confirmMineForm.types.ts";

/**
 * Membre majeur : ses choix de droit à l'image, signés de son mot de passe. Même service que la
 * procédure imageConsent.confirmMine ; le membre vient de la session, jamais du formulaire.
 */
export async function confirmMineFormAction(
  _prevState: ConfirmMineFormState,
  formData: FormData,
): Promise<ConfirmMineFormState> {
  const parsed = confirmMineSchema.safeParse({
    ...choicesFromFormData(formData),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === "password") return { status: "error", error: issue.message, fieldErrors: { password: issue.message } };
    return { status: "error", error: "Choix incomplets : rechargez la page." };
  }

  const session = await getSessionFromRequest().catch(() => null);
  if (!session?.user) return { status: "error", error: "Votre session a expiré. Reconnectez-vous." };

  try {
    await confirmMemberConsent({ prisma, userId: session.user.id, ...parsed.data });
    return { status: "success" };
  } catch (err) {
    if (err instanceof TRPCError) {
      if (err.message === CONSENT_WRONG_PASSWORD) {
        return { status: "error", error: err.message, fieldErrors: { password: err.message } };
      }
      // Les autres refus (trop d'essais, majorité, nom manquant) sont des phrases pour le membre.
      if (err.message !== err.code) return { status: "error", error: err.message };
    }
    console.error("[droit à l'image] confirmation impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Enregistrement impossible. Réessayez dans un instant." };
  }
}
