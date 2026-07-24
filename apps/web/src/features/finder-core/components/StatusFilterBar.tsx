'use client';

import { type JSX } from 'react';
import clsx from 'clsx';

import { useFinderStore, type StatusFilter } from '@features/finder-core/state/useFinderStore';

/**
 * La lentille de statut : Tous / En attente / Validés.
 *
 * Avant le chantier « arbre sans strate de statut », cette distinction était
 * un LIEU : `AKFC/pending/…` d'un côté, `AKFC/published/…` de l'autre. On la
 * lisait dans le fil d'Ariane, on la changeait en naviguant. C'était gratuit
 * — et c'est ce qui coûtait un déplacement de binaire à chaque publication.
 *
 * Le statut est redevenu une métadonnée. Cette barre rend ce que la strate
 * donnait, sans ce qu'elle coûtait.
 *
 * ⚠️ Elle ne filtre QUE la grille. Cf. `statusFilter` dans le store : l'arbre
 * reste stable quel que soit le filtre actif.
 */

const OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  // `value` inchangé — cf. StatusRadioGroup pour le pourquoi du libellé.
  { value: 'published', label: 'Validés' },
];

export default function StatusFilterBar(): JSX.Element {
  const statusFilter = useFinderStore((s) => s.statusFilter);
  const setStatusFilter = useFinderStore((s) => s.setStatusFilter);

  return (
    <div
      role="group"
      aria-label="Filtrer par statut"
      className="flex shrink-0 items-center rounded-md border border-neutral-300 p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = statusFilter === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setStatusFilter(option.value)}
            className={clsx(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-600 hover:bg-neutral-100',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
