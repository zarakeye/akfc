'use client';

import { JSX } from 'react';
import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';
import { Loader2, Trash2 } from 'lucide-react';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { useTrashStore } from '@features/trash-view/state/useTrashStore';

import TrashEntryGrid from '@features/trash-view/components/TrashEntryGrid';
import TrashEntryTableRow from '@features/trash-view/components/TrashEntryTableRow';
import TrashEntryCompactRow from '@features/trash-view/components/TrashEntryCompactRow';
import ViewModeSwitcher from '@features/trash-view/components/ViewModeSwitcher';
import TrashToolbar from '@features/trash-view/components/TrashToolbar';
import EmptyBinButton from '@features/trash-view/components/EmptyBinButton';

/**
 * FinderBinRootView
 *
 * Vue affichée dans le panneau central du Finder quand le `currentPath`
 * pointe exactement sur `${APP_ROOT}/bin`. Reproduit le comportement
 * legacy : au lieu de l'arborescence Cloudinary normale (qui contiendrait
 * `.trash/<uuids>/`), on affiche la **liste plate des trashEntries** avec
 * leur `displayName`, comme dans la vue Corbeille dédiée.
 *
 * ─── Réutilisation des composants `trash-view` ────────────────────────────
 *
 * On importe les composants atomiques (`TrashEntryGrid`, `TrashEntryTableRow`,
 * `TrashEntryCompactRow`, `ViewModeSwitcher`, `TrashToolbar`, `EmptyBinButton`)
 * du module `trash-view`. Le couplage est volontaire : la même feature
 * (corbeille) a deux points d'entrée (vue dédiée + intégrée finder), il
 * est cohérent qu'ils partagent les briques d'affichage.
 *
 * ─── Différence clé vs `TrashView` standalone : le drill-down ─────────────
 *
 * Dans `TrashView`, le double-clic sur une trashEntry-folder appelle
 * `enterDrilldown` du store trash, qui bascule la vue vers un mode
 * drill-down interne avec `readTrashFolder`.
 *
 * Ici dans le finder, on déclenche à la place `setPath` du store finder
 * vers le path Cloudinary réel `${APP_ROOT}/bin/.trash/<uuid>/`. Le finder
 * réagit normalement : la TreeView se met à jour (avec le rename uuid →
 * displayName du TrashMapContext), la grille appelle `adapter.list()`
 * pour récupérer le contenu, et tout fonctionne en mode finder standard.
 *
 * C'est ce qui permet le drill-down profond (sous-dossiers de la trashEntry,
 * preview des fichiers, etc.) sans dupliquer la logique.
 *
 * ─── Pourquoi pas le store finder pour la sélection ? ─────────────────────
 *
 * On utilise le store `trash` (et pas le store `finder`) pour la sélection
 * des trashEntries parce que :
 *   - les IDs sont des trashIds (pas des paths) — incompatibles avec la
 *     sélection du finder qui travaille sur les paths
 *   - les actions disponibles sont restore/deleteForever (pas move/rename)
 *   - le `TrashToolbar` réutilisé sait déjà parler au store trash
 *
 * Effet de bord propre : si l'utilisateur a une sélection dans la vue
 * Corbeille `/test-finder/corbeille` puis vient ici, la sélection est
 * partagée. On peut clear via le X de la toolbar.
 */
export default function FinderBinRootView(): JSX.Element {
  const setPath = useFinderStore((s) => s.setPath);

  const viewMode = useTrashStore((s) => s.viewMode);
  const selectedIds = useTrashStore((s) => s.selectedIds);
  const toggleSelected = useTrashStore((s) => s.toggleSelected);

  const { data, isLoading, isError } = trpc.trash.listBin.useQuery(
    { appRoot: APP_ROOT, limit: 100 },
    { refetchOnWindowFocus: false, staleTime: 5_000 }
  );

  const entries: TrashEntryDTO[] = data?.items ?? [];

  function handleEntryClick(entry: TrashEntryDTO) {
    toggleSelected(entry.id);
  }

  function handleEntryDoubleClick(entry: TrashEntryDTO) {
    if (entry.kind === 'folder') {
      // Navigation finder vers le path Cloudinary réel — le finder prend
      // le relais comme pour n'importe quel dossier (lazy load, etc.).
      setPath(`${APP_ROOT}/bin/.trash/${entry.id}`);
    }
    // Pour les files : pas de navigation. Sélection seule (déjà faite via onClick).
  }

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header local : titre + viewmodes + vider */}
      <div className="px-3 py-2 border-b flex items-center gap-3 flex-wrap text-sm">
        <div className="flex items-center gap-2 font-medium">
          <Trash2 className="h-4 w-4 text-gray-500" />
          Corbeille
        </div>
        <div className="flex-1" />
        <ViewModeSwitcher />
        <EmptyBinButton totalCount={entries.length} />
      </div>

      {/* Toolbar de sélection — visible si selectedIds non vide */}
      <TrashToolbar />

      {/* Corps : liste rendue selon le mode */}
      <div className="flex-1 overflow-auto min-h-0">
        {renderContent()}
      </div>
    </div>
  );

  /* ----------------------------- helpers render --------------------------- */

  function renderContent(): JSX.Element {
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
        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 text-center px-6">
          <Trash2 className="h-10 w-10 opacity-50" aria-hidden />
          <div className="text-sm">La corbeille est vide.</div>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))] p-4">
          {entries.map((entry) => (
            <TrashEntryGrid
              key={entry.id}
              entry={entry}
              selected={selectedIds.has(entry.id)}
              onClick={() => handleEntryClick(entry)}
              onDoubleClick={() => handleEntryDoubleClick(entry)}
            />
          ))}
        </div>
      );
    }

    if (viewMode === 'table') {
      return (
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 text-left w-8"></th>
                <th className="px-3 py-2 text-left w-8"></th>
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Chemin d&apos;origine</th>
                <th className="px-3 py-2 text-left">Supprimé le</th>
                <th className="px-3 py-2 text-right">Taille</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <TrashEntryTableRow
                  key={entry.id}
                  entry={entry}
                  selected={selectedIds.has(entry.id)}
                  onClick={() => handleEntryClick(entry)}
                  onDoubleClick={() => handleEntryDoubleClick(entry)}
                />
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // compact
    return (
      <div className="bg-white">
        {entries.map((entry) => (
          <TrashEntryCompactRow
            key={entry.id}
            entry={entry}
            selected={selectedIds.has(entry.id)}
            onClick={() => handleEntryClick(entry)}
            onDoubleClick={() => handleEntryDoubleClick(entry)}
          />
        ))}
      </div>
    );
  }
}
