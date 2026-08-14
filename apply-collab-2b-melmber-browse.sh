#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, incrément 2b (FRONT) : finder membre — parcours
# en lecture d'un espace.
#
#   - Nouvelle route MEMBRE `(public)/mes-espaces/[groupId]/page.tsx` : ouvre
#     l'espace du groupe et parcourt son contenu (dossiers/fichiers) via
#     `storage.getTree` rooté sur `space.path`, navigation dossier par dossier
#     (profondeur 1). LECTURE seule — autorisée par la garde de 1e ; aucune
#     procédure admin, ni corbeille, ni move/rename.
#   - `(public)/mes-espaces/page.tsx` : chaque espace devient un lien vers sa
#     fiche.
#
# FRONT non exécutable sur le clone → livré NON TESTÉ, à valider à l'écran.
# Prérequis : 1e + 2a appliqués. Pas de migration.
#
# Usage : bash apply-collab-2b-member-browse.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-2b-member-browse.sh   (clone)
#
set -euo pipefail

LIST="apps/web/src/app/(public)/mes-espaces/page.tsx"
DETAIL="apps/web/src/app/(public)/mes-espaces/[groupId]/page.tsx"

if [ ! -f "package.json" ] || [ ! -f "$LIST" ]; then
  echo "ERREUR: lance depuis la racine du repo ; 2a doit être appliqué ($LIST attendu)." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier collaboratif va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

mkdir -p "apps/web/src/app/(public)/mes-espaces/[groupId]"

# ── 1) rendre les items de la liste cliquables ──────────────────────────────
python3 - "$LIST" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if 'href={`/mes-espaces/' in s:
    print("liste déjà à jour")
else:
    IMP_OLD = ('import { JSX } from "react";\n'
               "\n"
               'import { trpc } from "@trpc/trpcClient";')
    IMP_NEW = ('import { JSX } from "react";\n'
               'import Link from "next/link";\n'
               "\n"
               'import { trpc } from "@trpc/trpcClient";')
    assert s.count(IMP_OLD) == 1, "ancre imports introuvable"
    s = s.replace(IMP_OLD, IMP_NEW)

    LI_OLD = (
        '            <li\n'
        '              key={space.groupId}\n'
        '              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"\n'
        '            >\n'
        '              <span className="font-medium">{space.name}</span>\n'
        '              <span\n'
        '                className={\n'
        '                  "rounded-full px-2 py-0.5 text-xs font-medium " +\n'
        '                  (space.access === "EDITOR"\n'
        '                    ? "bg-emerald-100 text-emerald-700"\n'
        '                    : "bg-gray-100 text-gray-600")\n'
        '                }\n'
        '              >\n'
        '                {space.access === "EDITOR" ? "éditeur" : "lecteur"}\n'
        '              </span>\n'
        '            </li>'
    )
    LI_NEW = (
        '            <li key={space.groupId}>\n'
        '              <Link\n'
        '                href={`/mes-espaces/${space.groupId}`}\n'
        '                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50"\n'
        '              >\n'
        '                <span className="font-medium">{space.name}</span>\n'
        '                <span\n'
        '                  className={\n'
        '                    "rounded-full px-2 py-0.5 text-xs font-medium " +\n'
        '                    (space.access === "EDITOR"\n'
        '                      ? "bg-emerald-100 text-emerald-700"\n'
        '                      : "bg-gray-100 text-gray-600")\n'
        '                  }\n'
        '                >\n'
        '                  {space.access === "EDITOR" ? "éditeur" : "lecteur"}\n'
        '                </span>\n'
        '              </Link>\n'
        '            </li>'
    )
    assert s.count(LI_OLD) == 1, "ancre <li> liste introuvable"
    s = s.replace(LI_OLD, LI_NEW)

    p.write_text(s, encoding="utf-8")
    print("liste patchée (items cliquables)")
PY

# ── 2) route de parcours ────────────────────────────────────────────────────
cat > "$DETAIL" <<'EOF'
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
            <li key={child.fullPath}>
              <button
                type="button"
                onClick={() => setPath(child.fullPath)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
              >
                <FolderIcon className="h-4 w-4 shrink-0 text-gray-400" />
                {child.name}
              </button>
            </li>
          ) : (
            <li
              key={child.fullPath}
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
EOF
echo "écrit : $DETAIL"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct, sans pnpm clean)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification"; exit 0
fi

git add -A
if git commit -m "feat(groups): finder membre — parcours lecture d'un espace ([groupId] via getTree)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front livré NON testé — à valider à l'écran (/mes-espaces → un espace)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi