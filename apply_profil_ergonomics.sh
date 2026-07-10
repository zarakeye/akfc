#!/bin/bash
# Ergonomie profil (compromis C) : /profil reste la page profil CANONIQUE
# (tous roles, non-admins compris). La home du dashboard gagne un bouton
# "Editer" sur son encart "Mes informations" (raccourci admin, pas de page
# profil dupliquee). Le formulaire d edition lit ?from= : lien de retour +
# redirection apres succes CONTEXTUELS (dashboard -> dashboard ; profil ->
# profil ; defaut profil, sur pour les non-admins). /profil/edit enveloppe
# UpdateMeForm dans <Suspense> (requis par useSearchParams en Next 16).
# À lancer depuis la RACINE du monorepo : bash apply_profil_ergonomics.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

echo "-> apps/web/src/features/admin/users/forms/update-me/UpdateMeForm.tsx"
cat > 'apps/web/src/features/admin/users/forms/update-me/UpdateMeForm.tsx' << 'FILE_EOF'
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
FILE_EOF

echo "-> apps/web/src/app/(public)/profil/page.tsx"
cat > 'apps/web/src/app/(public)/profil/page.tsx' << 'FILE_EOF'
"use client";

import { useMemo, type JSX } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  UserPortrait,
  formatUserName,
  type DisplayUser,
} from "@features/social/userDisplay";

/**
 * Page « Mon profil » — accessible à tout membre connecté (le proxy garde
 * `/profil`). Affiche les infos et un bouton « Éditer » vers /profil/edit
 * (le même formulaire que la première connexion). Le rôle est en lecture
 * seule ici : seul un admin le modifie, ailleurs.
 */
export default function ProfilePage(): JSX.Element {
  const { data, isLoading, error } = trpc.user.getCurrentUserProfile.useQuery();

  const displayUser: DisplayUser | null = useMemo(() => {
    if (!data) return null;
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      pseudo: data.pseudo,
      email: data.email,
      avatar: data.avatar,
      image: null,
    };
  }, [data]);

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-12">Chargement…</div>;
  }
  if (error || !data || !displayUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-red-600">
        Impossible de charger votre profil.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="scale-150">
          <UserPortrait user={displayUser} size="md" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{formatUserName(displayUser)}</h1>
          <p className="text-sm text-gray-500">{data.email}</p>
        </div>
        <Link
          href="/profil/edit?from=profil"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Pencil className="h-4 w-4" />
          Éditer
        </Link>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Prénom" value={data.firstName} />
        <Field label="Nom" value={data.lastName} />
        <Field label="Pseudo" value={data.pseudo} />
        <Field label="Téléphone" value={data.phone} />
        <Field label="Date de naissance" value={data.birthDate} />
        <div className="sm:col-span-2">
          <Field label="À propos" value={data.aboutMe} />
        </div>
      </dl>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null;
}): JSX.Element {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800">
        {value?.trim() ? value : <span className="text-gray-400">—</span>}
      </dd>
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/page.tsx' << 'FILE_EOF'
"use client";

import type { JSX } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Globe,
  Award,
  Newspaper,
  Layers,
  Pencil,
} from "lucide-react";

import UserCard from "@features/admin/users/components/UserCard";
import { useSessionStore } from "@lib/stores/useSessionStore";

export default function DashboardHome(): JSX.Element {
  const user = useSessionStore((state) => state.session?.user);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border p-10 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mes informations</h2>
          <Link
            href="/profil/edit?from=dashboard"
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <Pencil className="h-4 w-4" />
            Éditer
          </Link>
        </div>
        <UserCard userId={user?.id ?? ""} />
      </div>

      <div className="rounded-lg border p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">Contenus</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/disciplines"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <Award className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Disciplines</p>
              <p className="text-sm text-muted-foreground">
                Arts enseignés par le club, leur présentation
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/discipline-families"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <Layers className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Familles</p>
              <p className="text-sm text-muted-foreground">
                Regroupements de disciplines pour le menu
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Cours</p>
              <p className="text-sm text-muted-foreground">
                Créneaux hebdomadaires et leur contenu
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/origins"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <Globe className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Origines</p>
              <p className="text-sm text-muted-foreground">
                Racines culturelles des disciplines
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/posts"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <Newspaper className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Actualités</p>
              <p className="text-sm text-muted-foreground">
                Articles et nouvelles du club
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(public)/profil/edit/page.tsx"
cat > 'apps/web/src/app/(public)/profil/edit/page.tsx' << 'FILE_EOF'
import { Suspense, type JSX } from "react";

import UpdateMeForm from "@features/admin/users/forms/update-me/UpdateMeForm";

/**
 * Édition du profil — même formulaire que la première connexion
 * (UpdateMeForm, scellé sur le user connecté). Accessible à tout membre ;
 * le proxy garde `/profil`. Le Suspense est requis car UpdateMeForm lit
 * `useSearchParams` (?from=) pour son lien de retour et sa redirection.
 */
export default function EditProfilePage(): JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Suspense fallback={<div>Chargement…</div>}>
        <UpdateMeForm />
      </Suspense>
    </div>
  );
}
FILE_EOF

echo
pnpm --filter web typecheck