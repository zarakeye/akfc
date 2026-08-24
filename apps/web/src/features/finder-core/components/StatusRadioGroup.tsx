'use client';

import { useMemo, type JSX } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

import type { FinderNode } from '@contracts/finder';

import {
  statusOf,
  type LifecycleStatus,
} from '@features/finder-core/utils/statusFolders';
import { useStatusChange } from '@features/finder-core/hooks/useStatusChange';

// ⚠️ `value` reste 'published' : c'est la valeur du contrat et de la base.
// Seul le LIBELLÉ change. Un admin valide un média — il le rend utilisable
// dans une page — mais ne le publie pas : la mise en ligne dépend de la page
// qui le référence, et de sa propre date de publication.
const STATUS_OPTIONS: { value: LifecycleStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'published', label: 'Validé' },
];

/**
 * Boutons radio de changement de statut pour la sélection multiple.
 *
 * Le radio coché est DÉRIVÉ des données : statut commun de la sélection
 * (un seul distinct → coché ; mixte → aucun). Cliquer un autre radio
 * déclenche la transition et la sélection migre ; le coché se re-dérive
 * tout seul du prochain état (rien n'est stocké localement). Cohérent avec
 * la philosophie « source unique » du finder.
 *
 * À placer dans la toolbar (bloc multi-select du header). Le parent ne le
 * rend que hors-bin (la restauration depuis la corbeille a son flux dédié).
 */
export default function StatusRadioGroup({
  selectedNodes,
}: {
  selectedNodes: FinderNode[];
}): JSX.Element | null {
  const { setStatus, isPending, error } = useStatusChange();

  const currentStatus = useMemo<LifecycleStatus | null>(() => {
    if (selectedNodes.length === 0) return null;
    // La règle de dérivation vit dans `statusOf` — un seul endroit.
    const distinct = new Set(selectedNodes.map(statusOf));
    return distinct.size === 1 ? ([...distinct][0] ?? null) : null;
  }, [selectedNodes]);

  if (selectedNodes.length === 0) return null;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <fieldset
        disabled={isPending}
        aria-label="Changer le statut de la sélection"
        className="flex items-center gap-1"
      >
        {STATUS_OPTIONS.map((opt) => {
          const checked = currentStatus === opt.value;
          return (
            <label
              key={opt.value}
              title={`Passer la sélection en « ${opt.label} »`}
              className={clsx(
                'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs transition-colors',
                isPending
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer',
                checked
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              <input
                type="radio"
                name="finder-status"
                value={opt.value}
                checked={checked}
                onChange={() => {
                  // Pas de mutation si on re-clique le statut courant.
                  if (opt.value !== currentStatus) {
                    void setStatus(selectedNodes, opt.value);
                  }
                }}
                className="sr-only"
              />
              {opt.label}
            </label>
          );
        })}
      </fieldset>

      {isPending && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" aria-hidden />
      )}
      {error && (
        <span
          className="max-w-xs truncate text-xs text-red-600"
          title={error}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}