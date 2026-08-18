#!/usr/bin/env bash
#
# AKFC — Notifications : CLOCHE COLLABORATIVE (membre).
#
# Nouveau composant `CollaborativeBell` calqué sur `NotificationBell` :
#   - visible seulement si le membre a au moins un espace collaboratif ;
#   - badge = `memberDocument.collaborativeUnreadCountForMe` (notif1) ;
#   - lien vers le finder membre `/mes-espaces` ;
#   - muette (icône `Users`) sans rien de neuf ; cloche + badge + tooltip quand
#     il y a des documents non lus.
# Branché dans le Header (desktop + mobile), à côté de la cloche bibliothèque.
#
# Prérequis : notif1 (query) + passerelle/3b-spaces (myCollaborativeSpaces).
# Front NON testé → valider. Pas de migration.
# Usage : bash apply-collab-notif2-bell.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-notif2-bell.sh   (clone)
#
set -euo pipefail

BELL="apps/web/src/features/app-shell/CollaborativeBell.tsx"
HEADER="apps/web/src/features/app-shell/Header.tsx"

for f in "package.json" "$HEADER"; do
  [ -f "$f" ] || { echo "ERREUR: fichier manquant: $f." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── composant ───────────────────────────────────────────────────────────────
if [ ! -f "$BELL" ]; then
  cat > "$BELL" <<'TSX'
"use client";

import { type JSX } from "react";
import Link from "next/link";
import { Bell, Users } from "lucide-react";

import { trpc } from "@trpc/trpcClient";

/**
 * Cloche des espaces COLLABORATIFS — côté membre, à gauche de l'avatar.
 *
 * Compte les documents non lus déposés dans ses espaces de groupe (héritage
 * compris) et mène au finder membre (`/mes-espaces`). Muette (icône « groupe »)
 * quand il n'y a rien de neuf ; cloche + badge + tooltip dès qu'un document non
 * lu apparaît. Absente si le membre n'a aucun espace collaboratif.
 *
 * Distincte de la cloche « bibliothèque » (NotificationBell, réservée aux
 * gestionnaires) : ici c'est le collaboratif, pas le perso/diffusion.
 */
export function CollaborativeBell(): JSX.Element | null {
  const { data: spaces } = trpc.storage.myCollaborativeSpaces.useQuery();
  const { data: unread } =
    trpc.memberDocument.collaborativeUnreadCountForMe.useQuery();

  if (!spaces || spaces.length === 0) return null;

  const total = unread ?? 0;
  const s = total > 1 ? "s" : "";
  const message = `${total} nouveau${s === "s" ? "x" : ""} document${s} dans vos espaces collaboratifs`;

  return (
    <div className="group relative">
      <style>{`
        @keyframes akfc-collab-bell-shake {
          0%, 15%, 100% { transform: rotate(0deg); }
          2%  { transform: rotate(14deg); }
          5%  { transform: rotate(-12deg); }
          8%  { transform: rotate(9deg); }
          11% { transform: rotate(-6deg); }
          13% { transform: rotate(3deg); }
        }
        .akfc-collab-bell-shaking {
          animation: akfc-collab-bell-shake 6s ease-in-out infinite;
          transform-origin: top center;
        }
        @media (prefers-reduced-motion: reduce) {
          .akfc-collab-bell-shaking { animation: none; }
        }
      `}</style>

      <Link
        href="/mes-espaces"
        aria-label={total > 0 ? message : "Mes espaces collaboratifs"}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        {total > 0 ? (
          <>
            <Bell className="akfc-collab-bell-shaking h-5 w-5" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {total}
            </span>
          </>
        ) : (
          <Users className="h-5 w-5" aria-hidden />
        )}
      </Link>

      {total > 0 && (
        <div
          role="tooltip"
          className="absolute right-0 top-full z-50 hidden pt-1 group-hover:block"
        >
          <div className="w-max max-w-80 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
            {message}
          </div>
        </div>
      )}
    </div>
  );
}
TSX
  echo "composant écrit : $BELL"
else
  echo "composant déjà présent"
fi

# ── Header : import + 2 emplacements ────────────────────────────────────────
python3 - "$HEADER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "CollaborativeBell" in s:
    print("Header déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

s = sub('import { NotificationBell } from "@features/app-shell/NotificationBell";',
        'import { NotificationBell } from "@features/app-shell/NotificationBell";\n'
        'import { CollaborativeBell } from "@features/app-shell/CollaborativeBell";',
        "import")

# desktop
s = sub("                <NotificationBell />\n                <UserMenu />",
        "                <NotificationBell />\n                <CollaborativeBell />\n                <UserMenu />",
        "desktop")

# mobile
s = sub("            <NotificationBell />\n          </Suspense>",
        "            <NotificationBell />\n            <CollaborativeBell />\n          </Suspense>",
        "mobile")

p.write_text(s, encoding="utf-8")
print("Header patché (CollaborativeBell desktop + mobile)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(notif): cloche collaborative membre (badge non-lus → /mes-espaces)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front non testé — valider : la cloche apparaît pour un membre avec espaces ; badge si documents non lus ; mène à /mes-espaces."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi