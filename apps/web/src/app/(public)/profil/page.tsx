"use client";

import { useMemo, type JSX } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { UserPortrait } from "@features/social/UserPortrait";
import { formatUserName, type DisplayUser } from "@features/social/userDisplay";
import { InstructorBioEditor } from "@features/social/InstructorBioEditor";
import { MyImageConsent } from "@features/image-consent/MyImageConsent";

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
    return <div className="akfc-page py-12">Chargement…</div>;
  }
  if (error || !data || !displayUser) {
    return (
      <div className="akfc-page py-12 text-red-600">
        Impossible de charger votre profil.
      </div>
    );
  }

  return (
    <div className="akfc-page py-12">
      {/* Identité et coordonnées : du contenu de formulaire, qui se lit mieux
          à la mesure. Étalés sur tout le puits, cinq champs courts en deux
          colonnes donneraient des lignes minuscules séparées par du vide. Le
          puits large existe pour le builder de bio, plus bas. */}
      <section className="akfc-measure-block">
        <div className="mb-8 flex items-center gap-4">
          <div className="scale-150">
            <UserPortrait user={displayUser} size="md" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {formatUserName(displayUser)}
            </h1>
            <p className="text-sm text-gray-500">{data.email}</p>
          </div>
          <Link
            href="/profil/edit?from=profil"
            data-tour="profil.edit"
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

        {/* Droit d'accès et de portabilité (RGPD) : export JSON de ses propres données. */}
        <div className="mt-10 rounded-lg border border-border p-4 text-sm" data-tour="profil.export">
          <p className="font-semibold">Vos données</p>
          <p className="mt-1 text-gray-600">
            Téléchargez tout ce que le site conserve à votre sujet (compte, groupes, demandes, contributions,
            documents). Pour faire corriger ou supprimer vos données, écrivez-nous ; voir la{" "}
            <Link href="/infos/confidentialite" className="text-emerald-700 hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
          <a
            href="/api/me/export"
            download
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 font-medium hover:bg-gray-50"
          >
            Télécharger mes données
          </a>
        </div>

        {/* Droit à l'image : formulaire vierge, statut, formulaires signés (aperçu au clic). */}
        <div data-tour="profil.image-consent">
          <MyImageConsent />
        </div>
      </section>

      {/* Ne s'affiche que pour un instructeur titulaire (le composant se
          rend `null` sinon, sur décision du backend). */}
      <InstructorBioEditor />
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
