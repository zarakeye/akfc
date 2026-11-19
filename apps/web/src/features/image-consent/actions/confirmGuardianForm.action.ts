'use server';

import { TRPCError } from "@trpc/server";

import { prisma } from "@akfc/backend/prisma.ts";
import { confirmGuardianConsent } from "@akfc/backend/modules/imageConsent/imageConsentGuardian.service.ts";
import { ADULT_BIRTH_DATE_UNCONFIRMED } from "@akfc/contracts/legal/imageConsent.ts";
import { confirmGuardianSchema } from "@akfc/contracts/legal/imageConsentForms.schema.ts";
import { choicesFromFormData, isChecked } from "#features/image-consent/actions/consentFormData.ts";
import type {
  ConfirmGuardianField,
  ConfirmGuardianFormState,
} from "#features/image-consent/actions/confirmGuardianForm.types.ts";

const FIELDS: readonly ConfirmGuardianField[] = ["isLegalRepresentative", "birthDate", "confirmAdult"];

/**
 * Page du parent (sans compte) : il valide le droit à l'image de son enfant mineur. Le lien
 * personnel (`token`) tient lieu d'identité ; le service vérifie qu'il est encore valable. Même
 * service que la procédure imageConsent.confirmGuardian.
 */
export async function confirmGuardianFormAction(
  _prevState: ConfirmGuardianFormState,
  formData: FormData,
): Promise<ConfirmGuardianFormState> {
  const parsed = confirmGuardianSchema.safeParse({
    token: String(formData.get("token") ?? ""),
    ...choicesFromFormData(formData),
    isLegalRepresentative: isChecked(formData, "isLegalRepresentative"),
    birthDate: String(formData.get("birthDate") ?? ""),
    confirmAdult: isChecked(formData, "confirmAdult"),
  });
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ConfirmGuardianField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = FIELDS.find((f) => f === issue.path[0]);
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    if (Object.keys(fieldErrors).length === 0) return { status: "error", error: "Lien incomplet : rouvrez-le depuis l'e-mail." };
    return { status: "error", error: "Vérifiez les champs signalés.", fieldErrors };
  }

  try {
    const { token, usages, keepAfterLeave, birthDate, confirmAdult } = parsed.data;
    const res = await confirmGuardianConsent({ prisma, token, usages, keepAfterLeave, birthDate: birthDate ?? null, confirmAdult });
    return { status: "success", data: res };
  } catch (err) {
    if (err instanceof TRPCError) {
      // Date de majeur non confirmée : sous la date.
      if (err.message === ADULT_BIRTH_DATE_UNCONFIRMED) {
        return { status: "error", error: err.message, fieldErrors: { confirmAdult: err.message } };
      }
      if (err.code === "BAD_REQUEST") return { status: "error", error: err.message, fieldErrors: { birthDate: err.message } };
      // Lien expiré ou déjà utilisé, membre devenu majeur… : des phrases pour le parent.
      if (err.message !== err.code) return { status: "error", error: err.message };
    }
    console.error("[droit à l'image] validation du parent impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Enregistrement impossible. Réessayez dans un instant." };
  }
}
