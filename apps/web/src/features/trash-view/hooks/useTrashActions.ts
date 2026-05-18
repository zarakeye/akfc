'use client';

import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';

/**
 * Mutations de la vue corbeille : restore, deleteForever, emptyBin.
 *
 * Toutes les mutations invalident le cache `trash.listBin` côté React Query
 * pour que la liste se rafraîchisse automatiquement après une action.
 *
 * Le hook expose des fonctions stables (au sens React) qu'on peut passer
 * librement à des callbacks de boutons.
 */
export function useTrashActions(): {
  restore: (ids: string[]) => Promise<void>;
  deleteForever: (ids: string[]) => Promise<void>;
  emptyBin: () => Promise<void>;
  isRestoring: boolean;
  isDeleting: boolean;
  isEmptying: boolean;
} {
  const utils = trpc.useUtils();

  const restoreMutation = trpc.trash.restoreFromBin.useMutation({
    onSuccess: () => {
      utils.trash.listBin.invalidate();
    },
  });

  const deleteMutation = trpc.trash.deleteForever.useMutation({
    onSuccess: () => {
      utils.trash.listBin.invalidate();
    },
  });

  // Note : on n'a pas vu de procédure trash.emptyBin explicite dans le router.
  // On l'implémente côté front comme un deleteForever sur tous les ids visibles
  // — le backend acceptera la liste complète. Si une vraie procédure emptyBin
  // est ajoutée plus tard, on basculera dessus.

  return {
    restore: async (ids: string[]) => {
      if (ids.length === 0) return;
      await restoreMutation.mutateAsync({ appRoot: APP_ROOT, ids });
    },

    deleteForever: async (ids: string[]) => {
      if (ids.length === 0) return;
      await deleteMutation.mutateAsync({ appRoot: APP_ROOT, ids });
    },

    emptyBin: async () => {
      // On lit tous les ids actuellement en corbeille via la query courante.
      // Si la query n'est pas en cache, on la force.
      const data = await utils.trash.listBin.fetch({
        appRoot: APP_ROOT,
        limit: 1000,
      });
      const allIds = data.items.map((entry) => entry.id);
      if (allIds.length === 0) return;
      await deleteMutation.mutateAsync({ appRoot: APP_ROOT, ids: allIds });
    },

    isRestoring: restoreMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isEmptying: deleteMutation.isPending,
  };
}
