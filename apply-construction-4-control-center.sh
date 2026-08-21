#!/usr/bin/env bash
#
# AKFC — Chantier « En construction », BRIQUE 4 : centre de contrôle.
#
#   - Page admin `(admin)/dashboard/pages/page.tsx` : liste le registre des
#     pages avec un toggle « Publiée / En construction » par page + deux actions
#     globales (Tout publier / Tout en construction). Via pageVisibility.all /
#     setPublished / setAll.
#   - Entrée « Publication des pages » dans ControlPanelSidebar (cohérence : la
#     gestion du site passe par la sidebar du dashboard).
#
# Prérequis : brique 1 (router pageVisibility) + brique 2 (registre @/config).
# Front NON testé → valider. Pas de migration.
# Usage : bash apply-construction-4-control-center.sh
#         AKFC_APPLY_ONLY=1 bash apply-construction-4-control-center.sh   (clone)
#
set -euo pipefail

PAGE="apps/web/src/app/(admin)/dashboard/pages/page.tsx"
SIDEBAR="apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

for f in "package.json" "$SIDEBAR"; do
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

# ── page centre de contrôle ─────────────────────────────────────────────────
mkdir -p "$(dirname "$PAGE")"
cat > "$PAGE" <<'TSX'
"use client";

import { type JSX } from "react";

import { trpc } from "@trpc/trpcClient";
import { PAGE_REGISTRY, ALL_PAGE_KEYS } from "@/config/pageRegistry";

/**
 * Centre de contrôle « Publication des pages » (mode « En construction »).
 *
 * Une page non publiée n'est visible que des administrateurs ; publiée, elle
 * l'est du public/des membres. Toggle par page + actions globales.
 */
export default function PagesControlPage(): JSX.Element {
  const utils = trpc.useUtils();
  const { data: states, isLoading } = trpc.pageVisibility.all.useQuery();

  const invalidate = () => void utils.pageVisibility.all.invalidate();
  const setPublished = trpc.pageVisibility.setPublished.useMutation({
    onSuccess: invalidate,
  });
  const setAll = trpc.pageVisibility.setAll.useMutation({ onSuccess: invalidate });

  const publishedByKey = new Map(
    (states ?? []).map((s) => [s.key, s.published] as const),
  );
  const isPublished = (key: string): boolean => publishedByKey.get(key) ?? false;

  const busy = setPublished.isPending || setAll.isPending;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Publication des pages</h1>
      <p className="mb-6 text-sm text-gray-600">
        Une page « en construction » n'est visible que des administrateurs.
        Publiez-la quand elle est prête.
      </p>

      <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <span className="font-medium">Toutes les pages</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              setAll.mutate({ keys: [...ALL_PAGE_KEYS], published: true })
            }
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            Tout publier
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              setAll.mutate({ keys: [...ALL_PAGE_KEYS], published: false })
            }
            className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 disabled:opacity-50"
          >
            Tout en construction
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : (
        <ul className="space-y-1">
          {PAGE_REGISTRY.map((p) => {
            const pub = isPublished(p.key);
            return (
              <li
                key={p.key}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
              >
                <div>
                  <span className="font-medium">{p.label}</span>
                  <span className="ml-2 text-xs text-gray-400">{p.path}</span>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setPublished.mutate({ key: p.key, published: !pub })
                  }
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 " +
                    (pub
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200")
                  }
                >
                  {pub ? "Publiée" : "En construction"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
TSX
echo "page centre de contrôle écrite : $PAGE"

# ── entrée sidebar « Publication des pages » ────────────────────────────────
python3 - "$SIDEBAR" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "/dashboard/pages" in s:
    print("sidebar déjà à jour"); sys.exit(0)

OLD = (
    '            {/* Groupes de membres */}\n'
    '            <li>\n'
    '              <div className="flex">\n'
    '                <button\n'
    '                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"\n'
    '                  onClick={() => router.push("/dashboard/groups")}\n'
    '                >\n'
    '                  Groupes de membres\n'
    '                </button>\n'
    '              </div>\n'
    '            </li>'
)
NEW = OLD + (
    '\n\n'
    '            {/* Publication des pages (mode « En construction ») */}\n'
    '            <li>\n'
    '              <div className="flex">\n'
    '                <button\n'
    '                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"\n'
    '                  onClick={() => router.push("/dashboard/pages")}\n'
    '                >\n'
    '                  Publication des pages\n'
    '                </button>\n'
    '              </div>\n'
    '            </li>'
)
assert s.count(OLD) == 1, "ancre (li Groupes de membres) introuvable/multiple"
s = s.replace(OLD, NEW)
p.write_text(s, encoding="utf-8")
print("sidebar patchée (item « Publication des pages »)")
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
if git commit -m "feat(pages): centre de contrôle /dashboard/pages (toggles publication) + entrée sidebar" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "✅ Chantier « En construction » complet. Valide : /dashboard/pages toggle par page + global ; une page publiée devient visible du public."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi