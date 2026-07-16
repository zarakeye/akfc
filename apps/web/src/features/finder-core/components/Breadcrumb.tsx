'use client';

import { JSX, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';

import type { FileAdapter } from '@contracts/finder';

import { APP_ROOT } from '@config/app';
import { trpc } from '@trpc/trpcClient';

import { buildPathSegments } from '@features/finder-core/utils/path';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import {
  FINDER_DRAG_MIME,
  tryParsePayload,
  isDropAllowed,
  isDropEffective,
} from '@features/finder-core/dnd/payload';

type Props = {
  /**
   * Adapter actif (Cloudinary par défaut côté library). Nécessaire pour
   * le drop : un drop sur un segment du breadcrumb déclenche un move
   * agnostique via `adapter.moveItems` (sauf si la cible est le bin —
   * cf. dispatch dans `handleDrop`).
   */
  adapter: FileAdapter;
};

/**
 * Breadcrumb du finder — chemin cliquable des dossiers parents.
 *
 * ─── Comportements ──────────────────────────────────────────────────────
 *
 *   - Click sur un segment cliquable → navigation vers ce path
 *   - Le dernier segment est rendu en "current" (non-cliquable, gras)
 *     pour signaler la position actuelle dans la hiérarchie
 *
 * ─── Drop-target (depuis ce sous-chantier) ──────────────────────────────
 *
 *   - **Tous les segments** reçoivent le drop d'items en provenance de la
 *     TreeView ou de la GridView — feuille incluse. La feuille (= currentPath)
 *     est un drop-target légitime : quand l'utilisateur drag un item depuis
 *     un AUTRE dossier dans la TreeView et veut le déposer dans le dossier
 *     courant qu'il visualise déjà, le drop sur la feuille est l'endroit
 *     naturel.
 *   - Le risque "no-op" (drag d'un item DÉJÀ dans le folder cible) est
 *     géré par `isDropEffective` qui avale silencieusement.
 *   - Dispatch des actions :
 *       * Cible = `${APP_ROOT}/bin` → `trash.trashToBin`
 *       * Sinon → `adapter.moveItems`
 *     Strictement parallèle au comportement de `FinderTreeFolder.handleDrop`.
 *   - Surbrillance bleue sur le segment survolé pendant le drag.
 *
 * Le tronquage `truncate max-w-[200px]` est conservé pour les chemins
 * profonds ; une vraie troncature centrée (avec `…`) sera à voir si on
 * a des chemins vraiment très longs en pratique.
 */
export default function Breadcrumb({ adapter }: Props): JSX.Element {
  const currentPath = useFinderStore((s) => s.currentPath);
  const setPath = useFinderStore((s) => s.setPath);
  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);
  const exitMultiSelect = useFinderStore((s) => s.exitMultiSelect);

  // Mutation tRPC pour les drops vers le bin (cf. FinderTreeFolder).
  const trashToBinMutation = trpc.trash.trashToBin.useMutation();

  // Index du segment actuellement survolé en drag — pour le highlight.
  // -1 si rien.
  const [dragOverIndex, setDragOverIndex] = useState<number>(-1);

  const segments = buildPathSegments(currentPath);

  /**
   * Filtre les events DnD : seuls ceux qui portent notre MIME passent.
   * Évite de capter les drags d'images depuis le bureau, les fichiers OS,
   * etc. Strictement identique à la fonction locale de `FinderTreeFolder`
   * (la définition n'est pas exportée de `payload.ts`, on duplique).
   */
  function isFinderDrag(e: React.DragEvent): boolean {
    return e.dataTransfer.types.includes(FINDER_DRAG_MIME);
  }

  /**
   * Construit les handlers DnD pour un segment précis. On ferme sur
   * `targetPath` et `index` plutôt que de tout poser dans la JSX —
   * facilité de lecture et pas de closures parasites.
   */
  function makeDropHandlers(index: number, targetPath: string) {
    function handleDragEnter(e: React.DragEvent) {
      if (!isFinderDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      setDragOverIndex(index);
    }

    function handleDragOver(e: React.DragEvent) {
      if (!isFinderDrag(e)) return;
      // ⚠️ preventDefault est requis pour autoriser le drop sur cet élément.
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      if (dragOverIndex !== index) setDragOverIndex(index);
    }

    function handleDragLeave(e: React.DragEvent) {
      // dragleave émis à chaque traversée d'un enfant : on l'ignore
      // tant qu'on est encore dans le sous-arbre de currentTarget.
      const related = e.relatedTarget as Node | null;
      if (related && e.currentTarget.contains(related)) return;
      setDragOverIndex((current) => (current === index ? -1 : current));
    }

    async function handleDrop(e: React.DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      setDragOverIndex(-1);

      const raw = e.dataTransfer.getData(FINDER_DRAG_MIME);
      const payload = tryParsePayload(raw);
      if (!payload) return;

      const items = payload.items;

      // Garde-fous standards du DnD (cf. payload.ts).
      if (!isDropAllowed(targetPath, items)) return;
      if (!isDropEffective(targetPath, items)) return;

      // ─── Cas spécial : drop sur la racine du bin ─────────────────────
      // Strictement parallèle à FinderTreeFolder.handleDrop.
      const BIN_ROOT_PATH = `${APP_ROOT}/bin`;
      if (targetPath === BIN_ROOT_PATH) {
        try {
          await trashToBinMutation.mutateAsync({
            appRoot: APP_ROOT,
            sources: items.map((it) => ({
              kind: it.type === 'folder' ? ('folder' as const) : ('file' as const),
              // Le LOCALISATEUR, pas le chemin logique : `trash.trashToBin`
              // met en quarantaine un binaire, pas une vue. Un dossier n'en
              // porte pas (il vit dans 1..N strates) — c'est le backend qui
              // résout, cf. `resolvePhysicalLocations`.
              fullPath: it.storagePath ?? it.path,
            })),
            logical: true,
          });
          reloadFolderContent();
          exitMultiSelect();
        } catch (err) {
          console.error('[Breadcrumb] trashToBin failed', err);
        }
        return;
      }

      // ─── Cas normal : move agnostique via l'adapter ──────────────────
      if (!adapter.moveItems) {
        console.warn('[Breadcrumb] adapter.moveItems unavailable, drop ignoré');
        return;
      }

      try {
        await adapter.moveItems({
          items,
          target: { type: 'folder', path: targetPath },
        });
        reloadFolderContent();
        exitMultiSelect();
      } catch (err) {
        console.error('[Breadcrumb] drop failed', err);
      }
    }

    return { handleDragEnter, handleDragOver, handleDragLeave, handleDrop };
  }

  return (
    <nav
      className="flex items-center gap-1 text-sm flex-wrap"
      aria-label="Fil d'Ariane"
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        // Tous les segments — y compris la feuille — sont drop-targets.
        //
        // Pourquoi la feuille aussi : la feuille est le `currentPath`, c-à-d
        // le dossier que la GridView affiche. Quand l'utilisateur drag un
        // item depuis la TreeView (un autre folder de l'arbo), drop sur la
        // feuille du breadcrumb est l'endroit naturel pour dire "mets-le
        // dans le dossier que je vois actuellement".
        //
        // Risque "no-op" (drag d'un item déjà dans currentPath puis drop
        // sur la feuille) : déjà géré par `isDropEffective` dans handleDrop.
        // L'event est avalé silencieusement, pas de mutation backend.
        const isCurrentDragOver = dragOverIndex === index;
        const handlers = makeDropHandlers(index, segment.path);

        return (
          <span key={segment.path} className="flex items-center gap-1">
            {isLast ? (
              <span
                onDragEnter={handlers.handleDragEnter}
                onDragOver={handlers.handleDragOver}
                onDragLeave={handlers.handleDragLeave}
                onDrop={handlers.handleDrop}
                // Attribut lu par le ghost manager (cf. dnd/dragGhost.ts) via
                // document.elementFromPoint pendant le tracking du drag, pour
                // calculer le badge allowed/forbidden. Sans cet attribut, le
                // ghost affiche systématiquement la croix rouge "interdit"
                // alors que le drop fonctionne effectivement.
                data-finder-drop-path={segment.path}
                className={clsx(
                  'font-medium text-gray-900 truncate max-w-[200px]',
                  'rounded px-1 py-0.5',
                  // Highlight au dragover (sur la feuille aussi)
                  isCurrentDragOver && 'bg-blue-100 text-blue-700 ring-2 ring-blue-400',
                )}
                title={segment.name}
                aria-current="page"
              >
                {segment.name}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setPath(segment.path)}
                onDragEnter={handlers.handleDragEnter}
                onDragOver={handlers.handleDragOver}
                onDragLeave={handlers.handleDragLeave}
                onDrop={handlers.handleDrop}
                // Cf. note sur la feuille — l'attribut est requis pour le
                // calcul du badge ghost allowed/forbidden.
                data-finder-drop-path={segment.path}
                className={clsx(
                  'text-gray-600 hover:text-gray-900 hover:underline',
                  'truncate max-w-[200px]',
                  'rounded px-1 py-0.5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                  'transition-colors',
                  isCurrentDragOver && 'bg-blue-100 text-blue-700 ring-2 ring-blue-400',
                )}
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
