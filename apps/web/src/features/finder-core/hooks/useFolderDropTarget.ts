'use client';

/**
 * useFolderDropTarget — faire d'un dossier une cible de dépôt.
 *
 * Toutes les cibles du finder (dossier de l'arbre, dossier de la grille dans
 * ses trois vues, segment du fil d'Ariane) font la même chose :
 *
 *   1. ne réagir qu'à un glisser du finder (son type MIME) ;
 *   2. s'allumer seulement là où le dépôt est permis : la même règle que le
 *      badge du fantôme (`isDropAllowedForCurrentDrag`) ;
 *   3. au dépôt, valider le paquet, repasser les gardes, puis :
 *      - sur la corbeille : demander confirmation (`askDelete`), comme le menu ;
 *      - ailleurs : déplacer par l'adapter, avec les exclusions de la sélection.
 *
 * Le dépôt vit dans `dropOnFolder`, une fonction simple : le fil d'Ariane, qui
 * construit ses cibles dans une boucle, l'appelle sans passer par le hook.
 *
 * Un dépôt ne change jamais le statut des fichiers (publier, c'est
 * `media.setStatus`).
 */

import { useState } from 'react';
import type { FileAdapter } from '@akfc/contracts/finder/index.ts';
import { APP_ROOT } from '@akfc/config/app.ts';
import { useFinderStore } from '#features/finder-core/state/useFinderStore.ts';
import {
  FINDER_DRAG_MIME,
  isDropAllowed,
  isDropEffective,
  nodesFromDragItems,
  tryParsePayload,
} from '#features/finder-core/dnd/payload.ts';
import { isDropAllowedForCurrentDrag } from '#features/finder-core/dnd/dragGhost.ts';
import { exclusionsUnder } from '#features/finder-core/utils/selectionNodes.ts';

const BIN_ROOT_PATH = `${APP_ROOT}/bin`;

/** Un glisser du finder ? Seuls les types sont lisibles avant le dépôt. */
export function isFinderDrag(e: React.DragEvent): boolean {
  return e.dataTransfer.types.includes(FINDER_DRAG_MIME);
}

/**
 * Le dépôt sur `targetPath`. L'adapter est celui que le finder a lié
 * (`bindFinder`), sauf si l'appelant en passe un.
 */
export async function dropOnFolder(
  e: React.DragEvent,
  targetPath: string,
  adapter?: FileAdapter,
): Promise<void> {
  const payload = tryParsePayload(e.dataTransfer.getData(FINDER_DRAG_MIME));
  if (!payload) return;
  const items = payload.items;

  if (!isDropAllowed(targetPath, items)) return;
  if (!isDropEffective(targetPath, items)) return;

  const store = useFinderStore.getState();

  // Déposer sur la corbeille, c'est « supprimer » : même confirmation que
  // le menu et la barre d'outils, puis le même chemin (`deleteNodes`).
  if (targetPath === BIN_ROOT_PATH) {
    store.askDelete(nodesFromDragItems(items));
    return;
  }

  const moveAdapter = adapter ?? store.boundAdapter;
  if (!moveAdapter?.moveItems) {
    console.warn('[dropOnFolder] adapter.moveItems indisponible, dépôt ignoré');
    return;
  }

  try {
    await moveAdapter.moveItems({
      items,
      target: { type: 'folder', path: targetPath },
      excluded: exclusionsUnder(items, store.selection),
    });
    store.setActionError(null);
    store.reloadFolderContent();
    store.exitMultiSelect();
  } catch (err) {
    store.setActionError(err instanceof Error ? err.message : 'Le déplacement a échoué.');
  }
}

export function useFolderDropTarget(
  targetPath: string,
  options: { enabled: boolean; adapter?: FileAdapter },
): {
  isDragOver: boolean;
  /** À poser sur l'élément qui reçoit le dépôt (absents si la cible est désactivée). */
  handlers: Partial<
    Record<'onDragEnter' | 'onDragOver' | 'onDragLeave' | 'onDrop', (e: React.DragEvent) => void>
  >;
} {
  const [isDragOver, setIsDragOver] = useState(false);
  if (!options.enabled) return { isDragOver: false, handlers: {} };

  return {
    isDragOver,
    handlers: {
      onDragEnter: (e) => {
        if (!isFinderDrag(e)) return;
        e.preventDefault();
        // Sans cela, le dossier parent (dans l'arbre, la ligne qui contient
        // celle-ci) s'allumerait aussi.
        e.stopPropagation();
        if (isDropAllowedForCurrentDrag(targetPath)) setIsDragOver(true);
      },
      onDragOver: (e) => {
        if (!isFinderDrag(e)) return;
        // Requis pour que le navigateur autorise le dépôt ici.
        e.preventDefault();
        e.stopPropagation();
        const ok = isDropAllowedForCurrentDrag(targetPath);
        e.dataTransfer.dropEffect = ok ? 'move' : 'none';
        if (ok !== isDragOver) setIsDragOver(ok);
      },
      onDragLeave: (e) => {
        // `dragleave` arrive aussi quand on passe sur un enfant de la cible.
        const related = e.relatedTarget as Node | null;
        if (related && e.currentTarget.contains(related)) return;
        setIsDragOver(false);
      },
      onDrop: (e) => {
        if (!isFinderDrag(e)) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        void dropOnFolder(e, targetPath, options.adapter);
      },
    },
  };
}
