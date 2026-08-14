#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, incrément 2a (FRONT) : finder membre v1 — la
# page d'entrée « Mes espaces collaboratifs ».
#
# Pourquoi une page dédiée (et pas le Finder admin) : le composant `Finder`
# appelle `trash.listBin` (procédure ADMIN-only) et expose move/rename/
# publication → il casserait pour un membre et exposerait des actions admin.
# Le finder membre est donc un composant LÉGER dédié, lecture d'abord.
#
# 2a = l'entrée : une page sous `(public)` (comme `/documents`) qui liste les
# espaces collaboratifs du membre via `storage.myCollaborativeSpaces` (posée en
# 1e), avec le rôle (éditeur/lecteur) par espace. Le PARCOURS du contenu
# (getTree rooté sur l'espace) et le DÉPÔT (upload `kind:"group"`) viennent
# ensuite, en composants membres légers.
#
# FRONT non exécutable sur le clone → livré NON TESTÉ, à valider à l'écran.
# Prérequis : 1e appliqué (query `storage.myCollaborativeSpaces`). Pas de migration.
#
# Usage : bash apply-collab-2a-member-spaces-page.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-2a-member-spaces-page.sh   (clone)
#
set -euo pipefail

PAGE="apps/web/src/app/(public)/mes-espaces/page.tsx"

if [ ! -f "package.json" ] || [ ! -d "apps/web/src/app/(public)" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC (dossier (public) attendu)." >&2
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

mkdir -p "apps/web/src/app/(public)/mes-espaces"

cat > "$PAGE" <<'EOF'
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
EOF
echo "écrit : $PAGE"

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
if git commit -m "feat(groups): finder membre v1 — page 'Mes espaces collaboratifs' (myCollaborativeSpaces)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front livré NON testé — à valider à l'écran (/mes-espaces)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi