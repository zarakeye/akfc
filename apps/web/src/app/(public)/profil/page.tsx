"use client";

import { useMemo, type JSX } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { UserPortrait } from "@features/social/UserPortrait";
import { formatUserName, type DisplayUser } from "@features/social/userDisplay";

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
