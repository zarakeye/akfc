"use client";

import { useEffect, useMemo } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { useFormStatus } from "react-dom";

import { trpc } from "@/lib/trpcClient";
import {
  updateUserFormAction,
  initialUpdateUserFormState,
  type UpdateUserFormState,
} from "@/server/actions/updateUserForm.action";

/**
 * UpdateMe.form.tsx
 *
 * Pattern hybride (comme le reste de ton projet) :
 * - react-hook-form pour gérer l’UX des champs (defaultValues, contrôles, etc.)
 * - useActionState pour exécuter la server action et récupérer un state typé
 *
 * Important :
 * - Les champs name=... doivent matcher ceux attendus par updateUserFormAction()
 * - La validation finale est côté serveur (Zod + DB)
 */

type UpdateMeFormValues = {
  firstName: string;
  lastName: string;
  pseudo?: string;
  aboutMe?: string;
  phone?: string;
  birthDate?: string; // YYYY-MM-DD
  avatar?: string;
};

function SubmitButton(props: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
      disabled={pending || props.disabled}
    >
      {pending ? "Enregistrement..." : "Enregistrer"}
    </button>
  );
}

export default function UpdateMeForm() {
  // 1) Profil (source pour hydrate le form)
  const profileQuery = trpc.user.getCurrentUserProfile.useQuery();

  // 2) Action server (useActionState)
  const [state, formAction] = useActionState<UpdateUserFormState, FormData>(
    updateUserFormAction,
    initialUpdateUserFormState
  );

  // 3) RHF
  const {
    register,
    reset,
    setError,
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

  // 4) Hydrate le form depuis le profil
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
      { keepDirty: false }
    );
  }, [profileQuery.data, reset]);

  // 5) Remonter les fieldErrors serveur vers RHF (affichage inline)
  useEffect(() => {
    if (!state?.fieldErrors) return;

    const fe = state.fieldErrors;

    if (fe.firstName) setError("firstName", { type: "server", message: fe.firstName });
    if (fe.lastName) setError("lastName", { type: "server", message: fe.lastName });
    if (fe.pseudo) setError("pseudo", { type: "server", message: fe.pseudo });
    if (fe.aboutMe) setError("aboutMe", { type: "server", message: fe.aboutMe });
    if (fe.phone) setError("phone", { type: "server", message: fe.phone });
    if (fe.birthDate) setError("birthDate", { type: "server", message: fe.birthDate });
    if (fe.avatar) setError("avatar", { type: "server", message: fe.avatar });
  }, [state, setError]);

  // 6) Après succès : on refetch profil pour être sûr d’être aligné DB
  useEffect(() => {
    if (!state.ok) return;
    profileQuery.refetch();
  }, [state.ok]); // eslint-disable-line react-hooks/exhaustive-deps

  const loading = profileQuery.isLoading;
  const loadError = profileQuery.error;

  const canSubmit = useMemo(() => {
    // Option: empêcher submit si rien n’a changé
    // Tu peux enlever isDirty si tu veux permettre un submit "idempotent"
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

      {/* Message global serveur */}
      {state.formError && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {state.formError}
        </div>
      )}

      {state.ok && state.message && (
        <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          {state.message}
        </div>
      )}

      {/* IMPORTANT : on soumet via action={formAction} pour useActionState */}
      <form action={formAction} className="space-y-4 max-w-xl">
        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className="text-sm">Prénom</span>
            <input
              className="border rounded px-3 py-2"
              {...register("firstName")}
              name="firstName"
            />
            {errors.firstName?.message && (
              <span className="text-xs text-red-600">{errors.firstName.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Nom</span>
            <input className="border rounded px-3 py-2" {...register("lastName")} name="lastName" />
            {errors.lastName?.message && (
              <span className="text-xs text-red-600">{errors.lastName.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Pseudo</span>
            <input className="border rounded px-3 py-2" {...register("pseudo")} name="pseudo" />
            {errors.pseudo?.message && (
              <span className="text-xs text-red-600">{errors.pseudo.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Téléphone</span>
            <input className="border rounded px-3 py-2" {...register("phone")} name="phone" />
            {errors.phone?.message && (
              <span className="text-xs text-red-600">{errors.phone.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Date de naissance</span>
            <input
              type="date"
              className="border rounded px-3 py-2"
              {...register("birthDate")}
              name="birthDate"
            />
            {errors.birthDate?.message && (
              <span className="text-xs text-red-600">{errors.birthDate.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">À propos</span>
            <textarea
              className="border rounded px-3 py-2 min-h-[96px]"
              {...register("aboutMe")}
              name="aboutMe"
            />
            {errors.aboutMe?.message && (
              <span className="text-xs text-red-600">{errors.aboutMe.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Avatar (URL)</span>
            <input className="border rounded px-3 py-2" {...register("avatar")} name="avatar" />
            {errors.avatar?.message && (
              <span className="text-xs text-red-600">{errors.avatar.message}</span>
            )}
          </label>
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