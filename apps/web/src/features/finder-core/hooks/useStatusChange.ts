'use client';

import { useCallback, useState } from 'react';

import type { FileAdapter, FinderNode } from '@contracts/finder';

import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';

import { dragItemFromNode } from '@features/finder-core/dnd/payload';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import type { LifecycleStatus } from '@features/finder-core/utils/statusFolders';
import { storagePathOf } from '@features/finder-core/utils/storagePath';

/**
 * Hook de changement de statut d'une sélection de FinderNodes.
 *
 * ─── Dispatch des transitions (non-uniforme, à dessein) ───────────────────
 *
 * Les trois transitions n'ont pas la même sémantique :
 *
 *   - vers `bin`            → `trash.trashToBin` (crée les TrashEntry pour
 *     garder la restaurabilité). C'est EXACTEMENT le chemin du drop-sur-bin
 *     du DnD (FinderTreeFolder.handleDrop) et du bouton Corbeille
 *     (useNodeActions.deleteNodes) — on ne le duplique pas, on le réutilise.
 *
 *   - `pending` ↔ `published` → `adapter.moveItems` (même primitive que le
 *     DnD), mais avec une cible `status-folder` au lieu de `folder` : la
 *     résolution backend (`resolveMoveIntent`) remplace le segment de statut
 *     en PRÉSERVANT le sous-chemin (`pending/cours/12/x.jpg` →
 *     `published/cours/12/x.jpg`). Le DnD, lui, vise un `folder` et aplatit.
 *
 *   - depuis `bin`          → hors scope ici : la restauration a son flux
 *     dédié (TrashEntry + previousPath). Le radio est masqué dans le bin
 *     (cf. StatusRadioGroup), on n'arrive donc jamais ici depuis le bin.
 *
 * ─── Refresh ──────────────────────────────────────────────────────────────
 * Identique au DnD : `reloadFolderContent()` (invalide le contentCache du
 * finder → GridView + TreeView via reloadKey) + `exitMultiSelect()`. On
 * invalide en plus `trash.listBin` quand `bin` est impliqué (vue plate).
 *
 * ─── Garde published ──────────────────────────────────────────────────────
 * Si une sélection contient un asset publié encore référencé, le backend
 * (`assertOperationsDontUnpublishReferencedAssets`) rejette la sortie de
 * `published`. L'erreur remonte ici et est exposée via `error`.
 */
export function useStatusChange(adapter: FileAdapter): {
  setStatus: (nodes: FinderNode[], target: LifecycleStatus) => Promise<void>;
  isPending: boolean;
  error: string | null;
} {
  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);
  const exitMultiSelect = useFinderStore((s) => s.exitMultiSelect);

  const utils = trpc.useUtils();
  const trashToBinMutation = trpc.trash.trashToBin.useMutation();

  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStatus = useCallback(
    async (nodes: FinderNode[], target: LifecycleStatus): Promise<void> => {
      if (nodes.length === 0) return;
      setError(null);

      try {
        if (target === 'bin') {
          await trashToBinMutation.mutateAsync({
            appRoot: APP_ROOT,
            sources: nodes.map((n) => ({
              kind:
                n.type === 'folder' ? ('folder' as const) : ('file' as const),
              fullPath: storagePathOf(n),
            })),
            // Un DOSSIER n'a pas de localisateur unique (il vit dans 1..N
            // strates) : c'est le backend qui résout, contre le registre
            // `Folder`. Jeter `AKFC/cours/x` jette les deux copies.
            logical: true,
          });
          utils.trash.listBin.invalidate();
        } else {
          if (!adapter.moveItems) {
            setError('Déplacement non supporté par cet adaptateur.');
            return;
          }
          setIsMoving(true);
          await adapter.moveItems({
            items: nodes.map(dragItemFromNode),
            target: { type: 'status-folder', status: target },
          });
        }

        reloadFolderContent();
        exitMultiSelect();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsMoving(false);
      }
    },
    [
      adapter,
      trashToBinMutation,
      utils.trash.listBin,
      reloadFolderContent,
      exitMultiSelect,
    ],
  );

  return {
    setStatus,
    isPending: isMoving || trashToBinMutation.isPending,
    error,
  };
}