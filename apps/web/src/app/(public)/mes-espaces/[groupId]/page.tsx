"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CornerLeftUp, Folder as FolderIcon, FileText } from "lucide-react";

import { trpc } from "@trpc/trpcClient";

/**
 * Parcours en LECTURE d'un espace collaboratif — page MEMBRE
 * `(public)/mes-espaces/[groupId]`.
 *
 * Navigue dossier par dossier via `storage.getTree` (profondeur 1) rooté sur
 * le chemin de l'espace. Lecture autorisée par la garde de lecture (1e) ;
 * aucune action admin, corbeille, ni déplacement. Le dépôt (éditeur) arrive à
 * l'incrément suivant.
 */
export default function EspacePage(): JSX.Element {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;

  const spacesQuery = trpc.storage.myCollaborativeSpaces.useQuery();
  const space =
    (spacesQuery.data ?? []).find((s) => s.groupId === groupId) ?? null;

  const [path, setPath] = useState<string | null>(null);
  const currentPath = path ?? space?.path ?? null;

  const treeQuery = trpc.storage.getTree.useQuery(
    { path: currentPath ?? "", depth: 1 },
    { enabled: Boolean(currentPath) },
  );

  if (spacesQuery.isLoading) {
    return <div className="mx-auto max-w-3xl p-6">Chargement…</div>;
  }
  if (!space) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Link
          href="/mes-espaces"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Mes espaces
        </Link>
        <p className="mt-6 text-sm text-gray-500">
          Espace introuvable ou inaccessible.
        </p>
      </div>
    );
  }

  const children = treeQuery.data?.root.children ?? [];
  const atRoot = currentPath === space.path;

  const goUp = (): void => {
    if (!currentPath || atRoot) return;
    const parent = currentPath.split("/").slice(0, -1).join("/");
    setPath(parent.length >= space.path.length ? parent : space.path);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link
        href="/mes-espaces"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" /> Mes espaces
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{space.name}</h1>
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
      </div>

      {!atRoot && (
        <button
          type="button"
          onClick={goUp}
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:underline"
        >
          <CornerLeftUp className="h-4 w-4" /> Dossier parent
        </button>
      )}

      {treeQuery.isLoading && (
        <p className="text-sm text-gray-500">Chargement du dossier…</p>
      )}
      {treeQuery.isError && (
        <p className="text-sm text-red-600">Impossible de lire ce dossier.</p>
      )}
      {treeQuery.data && children.length === 0 && (
        <p className="text-sm text-gray-500">Dossier vide.</p>
      )}

      <ul className="space-y-1">
        {children.map((child) =>
          child.type === "folder" ? (
            <li key={child.path}>
              <button
                type="button"
                onClick={() => setPath(child.path)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
              >
                <FolderIcon className="h-4 w-4 shrink-0 text-gray-400" />
                {child.name}
              </button>
            </li>
          ) : (
            <li
              key={child.path}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm"
            >
              <FileText className="h-4 w-4 shrink-0 text-gray-400" />
              {child.name}
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
