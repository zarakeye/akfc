"use server";

import { prisma } from "@akfc/backend/prisma.ts";
import { getSessionFromRequest } from "@akfc/backend/modules/auth/getSessionFromRequest.ts";
import { updateMeFormSchema } from "@akfc/contracts/forms/updateMeForm.schema.ts";
import { ageOn, effectiveLegalAge } from "@akfc/contracts/legal/imageConsent.ts";
import { Prisma } from "@prisma/client";

import type { UpdateMeFormState } from "./updateMeForm.types";

function firstError(errs?: string[]): string | undefined {
  if (!errs || errs.length === 0) return undefined;
  return errs[0];
}

export async function updateMeFormAction(
  _prevState: UpdateMeFormState,
  formData: FormData,
): Promise<UpdateMeFormState> {
  const sessionClient = await getSessionFromRequest();
  const userId = sessionClient?.user?.id;

  if (!userId) {
    return {
      status: "error",
      error: "Vous devez être connecté pour mettre à jour votre profil.",
    };
  }

  const raw = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    pseudo: String(formData.get("pseudo") ?? ""),
    aboutMe: String(formData.get("aboutMe") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
  };

  const input = {
    firstName: raw.firstName.trim(),
    lastName: raw.lastName.trim(),
    pseudo: raw.pseudo.trim() || undefined,
    aboutMe: raw.aboutMe.trim() || undefined,
    phone: raw.phone.trim() || undefined,
    birthDate: raw.birthDate.trim() || undefined,
  };

  const parsed = updateMeFormSchema.safeParse(input);

  if (!parsed.success) {
    const flat = parsed.error.flatten();

    return {
      status: "error",
      error: flat.formErrors?.[0] ?? "Veuillez corriger les champs en erreur.",
      fieldErrors: {
        firstName: firstError(flat.fieldErrors.firstName),
        lastName: firstError(flat.fieldErrors.lastName),
        pseudo: firstError(flat.fieldErrors.pseudo),
        aboutMe: firstError(flat.fieldErrors.aboutMe),
        phone: firstError(flat.fieldErrors.phone),
        birthDate: firstError(flat.fieldErrors.birthDate),
      },
    };
  }

  const data = parsed.data;

  // Date de naissance : le membre la voit toujours. Mineur : il ne la modifie pas, il demande à son
  // parent de la renseigner ou la corriger (lien personnel). Majeur : il la corrige, sans pouvoir
  // devenir mineur par erreur de saisie. Majorité non renseignée : modifiable, sauf date du club.
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { birthDate: true, birthDateVerified: true, legalAge: true },
  });
  const legalAge = current ? effectiveLegalAge(current) : "UNKNOWN";
  const birthDateLocked = legalAge === "MINOR" || (legalAge === "UNKNOWN" && current?.birthDateVerified === true);
  const newBirthDate = data.birthDate ? new Date(`${data.birthDate}T00:00:00Z`) : null;
  if (!birthDateLocked && legalAge === "ADULT" && newBirthDate && ageOn(newBirthDate, new Date()) < 18) {
    return {
      status: "error",
      error: "Votre profil n'a pas été enregistré.",
      fieldErrors: { birthDate: "Cette date ferait de vous un mineur : vérifiez-la, ou écrivez au club." },
    };
  }
  const birthDateChanged = (newBirthDate?.getTime() ?? null) !== (current?.birthDate?.getTime() ?? null);

  const updateData = {
    firstName: data.firstName,
    lastName: data.lastName,
    pseudo: data.pseudo ?? null,
    aboutMe: data.aboutMe ?? null,
    phone: data.phone ?? null,
    // Corrigée par le membre : ce n'est plus la date vérifiée par le club ou le parent.
    ...(birthDateLocked || !birthDateChanged ? {} : { birthDate: newBirthDate, birthDateVerified: false }),
    isFirstLogin: false,
  } satisfies Prisma.UserUpdateInput;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  } catch (err) {
    console.error("updateMeFormAction error:", err);

    return {
      status: "error",
      error: "Erreur serveur lors de la mise à jour. Veuillez réessayer.",
    };
  }

  return {
    status: "success",
    message: "Profil mis à jour avec succès.",
  };
}
