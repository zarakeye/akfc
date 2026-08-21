#!/usr/bin/env bash
#
# AKFC — Refonte « pages éditoriales » R3b : formulaire du hero d'Accueil.
#
# Route STATIQUE `(admin)/dashboard/site-pages/home/page.tsx` — prend le pas sur
# le builder générique [slug] pour "home", donc le « Éditer » d'Accueil (hub)
# y mène. Deux champs (titre + corps), chargés via homeHero.get ; deux actions :
#   - « Enregistrer en brouillon » = save(title,body) + setPublished(home,false)
#   - « Publier »                  = save(title,body) + setPublished(home,true)
# Aucun builder, aucun impact sur la structure de la page /.
#
# Prérequis : R3a (homeHero) + brique 1 (pageVisibility). Front NON testé →
# valider. Pas de migration.
# Usage : bash apply-editorial-3b-home-hero-form.sh
#         AKFC_APPLY_ONLY=1 bash apply-editorial-3b-home-hero-form.sh   (clone)
#
set -euo pipefail

FORM="apps/web/src/app/(admin)/dashboard/site-pages/home/page.tsx"

if [ ! -f "package.json" ]; then
  echo "ERREUR: lance depuis la racine du repo." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

mkdir -p "$(dirname "$FORM")"
cat > "$FORM" <<'TSX'
"use client";

import { type JSX, useEffect, useState } from "react";
import Link from "next/link";

import { trpc } from "@trpc/trpcClient";

/**
 * Éditeur du HERO de la page d'accueil — uniquement le titre et le corps de la
 * section d'intro. Pas de builder : la structure de la page / est figée et
 * consomme simplement ces deux valeurs.
 */
export default function HomeHeroEditorPage(): JSX.Element {
  const utils = trpc.useUtils();
  const { data: hero } = trpc.homeHero.get.useQuery();
  const { data: states } = trpc.pageVisibility.all.useQuery();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && hero !== undefined) {
      setTitle(hero?.title ?? "");
      setBody(hero?.body ?? "");
      setInitialized(true);
    }
  }, [hero, initialized]);

  const published =
    (states ?? []).find((s) => s.key === "home")?.published ?? false;

  const save = trpc.homeHero.save.useMutation();
  const setPublished = trpc.pageVisibility.setPublished.useMutation();
  const busy = save.isPending || setPublished.isPending;
  const canSave = title.trim().length > 0;

  async function persist(publish: boolean): Promise<void> {
    await save.mutateAsync({ title: title.trim(), body: body.trim() });
    await setPublished.mutateAsync({ key: "home", published: publish });
    await Promise.all([
      utils.homeHero.get.invalidate(),
      utils.pageVisibility.all.invalidate(),
    ]);
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Accueil — hero</h1>
        <span
          className={
            "rounded-full px-2 py-0.5 text-xs font-semibold " +
            (published
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700")
          }
        >
          {published ? "Publiée" : "Brouillon"}
        </span>
      </div>
      <p className="mb-6 text-sm text-gray-600">
        Titre et texte d'introduction de la page d'accueil. Le reste de la page
        n'est pas affecté.{" "}
        <Link href="/" className="text-blue-600 hover:underline">
          Voir la page
        </Link>
      </p>

      <label className="mb-1 block text-sm font-medium text-gray-800">
        Titre
      </label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
        placeholder="Bienvenue à l'AKFC"
      />

      <label className="mb-1 block text-sm font-medium text-gray-800">
        Corps
      </label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={5}
        className="mb-6 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
        placeholder="Texte d'introduction…"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !canSave}
          onClick={() => void persist(false)}
          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 disabled:opacity-50"
        >
          Enregistrer en brouillon
        </button>
        <button
          type="button"
          disabled={busy || !canSave}
          onClick={() => void persist(true)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          Publier
        </button>
      </div>
    </div>
  );
}
TSX
echo "formulaire écrit : $FORM"

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
if git commit -m "feat(home): formulaire d'édition du hero (titre/corps + brouillon/publier)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "✅ R3 complet. « Éditer » Accueil (hub) → /dashboard/site-pages/home → ce formulaire."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi