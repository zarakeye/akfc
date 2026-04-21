"use client";

import { JSX, useEffect, useMemo } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { useFormStatus } from "react-dom";

import { trpc } from "@/core/trpc/trpcClient";
import {
  updateMeFormAction,
  initialUpdateMeFormState,
} from "./updateMeForm.action";
import type {
  UpdateMeFormState,
  UpdateMeFormValues,
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
    initialUpdateMeFormState
  );

  const {
    register,
    reset,
    setError,
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
      { keepDirty: false }
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

    if (fe.firstName) setError("firstName", { type: "server", message: fe.firstName });
    if (fe.lastName) setError("lastName", { type: "server", message: fe.lastName });
    if (fe.pseudo) setError("pseudo", { type: "server", message: fe.pseudo });
    if (fe.aboutMe) setError("aboutMe", { type: "server", message: fe.aboutMe });
    if (fe.phone) setError("phone", { type: "server", message: fe.phone });
    if (fe.birthDate) setError("birthDate", { type: "server", message: fe.birthDate });
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
            <input className="border rounded px-3 py-2" {...register("firstName")} />
            {errors.firstName?.message && (
              <span className="text-xs text-red-600">{errors.firstName.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Nom</span>
            <input className="border rounded px-3 py-2" {...register("lastName")} />
            {errors.lastName?.message && (
              <span className="text-xs text-red-600">{errors.lastName.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Pseudo</span>
            <input className="border rounded px-3 py-2" {...register("pseudo")} />
            {errors.pseudo?.message && (
              <span className="text-xs text-red-600">{errors.pseudo.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Téléphone</span>
            <input className="border rounded px-3 py-2" {...register("phone")} />
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
            />
            {errors.birthDate?.message && (
              <span className="text-xs text-red-600">{errors.birthDate.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">À propos</span>
            <textarea
              className="min-h-24 border rounded px-3 py-2"
              {...register("aboutMe")}
            />
            {errors.aboutMe?.message && (
              <span className="text-xs text-red-600">{errors.aboutMe.message}</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Avatar (URL)</span>
            <input className="border rounded px-3 py-2" {...register("avatar")} />
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