'use client';

import { JSX } from 'react';
import { ChevronRight } from 'lucide-react';
import { buildPathSegments } from '@features/finder-core/utils/path';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';

/**
 * Breadcrumb du finder — chemin cliquable des dossiers parents.
 *
 * - Le dernier segment est rendu en "current" (non-cliquable, gras léger)
 *   pour bien signaler où on est dans la hiérarchie.
 * - Les segments précédents sont cliquables et naviguent vers leur path.
 * - Le séparateur est un chevron (`>`) muted, plus lisible qu'un `/`.
 * - Focus visible pour la navigation clavier.
 *
 * Pas de gestion explicite du tronquage : le `flex-wrap` permet aux
 * segments de passer à la ligne plutôt que d'être tronqués brutalement.
 * Une vraie troncature centrée (avec `…` au milieu) serait souhaitable
 * pour des chemins très profonds — à voir en amélioration ultérieure.
 */
export default function Breadcrumb(): JSX.Element {
  const { currentPath, setPath } = useFinderStore();

  const segments = buildPathSegments(currentPath);

  return (
    <nav
      className="flex items-center gap-1 text-sm flex-wrap"
      aria-label="Fil d'Ariane"
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <span key={segment.path} className="flex items-center gap-1">
            {isLast ? (
              <span
                className="font-medium text-gray-900 truncate max-w-[200px]"
                title={segment.name}
                aria-current="page"
              >
                {segment.name}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setPath(segment.path)}
                className="
                  text-gray-600 hover:text-gray-900 hover:underline
                  truncate max-w-[200px]
                  rounded-sm px-0.5
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                  transition-colors
                "
                title={segment.name}
              >
                {segment.name}
              </button>
            )}

            {!isLast && (
              <ChevronRight
                className="h-3.5 w-3.5 text-gray-400 shrink-0"
                aria-hidden
              />
            )}
          </span>
        );
      })}
    </nav>
  );
}
