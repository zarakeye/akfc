"use client";

import { JSX } from "react";
import Link from "next/link";

import { trpc } from "@trpc/trpcClient";

/**
 * Mes espaces collaboratifs — page MEMBRE (`(public)/mes-espaces`).
 *
 * Affiche l'ARBORESCENCE des espaces accessibles (héritage compris) : groupes
 * de plus haut niveau, descendants imbriqués dessous (reconstruits à partir de
 * `parentGroupId`). Chaque espace mène à son parcours `/mes-espaces/[groupId]`.
 */
export default function MesEspacesPage(): JSX.Element {
  const { data, isLoading, isError } =
    trpc.storage.myCollaborativeSpaces.useQuery();

  const spaces = data ?? [];
  type Space = (typeof spaces)[number];

  const ids = new Set(spaces.map((s) => s.groupId));
  const childrenOf = new Map<string, Space[]>();
  const roots: Space[] = [];
  for (const s of spaces) {
    if (s.parentGroupId && ids.has(s.parentGroupId)) {
      const arr = childrenOf.get(s.parentGroupId) ?? [];
      arr.push(s);
      childrenOf.set(s.parentGroupId, arr);
    } else {
      roots.push(s);
    }
  }

  const renderNode = (s: Space, depth: number): JSX.Element => {
    const children = childrenOf.get(s.groupId) ?? [];
    return (
      <li key={s.groupId}>
        <Link
          href={`/mes-espaces/${s.groupId}`}
          style={{ marginLeft: `${depth * 1.25}rem` }}
          className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3 hover:bg-gray-50"
        >
          <span className="font-medium">{s.name}</span>
          <span
            className={
              "rounded-full px-2 py-0.5 text-xs font-medium " +
              (s.access === "EDITOR"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600")
            }
          >
            {s.access === "EDITOR" ? "éditeur" : "lecteur"}
          </span>
        </Link>
        {children.length > 0 && (
          <ul className="mt-1 space-y-1">
            {children.map((c) => renderNode(c, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Mes espaces collaboratifs</h1>

      {isLoading && <p className="text-sm text-gray-500">Chargement…</p>}
      {isError && (
        <p className="text-sm text-red-600">
          Impossible de charger vos espaces pour le moment.
        </p>
      )}
      {data && spaces.length === 0 && (
        <p className="text-sm text-gray-500">
          Vous n'appartenez à aucun espace collaboratif pour le moment.
        </p>
      )}
      {spaces.length > 0 && (
        <ul className="space-y-1">{roots.map((r) => renderNode(r, 0))}</ul>
      )}
    </div>
  );
}
