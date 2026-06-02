'use client';

import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';

/**
 * Mutations de la vue corbeille : restore, deleteForever, emptyBin.
 *
 * ─── Invalidations ────────────────────────────────────────────────────────
 *
 * Toute action mutate la corbeille → on doit synchroniser DEUX vues qui
 * affichent les mêmes données via des canaux différents :
 *
 *   1. **GridView du bin** (`FinderBinRootView` + `TrashEntriesList`) :
 *      lit `trash.listBin` via React Query → on invalide la query.
 *
 *   2. **TreeView du bin** (`FinderTreeFolder` au path `bin/...`) : lit
 *      les enfants Cloudinary via `adapter.getTree`, mis en cache local
 *      au composant. Pour invalider, on incrémente `reloadKey` dans le
 *      finder store (chaque `FinderTreeFolder` observe cette key et reset
 *      son `loadedChildren` au change → re-fetch automatique).
 *
 * Sans la seconde invalidation, après un restore/delete depuis la TrashView,
 * la TreeView garde son ancien état (les uuids déjà supprimés restent
 * visibles dans l'arbre) → discordance visuelle entre Grid et Tree.
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
  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);

  // Helper : invalidation **complète** post-mutation. Centralisé pour
  // garantir qu'on n'oublie aucune des deux vues. À appeler après chaque
  // mutation réussie.
  function invalidateAll() {
    utils.trash.listBin.invalidate();
    reloadFolderContent();
  }

  const restoreMutation = trpc.trash.restoreFromBin.useMutation({
    onSuccess: invalidateAll,
  });

  const deleteMutation = trpc.trash.deleteForever.useMutation({
    onSuccess: invalidateAll,
  });

  // Note : on n'a pas vu de procédure trash.emptyBin explicite dans le router.
  // On l'implémente côté front comme un deleteForever sur tous les ids visibles
  // — le backend rendu tolérant aux orphelines (cf. deleteForever.service.ts).

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
      // ─── Pagination obligatoire ─────────────────────────────────────────
      //
      // Le backend impose `limit ≤ 100` sur `trash.listBin`. Pour vider la
      // corbeille en une seule action, on agrège tous les ids via une boucle
      // de fetch paginés (curseur opaque retourné par le backend).
      //
      // Le cas typique (corbeille < 100 entries) se résout en un seul fetch.
      // Le hard cap à 50 itérations protège contre une boucle infinie en cas
      // de bug backend (curseur jamais null) — au pire, on vide 5000 entries
      // ce qui est bien au-delà de tout usage humain raisonnable.
      const allIds: string[] = [];
      let cursor: string | null | undefined = undefined;
      const MAX_PAGES = 50;
      let pages = 0;

      while (pages < MAX_PAGES) {
        const data = await utils.trash.listBin.fetch({
          appRoot: APP_ROOT,
          limit: 100,
          cursor: cursor ?? undefined,
        });
        for (const entry of data.items) {
          allIds.push(entry.id);
        }
        if (!data.nextCursor) break;
        cursor = data.nextCursor;
        pages++;
      }

      if (allIds.length === 0) return;
      await deleteMutation.mutateAsync({ appRoot: APP_ROOT, ids: allIds });
    },

    isRestoring: restoreMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isEmptying: deleteMutation.isPending,
  };
}
