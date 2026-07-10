#!/bin/bash
# Corrige 2 problemes du formulaire de profil :
#  1) Erreur "use server" au submit : initialUpdateMeFormState (un OBJET)
#     etait exporte depuis l action ("use server" n autorise que des
#     fonctions async). Deplace vers updateMeForm.types.ts.
#  2) Le form avait encore un <input url> pour l avatar : cette version
#     monte l AvatarUploader (DnD + picker + camera + cropper 1:1).
# À lancer depuis la RACINE du monorepo : bash fix_updateme_form.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

echo "-> apps/web/src/features/admin/users/forms/update-me/updateMeForm.types.ts"
cat > 'apps/web/src/features/admin/users/forms/update-me/updateMeForm.types.ts' << 'FILE_EOF'
import type { FormActionState } from "@contracts/forms/form-action.types";

export type UpdateMeField =
  | "firstName"
  | "lastName"
  | "pseudo"
  | "aboutMe"
  | "phone"
  | "birthDate"
  | "avatar";

export type UpdateMeFormState = FormActionState<undefined, UpdateMeField>;

export type UpdateMeFormValues = {
  firstName: string;
  lastName: string;
  pseudo?: string;
  aboutMe?: string;
  phone?: string;
  birthDate?: string;
  avatar?: string;
};

/**
 * État initial du formulaire. Défini ICI (fichier de types, sans
 * "use server") et NON dans l'action : un module "use server" ne peut
 * exporter que des fonctions async (sinon crash au submit).
 */
export const initialUpdateMeFormState: UpdateMeFormState = {
  status: "idle",
};
FILE_EOF

echo "-> apps/web/src/features/admin/users/forms/update-me/updateMeForm.action.ts"
cat > 'apps/web/src/features/admin/users/forms/update-me/updateMeForm.action.ts' << 'FILE_EOF'
"use server";

import { prisma } from "@backend/prisma";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";
import { updateMeFormSchema } from "@contracts/forms/updateMeForm.schema";
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
FILE_EOF

echo "-> apps/web/src/features/admin/users/forms/update-me/UpdateMeForm.tsx"
cat > 'apps/web/src/features/admin/users/forms/update-me/UpdateMeForm.tsx' << 'FILE_EOF'
"use client";

import { JSX, useEffect, useMemo } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { useFormStatus } from "react-dom";

import { trpc } from "@trpc/trpcClient";
import { AvatarUploader } from "@features/avatar/AvatarUploader";
import { updateMeFormAction } from "./updateMeForm.action";
import {
  initialUpdateMeFormState,
  type UpdateMeFormState,
  type UpdateMeFormValues,
} from "./updateMeForm.types";

function SubmitButton(props: { disabled?: boolean }): JSX.Element {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      disabled={pending || props.disabled}
    >
      {pending ? "Enregistrement..." : "Enregistrer"}
    </button>
  );
}

export default function UpdateMeForm(): JSX.Element {
  const profileQuery = trpc.user.getCurrentUserProfile.useQuery();

  const [state, formAction] = useActionState<UpdateMeFormState, FormData>(
    updateMeFormAction,
    initialUpdateMeFormState,
  );

  const {
    register,
    reset,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<UpdateMeFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      pseudo: "",
      aboutMe: "",
      phone: "",
      birthDate: "",
      avatar: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    const p = profileQuery.data;

    reset(
      {
        firstName: p.firstName ?? "",
        lastName: p.lastName ?? "",
        pseudo: p.pseudo ?? "",
        aboutMe: p.aboutMe ?? "",
        phone: p.phone ?? "",
        birthDate: (p.birthDate as string | null) ?? "",
        avatar: p.avatar ?? "",
      },
      { keepDirty: false },
    );
  }, [profileQuery.data, reset]);

  useEffect(() => {
    if (state.status === "success") {
      clearErrors();
      return;
    }

    if (state.status !== "error") return;
    if (!state.fieldErrors) return;

    clearErrors();

    const fe = state.fieldErrors;

    if (fe.firstName)
      setError("firstName", { type: "server", message: fe.firstName });
    if (fe.lastName)
      setError("lastName", { type: "server", message: fe.lastName });
    if (fe.pseudo) setError("pseudo", { type: "server", message: fe.pseudo });
    if (fe.aboutMe)
      setError("aboutMe", { type: "server", message: fe.aboutMe });
    if (fe.phone) setError("phone", { type: "server", message: fe.phone });
    if (fe.birthDate)
      setError("birthDate", { type: "server", message: fe.birthDate });
    if (fe.avatar) setError("avatar", { type: "server", message: fe.avatar });
  }, [state, setError, clearErrors]);

  useEffect(() => {
    if (state.status !== "success") return;
    profileQuery.refetch();
  }, [state.status, profileQuery]);

  const loading = profileQuery.isLoading;
  const loadError = profileQuery.error;

  const canSubmit = useMemo(() => {
    return !loading && !loadError && isDirty;
  }, [loading, loadError, isDirty]);

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Mon profil</h2>
        <p className="text-sm text-slate-600">
          Mets à jour tes informations. Le rôle est géré par l’admin.
        </p>
      </header>

      {loading && <div>Chargement…</div>}

      {loadError && (
        <div className="text-sm text-red-600">
          Impossible de charger le profil : {loadError.message}
        </div>
      )}

      {state.status === "error" && state.error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {state.status === "success" && state.message && (
        <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          {state.message}
        </div>
      )}

      <form action={formAction} className="max-w-xl space-y-4">
        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className="text-sm">Prénom</span>
            <input
              className="border rounded px-3 py-2"
              {...register("firstName")}
            />
            {errors.firstName?.message && (
              <span className="text-xs text-red-600">
                {errors.firstName.message}
              </span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Nom</span>
            <input
              className="border rounded px-3 py-2"
              {...register("lastName")}
            />
            {errors.lastName?.message && (
              <span className="text-xs text-red-600">
                {errors.lastName.message}
              </span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Pseudo</span>
            <input
              className="border rounded px-3 py-2"
              {...register("pseudo")}
            />
            {errors.pseudo?.message && (
              <span className="text-xs text-red-600">
                {errors.pseudo.message}
              </span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Téléphone</span>
            <input
              className="border rounded px-3 py-2"
              {...register("phone")}
            />
            {errors.phone?.message && (
              <span className="text-xs text-red-600">
                {errors.phone.message}
              </span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Date de naissance</span>
            <input
              type="date"
              className="border rounded px-3 py-2"
              {...register("birthDate")}
            />
            {errors.birthDate?.message && (
              <span className="text-xs text-red-600">
                {errors.birthDate.message}
              </span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">À propos</span>
            <textarea
              className="min-h-24 border rounded px-3 py-2"
              {...register("aboutMe")}
            />
            {errors.aboutMe?.message && (
              <span className="text-xs text-red-600">
                {errors.aboutMe.message}
              </span>
            )}
          </label>

          <div className="grid gap-2">
            <span className="text-sm">Photo de profil</span>
            {/* Flux AUTONOME : l'avatar se sauve seul (upload → register →
                User.avatar). On synchronise le champ caché du form pour
                cohérence, mais la persistance ne dépend pas du submit. */}
            <AvatarUploader
              onChanged={(publicId) =>
                setValue("avatar", publicId ?? "", { shouldDirty: false })
              }
            />
            <input type="hidden" {...register("avatar")} />
            {errors.avatar?.message && (
              <span className="text-xs text-red-600">
                {errors.avatar.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SubmitButton disabled={!canSubmit} />
          {!isDirty && (
            <span className="text-xs text-slate-500">
              Aucun changement à enregistrer.
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
FILE_EOF

echo
pnpm --filter web typecheck