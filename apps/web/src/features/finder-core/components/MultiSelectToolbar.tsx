'use client';

import { JSX } from 'react';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';

/**
 * 🧮 Toolbar du mode multi-select.
 *
 * S'affiche **uniquement** quand `multiSelectActive` est vrai dans le store.
 * Présente le compteur d'éléments sélectionnés et un bouton pour sortir
 * du mode (qui vide aussi la sélection).
 *
 * Les actions métier (déplacer, supprimer, restaurer, etc.) ne sont pas
 * câblées ici en 4.2 : elles seront ré-introduites quand on raccordera
 * la corbeille et le déplacement agnostique sur StorageAdapter.
 */
export default function MultiSelectToolbar(): JSX.Element | null {
  // On souscrit champ par champ pour limiter les re-renders : seul le
  // changement du compteur ou du flag re-rend la toolbar.
  const multiSelectActive = useFinderStore((s) => s.multiSelectActive);
  const count = useFinderStore((s) => s.selection.roots.size);
  const exitMultiSelect = useFinderStore((s) => s.exitMultiSelect);

  if (!multiSelectActive) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 bg-blue-50 border-b text-sm">
      <span className="font-medium">
        {count} élément{count > 1 ? 's' : ''} sélectionné{count > 1 ? 's' : ''}
      </span>

      <button
        type="button"
        onClick={exitMultiSelect}
        className="px-2 py-1 rounded border bg-white hover:bg-gray-50"
      >
        Tout désélectionner
      </button>
    </div>
  );
}
