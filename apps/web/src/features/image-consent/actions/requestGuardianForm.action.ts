'use server';

import { TRPCError } from "@trpc/server";

import { prisma } from "@akfc/backend/prisma.ts";
import { getSessionFromRequest } from "@akfc/backend/modules/auth/getSessionFromRequest.ts";
import { requestGuardianConsent } from "@akfc/backend/modules/imageConsent/imageConsentGuardian.service.ts";
import { requestGuardianSchema } from "@akfc/contracts/legal/imageConsentForms.schema.ts";
import { choicesFromFormData } from "#features/image-consent/actions/consentFormData.ts";
import type { RequestGuardianFormState } from "#features/image-consent/actions/requestGuardianForm.types.ts";

/**
 * Membre mineur : ses souhaits, et le lien personnel envoyé à son parent référent. Même service
 * que la procédure imageConsent.requestGuardian.
 */
export async function requestGuardianFormAction(
  _prevState: RequestGuardianFormState,
  formData: FormData,
): Promise<RequestGuardianFormState> {
  const parsed = requestGuardianSchema.safeParse(choicesFromFormData(formData));
  if (!parsed.success) return { status: "error", error: "Choix incomplets : rechargez la page." };

  const session = await getSessionFromRequest().catch(() => null);
  if (!session?.user) return { status: "error", error: "Votre session a expiré. Reconnectez-vous." };

  try {
    await requestGuardianConsent({ prisma, userId: session.user.id, ...parsed.data });
    return { status: "success" };
  } catch (err) {
    // Les refus (lien envoyé à l'instant, coordonnées du parent manquantes, e-mail parti en échec)
    // sont des phrases pour le membre.
    if (err instanceof TRPCError && err.message !== err.code) return { status: "error", error: err.message };
    console.error("[droit à l'image] envoi au parent impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Envoi impossible. Réessayez dans un instant." };
  }
}
