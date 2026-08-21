#!/usr/bin/env bash
#
# AKFC — Refonte « pages éditoriales » R2 : hub + rename sidebar.
#
#   - `(admin)/dashboard/pages/page.tsx` devient le HUB « Pages éditoriales » :
#     liste les 3 pages (registre) avec, chacune, un badge Publiée/Brouillon, un
#     bouton « Éditer » (→ /dashboard/site-pages/<clé>, le constructeur) et un
#     bouton Publier / Repasser en brouillon (pageVisibility.setPublished).
#     Les toggles globaux « Tout publier/… » sont retirés (superflus à 3 pages).
#   - ControlPanelSidebar : l'item « Publication des pages » est rebaptisé
#     « Pages éditoriales » (même lien /dashboard/pages).
#
# Prérequis : brique 1 (pageVisibility) + R1 (registre réduit) + l'item sidebar
# (brique 4). Front NON testé → valider. Pas de migration.
# Usage : bash apply-editorial-2-hub.sh
#         AKFC_APPLY_ONLY=1 bash apply-editorial-2-hub.sh   (clone)
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

# ── hub « Pages éditoriales » ───────────────────────────────────────────────
mkdir -p "$(dirname "$PAGE")"
cat > "$PAGE" <<'TSX'
"use client";

import { type JSX } from "react";
import { useRouter } from "next/navigation";

import { trpc } from "@trpc/trpcClient";
import { PAGE_REGISTRY } from "@/config/pageRegistry";

/**
 * Hub « Pages éditoriales » — pages au contenu PROPRE (non dynamiques, non
 * alimentées par un autre éditeur). Chaque page : badge d'état, accès à son
 * constructeur, et publication / retour en brouillon.
 */
export default function EditorialPagesHub(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: states, isLoading } = trpc.pageVisibility.all.useQuery();
  const setPublished = trpc.pageVisibility.setPublished.useMutation({
    onSuccess: () => void utils.pageVisibility.all.invalidate(),
  });

  const publishedByKey = new Map(
    (states ?? []).map((s) => [s.key, s.published] as const),
  );
  const isPublished = (key: string): boolean => publishedByKey.get(key) ?? false;
  const busy = setPublished.isPending;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-2xl font-semibold">Pages éditoriales</h1>
      <p className="mb-6 text-sm text-gray-600">
        Pages au contenu propre, non alimentées par un autre éditeur. Composez-les
        dans leur constructeur, puis publiez-les. Une page en brouillon n'est
        visible que des administrateurs.
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : (
        <ul className="space-y-2">
          {PAGE_REGISTRY.map((p) => {
            const pub = isPublished(p.key);
            return (
              <li
                key={p.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.label}</span>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs font-semibold " +
                        (pub
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700")
                      }
                    >
                      {pub ? "Publiée" : "Brouillon"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{p.path}</span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/dashboard/site-pages/${p.key}`)
                    }
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setPublished.mutate({ key: p.key, published: !pub })
                    }
                    className={
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 " +
                      (pub
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700")
                    }
                  >
                    {pub ? "Repasser en brouillon" : "Publier"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
TSX
echo "hub écrit : $PAGE"

# ── rename item sidebar ─────────────────────────────────────────────────────
python3 - "$SIDEBAR" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "Pages éditoriales" in s:
    print("sidebar déjà à jour"); sys.exit(0)
old = "                  Publication des pages\n"
assert s.count(old) == 1, "ancre libellé « Publication des pages » introuvable"
s = s.replace(old, "                  Pages éditoriales\n")
# commentaire d'accompagnement si présent
s = s.replace(
    "{/* Publication des pages (mode « En construction ») */}",
    "{/* Pages éditoriales */}",
)
p.write_text(s, encoding="utf-8")
print("sidebar renommée (Pages éditoriales)")
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
if git commit -m "refactor(pages): hub « Pages éditoriales » (accès builders + publier) + rename sidebar" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "ℹ️  « Éditer » ouvre /dashboard/site-pages/<clé>. home/contacts auront leur constructeur en R3/R4 (association existe déjà)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi