"use client";

import { JSX } from "react";

import { trpc } from "@trpc/trpcClient";

/**
 * Mes espaces collaboratifs — page MEMBRE (`(public)/mes-espaces`).
 *
 * Entrée du finder membre : liste les espaces des groupes collaboratifs
 * auxquels l'utilisateur appartient (via `storage.myCollaborativeSpaces`),
 * avec son rôle (éditeur = dépôt/suppression, lecteur = consultation).
 *
 * Le parcours du contenu (arbre rooté sur l'espace) et le dépôt arrivent dans
 * les incréments suivants, en composants membres légers (le Finder admin n'est
 * pas réutilisable ici : il appelle des procédures admin-only).
 */
export default function MesEspacesPage(): JSX.Element {
  const { data, isLoading, isError } =
    trpc.storage.myCollaborativeSpaces.useQuery();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Mes espaces collaboratifs</h1>

      {isLoading && <p className="text-sm text-gray-500">Chargement…</p>}
      {isError && (
        <p className="text-sm text-red-600">
          Impossible de charger vos espaces pour le moment.
        </p>
      )}

      {data && data.length === 0 && (
        <p className="text-sm text-gray-500">
          Vous n'appartenez à aucun espace collaboratif pour le moment.
        </p>
      )}

      {data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((space) => (
            <li
              key={space.groupId}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <span className="font-medium">{space.name}</span>
              <span
                className={
                  "rounded-full px-2 py-0.5 text-xs font-medium " +
                  (space.access === "EDITOR"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600")
                }
              >
                {space.access === "EDITOR" ? "éditeur" : "lecteur"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
