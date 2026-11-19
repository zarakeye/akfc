'use server';

import { TRPCError } from "@trpc/server";

import { prisma } from "@akfc/backend/prisma.ts";
import { confirmBirthDateByGuardian } from "@akfc/backend/modules/users/birthDateRequest.service.ts";
import { ADULT_BIRTH_DATE_UNCONFIRMED } from "@akfc/contracts/legal/imageConsent.ts";
import { confirmBirthDateSchema } from "@akfc/contracts/legal/imageConsentForms.schema.ts";
import { isChecked } from "#features/image-consent/actions/consentFormData.ts";
import type {
  ConfirmBirthDateField,
  ConfirmBirthDateFormState,
} from "#features/image-consent/actions/confirmBirthDateForm.types.ts";

const FIELDS: readonly ConfirmBirthDateField[] = ["isLegalRepresentative", "birthDate", "confirmAdult"];

/**
 * Page du parent (sans compte) : la date de naissance de son enfant mineur, renseignée, corrigée
 * ou effacée (champ vide). Le lien personnel (`token`) tient lieu d'identité. Même service que la
 * procédure imageConsent.confirmBirthDate.
 */
export async function confirmBirthDateFormAction(
  _prevState: ConfirmBirthDateFormState,
  formData: FormData,
): Promise<ConfirmBirthDateFormState> {
  const parsed = confirmBirthDateSchema.safeParse({
    token: String(formData.get("token") ?? ""),
    isLegalRepresentative: isChecked(formData, "isLegalRepresentative"),
    birthDate: String(formData.get("birthDate") ?? ""),
    confirmAdult: isChecked(formData, "confirmAdult"),
  });
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ConfirmBirthDateField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = FIELDS.find((f) => f === issue.path[0]);
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    if (Object.keys(fieldErrors).length === 0) return { status: "error", error: "Lien incomplet : rouvrez-le depuis l'e-mail." };
    return { status: "error", error: "Vérifiez les champs signalés.", fieldErrors };
  }

  try {
    const res = await confirmBirthDateByGuardian({ prisma, ...parsed.data });
    return { status: "success", data: res };
  } catch (err) {
    if (err instanceof TRPCError) {
      if (err.message === ADULT_BIRTH_DATE_UNCONFIRMED) {
        return { status: "error", error: err.message, fieldErrors: { confirmAdult: err.message } };
      }
      if (err.code === "BAD_REQUEST") return { status: "error", error: err.message, fieldErrors: { birthDate: err.message } };
      if (err.message !== err.code) return { status: "error", error: err.message };
    }
    console.error("[date de naissance] validation du parent impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Enregistrement impossible. Réessayez dans un instant." };
  }
}
