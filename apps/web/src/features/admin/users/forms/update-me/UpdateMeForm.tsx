"use client";

import { JSX, useEffect, useMemo } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { useFormStatus } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { useSessionStore } from "#lib/stores/useSessionStore.ts";
import { AvatarUploader } from "#features/avatar/AvatarUploader.tsx";
import { BlankConsentFormCard } from "#features/image-consent/BlankConsentFormCard.tsx";
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
      // Couleurs du thème : en mode sombre, un bouton noir disparaissait sur le fond de la page.
      className="rounded bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas. Mémorisé, le rendu ne se relançait pas à la frappe : isDirty
  // restait faux et le bouton « Enregistrer » ne s'activait jamais.
  "use no memo";
  const router = useRouter();
  const searchParams = useSearchParams();
  const back = resolveBackHref(searchParams.get("from"));

  const profileQuery = trpc.user.getCurrentUserProfile.useQuery();
  // Date de naissance vérifiée par un instructeur : non modifiable ici.
  const birthDateLock = trpc.imageConsent.onlineState.useQuery().data?.birthDateLock ?? null;
  const birthDateLocked = birthDateLock !== null;

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
    // La session du store date du chargement de la page : elle porte encore
    // `isFirstLogin` et l'ancien nom. Une server action ne la rafraîchit pas.
    // On la relit AVANT de partir, sinon FirstLoginRedirect ramènerait aussitôt
    // ici, et le header garderait l'ancien nom.
    // Redirige ensuite vers la page d'où l'on vient (profil ou dashboard).
    void useSessionStore
      .getState()
      .fetchSession()
      .then(() => router.push(back.href));
  }, [state.status, profileQuery, router, back.href]);

  const loading = profileQuery.isLoading;
  const loadError = profileQuery.error;
  const isFirstLogin = useSessionStore((s) => s.session?.user?.isFirstLogin ?? false);

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

      {isFirstLogin && (
        <div className="rounded border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100">
          <p className="font-medium">Bienvenue !</p>
          <p className="mt-1">
            Complète ton profil ci-dessous et enregistre-le : le site te ramène ici tant
            que ce n&apos;est pas fait.
          </p>
        </div>
      )}

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
              className="border rounded px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
              disabled={birthDateLocked}
              {...register("birthDate")}
            />
            {birthDateLock === "GUARDIAN" && (
              <span className="text-xs text-gray-500">
                C&apos;est votre parent référent qui la confirme ou la corrige, quand il valide votre droit à
                l&apos;image : indiquez vos souhaits, il recevra le lien.
              </span>
            )}
            {birthDateLock === "CLUB" && (
              <span className="text-xs text-gray-500">
                Renseignée par le club : pour la corriger, adressez-vous à un instructeur.
              </span>
            )}
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

          <div className="grid gap-2" data-tour="profil.form.avatar">
            <span className="text-sm">Photo de profil</span>
            {/* Flux AUTONOME : l'avatar se sauve seul (upload → register →
                User.avatar), indépendamment du submit de ce formulaire. */}
            <AvatarUploader />
          </div>
        </div>

        {/* Le bouton juste sous les champs : placé après la carte du formulaire de droit à l'image,
            il passait inaperçu. */}
        <div className="flex items-center gap-3" data-tour="profil.form.submit">
          <SubmitButton disabled={!canSubmit} />
          {!isDirty && (
            <span className="text-xs text-muted-foreground">
              Modifiez un champ pour pouvoir enregistrer.
            </span>
          )}
        </div>

        {/* Première connexion comme édition : le droit à l'image, le texte à lire, la page où le donner. */}
        <BlankConsentFormCard linkToPage />
      </form>
    </section>
  );
}
