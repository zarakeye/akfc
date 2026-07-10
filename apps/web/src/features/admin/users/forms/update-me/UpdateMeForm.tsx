"use client";

import { JSX, useEffect, useMemo } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { useFormStatus } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

/** Destination de retour selon le contexte d'appel (?from=). */
function resolveBackHref(from: string | null): { href: string; label: string } {
  if (from === "dashboard") {
    return { href: "/dashboard", label: "Retour au tableau de bord" };
  }
  return { href: "/profil", label: "Retour au profil" };
}

export default function UpdateMeForm(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const back = resolveBackHref(searchParams.get("from"));

  const profileQuery = trpc.user.getCurrentUserProfile.useQuery();

  const [state, formAction] = useActionState<UpdateMeFormState, FormData>(
    updateMeFormAction,
    initialUpdateMeFormState,
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
  }, [state, setError, clearErrors]);

  useEffect(() => {
    if (state.status !== "success") return;
    profileQuery.refetch();
    // Redirige vers la page d'où l'on vient (profil ou dashboard).
    router.push(back.href);
  }, [state.status, profileQuery, router, back.href]);

  const loading = profileQuery.isLoading;
  const loadError = profileQuery.error;

  const canSubmit = useMemo(() => {
    return !loading && !loadError && isDirty;
  }, [loading, loadError, isDirty]);

  return (
    <section className="space-y-4">
      <Link
        href={back.href}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {back.label}
      </Link>

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
                User.avatar), indépendamment du submit de ce formulaire. */}
            <AvatarUploader />
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
