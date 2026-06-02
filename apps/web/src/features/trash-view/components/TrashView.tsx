'use client';

import { JSX } from 'react';
import { Loader2, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useTrashStore } from '../state/useTrashStore';
import { useTrashListing } from '../hooks/useTrashListing';

import TrashEntriesList from './TrashEntriesList';
import TrashDrilldown from './TrashDrilldown';
import TrashToolbar from './TrashToolbar';
import ViewModeSwitcher from './ViewModeSwitcher';
import SearchInput from './SearchInput';
import EmptyBinButton from './EmptyBinButton';

/**
 * Composant racine de la vue Corbeille.
 *
 * ─── Responsabilités ───────────────────────────────────────────────────────
 *
 * - Affiche le header (titre, retour vers Finder, recherche, vider, switcher)
 * - Affiche la TrashToolbar quand au moins 1 item est sélectionné
 * - Affiche TrashEntriesList (mode liste plate, vue par défaut)
 * - Bascule vers TrashDrilldown si l'utilisateur a double-cliqué sur un folder
 *
 * ─── Pourquoi tout ici ? ───────────────────────────────────────────────────
 *
 * Le composant racine ne fait que de l'orchestration. Toute la logique métier
 * (sélection, drill-down, recherche, mode d'affichage) est dans le store
 * ou dans les sous-composants. Le racine ne fait que :
 *   1. Câbler le hook listing avec la recherche du store
 *   2. Choisir entre TrashEntriesList et TrashDrilldown selon l'état du store
 *   3. Afficher le header global et la toolbar de sélection
 */
export default function TrashView(): JSX.Element {
  const pathname = usePathname();
  const finderPagePartsArray = pathname.split('/');
  const finderPage = finderPagePartsArray.length > 2 ? finderPagePartsArray[1] : '';
  const search = useTrashStore((s) => s.search);
  const setSearch = useTrashStore((s) => s.setSearch);
  const drilldown = useTrashStore((s) => s.drilldown);

  const { entries, isLoading, isError } = useTrashListing(search);

  const inDrilldownMode = drilldown !== null;

  return (
    <div className="flex flex-col h-full border rounded overflow-hidden bg-white">

      {/* ─── Header global ──────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b flex items-center gap-3 flex-wrap">
        <Link
          href={'/' + finderPage}
          className="
            flex items-center gap-1 text-sm text-gray-600
            hover:text-gray-900 hover:underline
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1
            transition-colors
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au Finder
        </Link>

        <div className="h-5 w-px bg-gray-200" aria-hidden />

        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-gray-500" />
          Corbeille
        </h1>

        <div className="flex-1" />

        {/* Outils visibles uniquement en mode liste racine (pas pendant drill-down) */}
        {!inDrilldownMode && (
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Rechercher dans la corbeille..."
            />
            <ViewModeSwitcher />
            <EmptyBinButton totalCount={entries.length} />
          </>
        )}
      </div>

      {/* ─── Toolbar de sélection (visible seulement si sélection active) ── */}
      {!inDrilldownMode && <TrashToolbar />}

      {/* ─── Corps : liste OU drill-down ─────────────────────────────────── */}
      <div className="flex-1 overflow-hidden min-h-0">
        {inDrilldownMode && drilldown ? (
          <TrashDrilldown drilldown={drilldown} />
        ) : (
          <TrashListContent
            entries={entries}
            isLoading={isLoading}
            isError={isError}
            hasSearch={search.trim().length > 0}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              LIST CONTENT                                  */
/* -------------------------------------------------------------------------- */

/**
 * Wrapper qui choisit entre 4 états :
 *   - loading initial (rien à afficher) → spinner centré
 *   - error → message rouge
 *   - liste vide (corbeille vide ou recherche infructueuse) → message
 *   - sinon → la liste rendue selon le mode d'affichage
 */
function TrashListContent({
  entries,
  isLoading,
  isError,
  hasSearch,
}: {
  entries: ReturnType<typeof useTrashListing>['entries'];
  isLoading: boolean;
  isError: boolean;
  hasSearch: boolean;
}): JSX.Element {
  if (isLoading && entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Chargement de la corbeille...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center text-red-600 text-sm">
        Erreur lors du chargement de la corbeille.
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 px-6 text-center">
        <Trash2 className="h-10 w-10 opacity-50" aria-hidden />
        <div className="text-sm">
          {hasSearch
            ? 'Aucun résultat pour cette recherche.'
            : 'La corbeille est vide.'}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <TrashEntriesList entries={entries} />
    </div>
  );
}
