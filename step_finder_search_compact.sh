#!/usr/bin/env bash
#
# step_finder_search_compact.sh
#
# La recherche du finder se réduit à une loupe sous 1280px.
#
# ─── Un écart avec ta proposition, et pourquoi ─────────────────────────────
#
# Tu proposais une MODALE. Je livre une barre qui se déplie sur sa propre
# ligne, sans voile ni superposition — pour une raison que la modale rendait
# impossible : les résultats de recherche s'affichent dans la grille, en
# dessous. Une modale les couvrirait exactement au moment où on tape, et il
# faudrait la fermer pour voir ce qu'on cherche.
#
# C'est d'ailleurs ce que font les applications mobiles : la recherche prend
# la barre du haut, les résultats restent visibles dessous. Le champ occupe
# toute la largeur, donc l'objectif — de la place pour taper — est atteint
# sans rien cacher.
#
# ─── Ce que la loupe doit dire quand elle est repliée ──────────────────────
#
# Si une recherche est active et que le champ est replié, la liste affichée
# est filtrée sans qu'aucun élément visible n'explique pourquoi. La loupe
# porte donc une pastille et vire au bleu tant que la requête n'est pas vide :
# l'état du filtre reste lisible même replié.
#
# ─── Le raccourci clavier ──────────────────────────────────────────────────
#
# `Cmd+F` visait directement le champ par une référence. Champ démonté, la
# référence est nulle et le raccourci ne faisait rien. Il déplie désormais la
# barre, laquelle prend le focus au montage — l'ordre compte : ouvrir PUIS
# focaliser, jamais chercher un champ absent.
#
# ─── Deux corrections d'ambiance ───────────────────────────────────────────
#
#   - La barre d'outils gagne `flex-wrap`. Sans lui, ses éléments se
#     compriment jusqu'à l'illisible au lieu de passer à la ligne — et la
#     barre de recherche dépliée n'aurait pas pu prendre sa propre ligne.
#   - `min-h-10]` (crochet parasite) est une classe invalide, donc sans effet.
#     Corrigée en `min-h-10`, la barre retrouve la hauteur minimale prévue.
#
# Usage :
#   bash step_finder_search_compact.sh
#   AKFC_APPLY_ONLY=1 bash step_finder_search_compact.sh
#
set -euo pipefail

search_bar="apps/web/src/features/finder-core/components/FinderSearchBar.tsx"
control="apps/web/src/features/finder-core/components/FinderSearchControl.tsx"
finder="apps/web/src/features/finder-core/components/Finder.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

if grep -q "FinderSearchControl" "$finder" 2>/dev/null; then
  echo "✓ déjà appliqué (recherche compacte) — rien à faire"
  exit 0
fi

for f in "$search_bar" "$finder"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ─────────────────────────────────────────────────────────────────────────
#  1 — Le contrôle responsive
# ─────────────────────────────────────────────────────────────────────────

cat > "$control" <<'TSX'
'use client';

import { JSX, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

import { useIsBreakpoint } from '@/hooks/use-is-breakpoint';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import FinderSearchBar from '@features/finder-core/components/FinderSearchBar';

/**
 * Recherche du finder, selon la place disponible.
 *
 * À partir de 1280px, la barre complète (280px de large) tient dans la barre
 * d'outils. En dessous, elle se réduit à une loupe qui la déplie sur sa
 * propre ligne.
 *
 * ─── Pourquoi pas une modale ────────────────────────────────────────────
 *
 * Les résultats s'affichent dans la grille, EN DESSOUS. Une modale les
 * couvrirait au moment précis où l'on tape, et il faudrait la fermer pour
 * voir ce qu'on cherche. Les applications mobiles ne font pas autrement : la
 * recherche prend la barre du haut, les résultats restent visibles.
 *
 * Le champ déplié occupe toute la largeur — l'objectif, avoir de la place
 * pour taper, est atteint sans rien cacher.
 *
 * ─── Le seuil est celui des volets ──────────────────────────────────────
 *
 * 1280px, comme l'arbre et le panneau d'aperçu. Un troisième seuil propre à
 * la recherche compliquerait le modèle mental sans rien apporter : sous
 * 1280, le finder est « étroit », un point c'est tout.
 */
export default function FinderSearchControl(): JSX.Element {
  const isWide = useIsBreakpoint('min', 1280);
  const query = useFinderStore((s) => s.search.query);
  const clearSearch = useFinderStore((s) => s.clearSearch);
  const [expanded, setExpanded] = useState(false);

  // `Cmd+F` visait directement le champ par une référence ; champ démonté, la
  // référence est nulle et le raccourci ne faisait rien. Il déplie donc la
  // barre, qui prend le focus à son montage. L'ordre compte : ouvrir PUIS
  // focaliser, jamais chercher un champ absent.
  useEffect(() => {
    if (isWide) return;
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'textarea') return;
        e.preventDefault();
        setExpanded(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isWide]);

  if (isWide) return <FinderSearchBar />;

  const hasQuery = query.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label="Rechercher des fichiers"
        title="Rechercher"
        className={`relative shrink-0 rounded p-1.5 transition-colors ${
          hasQuery
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Search className="h-4 w-4" aria-hidden />
        {/* Repliée, la loupe doit dire qu'un filtre est actif : sans ce
            signal, la liste apparaît filtrée sans que rien ne l'explique. */}
        {hasQuery && (
          <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
        )}
      </button>

      {expanded && (
        // `basis-full` : la barre prend sa propre ligne dans la barre
        // d'outils, qui enveloppe désormais ses éléments.
        <div className="flex basis-full items-center gap-2 pt-1">
          <FinderSearchBar fullWidth autoFocusOnMount />
          <button
            type="button"
            onClick={() => {
              clearSearch();
              setExpanded(false);
            }}
            aria-label="Fermer la recherche"
            title="Fermer la recherche"
            className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </>
  );
}
TSX
echo "  + FinderSearchControl.tsx"

python3 - <<'PY'
import io

def edit(path, marker, old, new, label):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    if marker in src:
        print("  = %s (déjà présent)" % label)
        return
    n = src.count(old)
    assert n == 1, "ancre %d fois pour « %s » :\n%s" % (n, label, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % label)

search_bar = "apps/web/src/features/finder-core/components/FinderSearchBar.tsx"
finder     = "apps/web/src/features/finder-core/components/Finder.tsx"

# ── 2 — la barre accepte deux réglages ────────────────────────────────────
edit(search_bar, "fullWidth",
"""export default function FinderSearchBar(): JSX.Element {""",
"""export default function FinderSearchBar({
  fullWidth = false,
  autoFocusOnMount = false,
}: {
  /** Occupe toute la largeur au lieu des 280px de la barre d'outils. */
  fullWidth?: boolean;
  /** Prend le focus au montage — la barre n'est dépliée que pour taper. */
  autoFocusOnMount?: boolean;
} = {}): JSX.Element {""",
"props de la barre de recherche")

edit(search_bar, "autoFocusOnMount) return",
"""  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {""",
"""  // Focus au montage : la barre n'est dépliée que pour y taper, exiger un
  // appui de plus serait gratuit. Un effet est ici légitime — il synchronise
  // React avec le DOM (le focus), il n'appelle aucun setState.
  useEffect(() => {
    if (!autoFocusOnMount) return;
    inputRef.current?.focus();
  }, [autoFocusOnMount]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {""",
"focus au montage")

edit(search_bar, "fullWidth ? 'w-full'",
"""        relative flex items-center gap-1 shrink-0
        w-[280px] h-7 px-2""",
"""        relative flex items-center gap-1 shrink-0
        h-7 px-2""",
"largeur variable (retrait de la largeur fixe)")

edit(search_bar, "${fullWidth",
"""      className="
        relative flex items-center gap-1 shrink-0
        h-7 px-2""",
"""      className={`
        relative flex items-center gap-1 shrink-0
        h-7 px-2
        ${fullWidth ? 'w-full' : 'w-[280px]'}""",
"largeur variable (ouverture du gabarit)")

edit(search_bar, "`}\n    >",
"""        transition-colors
      "
    >""",
"""        transition-colors
      `}
    >""",
"largeur variable (fermeture du gabarit)")

# ── 3 — le finder monte le contrôle ───────────────────────────────────────
edit(finder, "FinderSearchControl",
"""import FinderSearchBar from "@features/finder-core/components/FinderSearchBar";""",
"""import FinderSearchControl from "@features/finder-core/components/FinderSearchControl";""",
"import du contrôle")

edit(finder, "<FinderSearchControl />",
"""          !fileFilter && <FinderSearchBar />}""",
"""          !fileFilter && <FinderSearchControl />}""",
"montage du contrôle")

# ── 4 — la barre d'outils enveloppe, et sa classe cassée ─────────────────
# `min-h-10]` porte un crochet parasite : la classe est invalide, donc sans
# effet. Et sans `flex-wrap`, les éléments se compriment jusqu'à l'illisible
# au lieu de passer à la ligne — la barre dépliée n'aurait pas pu prendre la
# sienne.
edit(finder, "flex-wrap items-center gap-2 min-h-10",
'''<div className="px-3 py-2 border-b text-sm flex items-center gap-2 min-h-10]">''',
'''<div className="px-3 py-2 border-b text-sm flex flex-wrap items-center gap-2 min-h-10">''',
"barre d'outils : flex-wrap et classe corrigée")
PY

echo "✓ recherche compacte posée"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(finder): la recherche se reduit a une loupe sous 1280

Ecart assume avec la modale proposee : les resultats s'affichent dans la
grille, EN DESSOUS. Une modale les couvrirait au moment precis ou l'on
tape, et il faudrait la fermer pour voir ce qu'on cherche. La barre se
deplie donc sur sa propre ligne, sans voile — comme les applications
mobiles, ou la recherche prend la barre du haut et les resultats restent
visibles. Le champ occupe toute la largeur : l'objectif est atteint sans
rien cacher.

Repliee, la loupe porte une pastille et vire au bleu tant qu'une requete
est active. Sans ce signal, la liste apparaitrait filtree sans que rien
ne l'explique.

Cmd+F visait le champ par une reference ; champ demonte, la reference
est nulle et le raccourci ne faisait rien. Il deplie desormais la barre,
qui prend le focus au montage — ouvrir PUIS focaliser, jamais chercher
un champ absent.

Seuil a 1280 comme l'arbre et l'apercu : un troisieme seuil propre a la
recherche compliquerait le modele mental sans rien apporter.

Deux corrections d'ambiance : la barre d'outils gagne flex-wrap (sans
lui ses elements se compriment au lieu de passer a la ligne, et la barre
depliee n'aurait pas pu prendre la sienne) et min-h-10] — crochet
parasite, donc classe invalide et sans effet — devient min-h-10."

echo "✓ commité"
git log -1 --oneline