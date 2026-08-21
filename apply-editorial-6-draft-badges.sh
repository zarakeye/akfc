#!/usr/bin/env bash
#
# AKFC — Refonte « pages éditoriales » R6 : visibilité admin des brouillons de pages.
#
#   - `DraftPageBadge` (client) monté dans le layout public : si un ADMIN visite
#     une page éditoriale en brouillon (home/about/contacts), un badge flottant
#     « Page non publiée » s'affiche.
#   - ControlPanelSidebar : compteur des pages éditoriales non publiées sur
#     l'item « Pages éditoriales ».
#
# Prérequis : brique 1 (pageVisibility) + R1 (registre) + R2 (item « Pages
# éditoriales » dans la sidebar). Front NON testé. Pas de migration.
# Usage : bash apply-editorial-6-draft-badges.sh
#         AKFC_APPLY_ONLY=1 bash apply-editorial-6-draft-badges.sh   (clone)
#
set -euo pipefail

BADGE="apps/web/src/features/app-shell/DraftPageBadge.tsx"
LAYOUT="apps/web/src/app/(public)/layout.tsx"
SIDEBAR="apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

for f in "package.json" "$LAYOUT" "$SIDEBAR"; do
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

# ── composant DraftPageBadge ────────────────────────────────────────────────
mkdir -p "$(dirname "$BADGE")"
cat > "$BADGE" <<'TSX'
"use client";

import { type JSX } from "react";
import { usePathname } from "next/navigation";

import { useSessionStore } from "@lib/stores/useSessionStore";
import { trpc } from "@trpc/trpcClient";
import { pageKeyForPath } from "@/config/pageRegistry";

/**
 * Badge flottant « Page non publiée » — visible uniquement d'un ADMIN sur une
 * page éditoriale en brouillon (le middleware laisse l'admin voir la vraie page ;
 * ce badge lui rappelle qu'elle n'est pas encore publique).
 */
export function DraftPageBadge(): JSX.Element | null {
  const isAdmin = useSessionStore(
    (s) => s.session?.user?.role?.name === "ADMIN",
  );
  const pathname = usePathname();
  const key = pageKeyForPath(pathname);
  const { data: states } = trpc.pageVisibility.all.useQuery(undefined, {
    enabled: isAdmin && key !== null,
  });

  if (!isAdmin || !key) return null;
  const published =
    (states ?? []).find((s) => s.key === key)?.published ?? false;
  if (published) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
      Page non publiée
    </div>
  );
}
TSX
echo "composant écrit : $BADGE"

# ── montage dans le layout public ───────────────────────────────────────────
python3 - "$LAYOUT" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "DraftPageBadge" in s:
    print("layout déjà à jour"); sys.exit(0)

imp = 'import { FirstLoginRedirect } from "@features/auth/FirstLoginRedirect";\n'
assert s.count(imp) == 1, "ancre import (FirstLoginRedirect) introuvable"
s = s.replace(imp, imp + 'import { DraftPageBadge } from "@features/app-shell/DraftPageBadge";\n')

mnt = "      <Footer />\n"
assert s.count(mnt) == 1, "ancre <Footer /> introuvable"
s = s.replace(mnt, mnt + "      <DraftPageBadge />\n")

p.write_text(s, encoding="utf-8")
print("layout patché (DraftPageBadge monté)")
PY

# ── compteur sur l'item sidebar ─────────────────────────────────────────────
python3 - "$SIDEBAR" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "editorialDraftCount" in s:
    print("sidebar déjà à jour"); sys.exit(0)
if "Pages éditoriales" not in s:
    print("ATTENTION: item « Pages éditoriales » absent (R2 non appliqué) — compteur non posé.")
    sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# imports
s = sub(
    'import { useRouter } from "next/navigation";\n',
    'import { useRouter } from "next/navigation";\n'
    'import { trpc } from "@trpc/trpcClient";\n'
    'import { PAGE_REGISTRY } from "@/config/pageRegistry";\n',
    "imports trpc/registry")

# query + compteur
s = sub(
    "  const role = useSessionStore((state) => state.session?.user?.role);\n",
    "  const role = useSessionStore((state) => state.session?.user?.role);\n"
    "  const isAdmin = role?.name === \"ADMIN\";\n"
    "  const pageVis = trpc.pageVisibility.all.useQuery(undefined, {\n"
    "    enabled: isAdmin,\n"
    "  });\n"
    "  const editorialDraftCount = PAGE_REGISTRY.filter(\n"
    "    (pg) => !(pageVis.data ?? []).some((v) => v.key === pg.key && v.published),\n"
    "  ).length;\n",
    "query+compteur")

# badge dans le bouton
s = sub(
    "                  Pages éditoriales\n",
    "                  Pages éditoriales\n"
    "                  {editorialDraftCount > 0 && (\n"
    "                    <span className=\"ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white\">\n"
    "                      {editorialDraftCount}\n"
    "                    </span>\n"
    "                  )}\n",
    "badge compteur")

p.write_text(s, encoding="utf-8")
print("sidebar patchée (compteur pages éditoriales)")
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
if git commit -m "feat(pages): badge « non publié » (admin) + compteur brouillons sur l'item sidebar" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "✅ R6 OK. Admin sur une page éditoriale en brouillon → badge flottant ; item sidebar → compteur de pages non publiées."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi