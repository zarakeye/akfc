'use client';

import { useCallback, useState } from 'react';

import type { FinderNode } from '@contracts/finder';

import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import type { LifecycleStatus } from '@features/finder-core/utils/statusFolders';

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
 *   - `pending` ↔ `published` → `media.setStatus`. **Un UPDATE, pas un
 *     déplacement.** Le binaire ne bouge pas : `MediaAsset.status` est la
 *     vérité. Un fichier envoie son chemin (= `MediaAsset.fullPath`), un
 *     dossier le sien : le backend met à jour tout ce qu'il contient.
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
 * Si une sélection contient un fichier publié encore affiché par une page ou une
 * galerie, le backend (`assertStatusChangeDoesntUnpublishReferencedAssets`)
 * refuse la sortie de `published`, en nommant les contenus. L'erreur remonte
 * ici et est exposée via `error`.
 */
export function useStatusChange(): {
  setStatus: (nodes: FinderNode[], target: LifecycleStatus) => Promise<void>;
  isPending: boolean;
  error: string | null;
} {
  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);
  const exitMultiSelect = useFinderStore((s) => s.exitMultiSelect);

  const utils = trpc.useUtils();
  const trashToBinMutation = trpc.trash.trashToBin.useMutation();
  const setStatusMutation = trpc.media.setStatus.useMutation();

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
              fullPath: n.path,
            })),
          });
          utils.trash.listBin.invalidate();
          utils.storage.getAttentionCounts.invalidate();
        } else {
          setIsMoving(true);
          await setStatusMutation.mutateAsync({
            appRoot: APP_ROOT,
            sources: nodes.map((node) => ({
              kind: node.type === 'folder' ? ('folder' as const) : ('file' as const),
              path: node.path,
            })),
            status: target,
          });
          // Publier ou dépublier change le décompte `pending`. La cloche est
          // dans le cache depuis sa migration `useQuery` : un invalidate suffit.
          utils.storage.getAttentionCounts.invalidate();
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
      setStatusMutation,
      trashToBinMutation,
      utils.trash.listBin,
      utils.storage.getAttentionCounts,
      reloadFolderContent,
      exitMultiSelect,
    ],
  );

  return {
    setStatus,
    isPending:
      isMoving || trashToBinMutation.isPending || setStatusMutation.isPending,
    error,
  };
}