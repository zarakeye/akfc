'use client';

import { JSX } from 'react';
import { LayoutGrid, Rows3, List } from 'lucide-react';
import { useFinderStore, type FinderViewMode } from '@features/finder-core/state/useFinderStore';

/**
 * Boutons pour switcher entre les 3 modes d'affichage du finder :
 * grille / tableau / liste compacte.
 *
 * Style identique au `ViewModeSwitcher` de `trash-view` pour cohérence
 * visuelle, mais consomme `useFinderStore` au lieu de `useTrashStore`.
 * Les deux switchers vivent ensemble (chacun pour sa vue) — pas de
 * conflit, pas de partage d'état.
 */

type ModeOption = {
  mode: FinderViewMode;
  label: string;
  Icon: typeof LayoutGrid;
};

const OPTIONS: ModeOption[] = [
  { mode: 'grid', label: 'Grille', Icon: LayoutGrid },
  { mode: 'table', label: 'Tableau', Icon: Rows3 },
  { mode: 'compact', label: 'Liste compacte', Icon: List },
];

export default function FinderViewModeSwitcher(): JSX.Element {
  const viewMode = useFinderStore((s) => s.viewMode);
  const setViewMode = useFinderStore((s) => s.setViewMode);

  return (
    <div className="inline-flex items-center gap-0.5 border rounded p-0.5">
      {OPTIONS.map(({ mode, label, Icon }) => {
        const active = mode === viewMode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            className={`
              p-1.5 rounded
              transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
              ${active
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}
            `}
            title={label}
            aria-label={label}
            aria-pressed={active}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
