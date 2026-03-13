"use server";

import { prisma } from "packages/backend/src/prisma";
import { getSessionFromRequest } from "packages/backend/src/auth/getSessionFromRequest";
import { updateUserFormSchema } from "packages/contracts/schemas/forms/updateUserForm.schema";

/**
 * updateUserForm.action.ts
 *
 * Pattern attendu (hybride useActionState/useForm) :
 * - export type UpdateUserFormState
 * - export initialUpdateUserFormState
 * - export async function updateUserFormAction(prevState, formData)
 *
 * Sécurité :
 * - userId depuis la session (pas dans le form)
 * - uniquement les champs "profil"
 * - pas de rôle, pas d'email, pas de password
 */

export type UpdateUserFormState = {
  ok: boolean;
  message?: string;
  // erreurs par champ (compatible affichage simple)
  fieldErrors?: Partial<
    Record<
      | "firstName"
      | "lastName"
      | "pseudo"
      | "aboutMe"
      | "phone"
      | "birthDate"
      | "avatar",
      string
    >
  >;
  // erreurs globales (ex: auth, serveur)
  formError?: string;
};

export const initialUpdateUserFormState: UpdateUserFormState = {
  ok: false,
  message: undefined,
  fieldErrors: {},
  formError: undefined,
};

/**
 * Returns the first error message from the given array of strings.
 * If no errors are present, returns undefined.
 * @param {string[] | undefined} errs - An array of error messages.
 * @returns {string | undefined} The first error message, or undefined if no errors are present.
 */
function firstError(errs?: string[] | undefined): string | undefined {
  if (!errs || errs.length === 0) return undefined;
  return errs[0];
}

/**
 * 🧩 Action Server
 * Mise à jour le profil utilisateur avec les données du formulaire.
 *
 * @param {UpdateUserFormState} prevState - L'état précédent de l'action.
 * @param {FormData} formData - Les données du formulaire.
 * @returns {Promise<UpdateUserFormState>} Une promesse qui résout à un objet avec des propriétés ok, message, fieldErrors et formError.
 * Si la mise à jour est réussie, ok est true, message est un message de succès, fieldErrors est un objet vide et formError est undefined.
 * Si la mise à jour échoue, ok est false, message est un message d'erreur, fieldErrors est un objet contenant les erreurs de validation par champ et formError est un message d'erreur global.
 */
export async function updateUserFormAction(
  prevState: UpdateUserFormState,
  formData: FormData
): Promise<UpdateUserFormState> {
  // 1) Auth
  const sessionClient = await getSessionFromRequest();
  const userId = sessionClient?.user?.id;

  if (!userId) {
    return {
      ok: false,
      formError: "Non autorisé.",
    };
  }

  // 2) Extraction FormData -> objet brut (strings)
  const raw = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    pseudo: String(formData.get("pseudo") ?? ""),
    aboutMe: String(formData.get("aboutMe") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    avatar: String(formData.get("avatar") ?? ""),
  };

  // 3) Normalisation : convertir "" -> undefined pour les optional
  const input = {
    firstName: raw.firstName.trim(),
    lastName: raw.lastName.trim(),
    pseudo: raw.pseudo.trim() || undefined,
    aboutMe: raw.aboutMe.trim() || undefined,
    phone: raw.phone.trim() || undefined,
    birthDate: raw.birthDate.trim() || undefined, // attendu "YYYY-MM-DD" ou undefined
    avatar: raw.avatar.trim() || undefined,
  };

  // 4) Validation Zod
  const parsed = updateUserFormSchema.safeParse(input);

  if (!parsed.success) {
    const flat = parsed.error.flatten();

    return {
      ok: false,
      message: prevState.message, // on conserve si tu veux, sinon supprime
      fieldErrors: {
        firstName: firstError(flat.fieldErrors.firstName),
        lastName: firstError(flat.fieldErrors.lastName),
        pseudo: firstError(flat.fieldErrors.pseudo),
        aboutMe: firstError(flat.fieldErrors.aboutMe),
        phone: firstError(flat.fieldErrors.phone),
        birthDate: firstError(flat.fieldErrors.birthDate),
        avatar: firstError(flat.fieldErrors.avatar),
      },
      formError: flat.formErrors?.[0],
    };
  }

  const data = parsed.data;

  // 5) Build update Prisma (contrôle strict des champs)
  const updateData: {
    firstName: string;
    lastName: string;
    pseudo: string | null;
    aboutMe: string | null;
    phone: string | null;
    avatar: string | null;
    birthDate: Date | null;
    isFirstLogin: boolean;
  } = {
    firstName: data.firstName,
    lastName: data.lastName,
    pseudo: data.pseudo ?? null,
    aboutMe: data.aboutMe ?? null,
    phone: data.phone ?? null,
    avatar: data.avatar ?? null,
    birthDate: data.birthDate ? new Date(data.birthDate) : null,
    isFirstLogin: false,
  };

  // 6) Update DB
  try {
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  } catch (err) {
    console.error("updateUserFormAction error:", err);
    return {
      ok: false,
      formError: "Erreur serveur lors de la mise à jour. Réessaie.",
    };
  }

  // 7) Success state
  return {
    ok: true,
    message: "Profil mis à jour ✅",
    fieldErrors: {},
    formError: undefined,
  };
}