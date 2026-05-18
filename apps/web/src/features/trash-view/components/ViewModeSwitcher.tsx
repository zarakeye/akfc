'use client';

import { JSX } from 'react';
import { LayoutGrid, Rows3, List } from 'lucide-react';
import { useTrashStore, type ViewMode } from '../state/useTrashStore';

/**
 * Boutons pour switcher entre les 3 modes d'affichage : grille / tableau / liste compacte.
 *
 * Le mode actif a un fond gris discret. Les boutons utilisent uniquement des
 * icônes lucide pour rester compacts, avec des `title` pour l'accessibilité
 * et `aria-pressed` pour le screen reader.
 */

type ModeOption = {
  mode: ViewMode;
  label: string;
  Icon: typeof LayoutGrid;
};

const OPTIONS: ModeOption[] = [
  { mode: 'grid', label: 'Grille', Icon: LayoutGrid },
  { mode: 'table', label: 'Tableau', Icon: Rows3 },
  { mode: 'compact', label: 'Liste compacte', Icon: List },
];

export default function ViewModeSwitcher(): JSX.Element {
  const viewMode = useTrashStore((s) => s.viewMode);
  const setViewMode = useTrashStore((s) => s.setViewMode);

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
