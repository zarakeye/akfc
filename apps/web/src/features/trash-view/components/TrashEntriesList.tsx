'use client';

import { JSX } from 'react';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';
import { useTrashStore } from '../state/useTrashStore';

import TrashEntryGrid from './TrashEntryGrid';
import TrashEntryTableRow from './TrashEntryTableRow';
import TrashEntryCompactRow from './TrashEntryCompactRow';

type Props = {
  entries: TrashEntryDTO[];
};

/**
 * Wrapper qui rend la liste des trashEntries dans le mode d'affichage choisi.
 *
 * - **grid** : grille auto-fill 110px (cohérent avec le finder)
 * - **table** : tableau classique avec headers
 * - **compact** : liste dense d'une ligne par entry
 *
 * La sélection est gérée via le store (`selectedIds`, `toggleSelected`).
 * Le drill-down sur un double-clic d'une entry de kind="folder" appelle
 * `enterDrilldown` qui fait basculer la vue.
 */
export default function TrashEntriesList({ entries }: Props): JSX.Element {
  const viewMode = useTrashStore((s) => s.viewMode);
  const selectedIds = useTrashStore((s) => s.selectedIds);
  const toggleSelected = useTrashStore((s) => s.toggleSelected);
  const enterDrilldown = useTrashStore((s) => s.enterDrilldown);

  function handleEntryClick(entry: TrashEntryDTO) {
    toggleSelected(entry.id);
  }

  function handleEntryDoubleClick(entry: TrashEntryDTO) {
    if (entry.kind === 'folder') {
      enterDrilldown(entry.id, entry.displayName);
    }
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
