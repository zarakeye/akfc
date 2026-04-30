"use server";

import { prisma } from "@backend/prisma";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";
import { updateMeFormSchema } from "@contracts/forms/updateMeForm.schema";
import { Prisma } from "@prisma/client";

import type { UpdateMeFormState } from "./updateMeForm.types";

export const initialUpdateMeFormState: UpdateMeFormState = {
  status: "idle",
};

function firstError(errs?: string[]): string | undefined {
  if (!errs || errs.length === 0) return undefined;
  return errs[0];
}

export async function updateMeFormAction(
  _prevState: UpdateMeFormState,
  formData: FormData
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
    avatar: String(formData.get("avatar") ?? ""),
  };

  const input = {
    firstName: raw.firstName.trim(),
    lastName: raw.lastName.trim(),
    pseudo: raw.pseudo.trim() || undefined,
    aboutMe: raw.aboutMe.trim() || undefined,
    phone: raw.phone.trim() || undefined,
    birthDate: raw.birthDate.trim() || undefined,
    avatar: raw.avatar.trim() || undefined,
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
        avatar: firstError(flat.fieldErrors.avatar),
      },
    };
  }

  const data = parsed.data;

  const updateData = {
    firstName: data.firstName,
    lastName: data.lastName,
    pseudo: data.pseudo ?? null,
    aboutMe: data.aboutMe ?? null,
    phone: data.phone ?? null,
    avatar: data.avatar ?? null,
    birthDate: data.birthDate ? new Date(data.birthDate) : null,
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