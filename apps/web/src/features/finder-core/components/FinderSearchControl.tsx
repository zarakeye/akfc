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
