'use client';

import { useMemo } from 'react';
import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';

/**
 * Récupère la liste plate des TrashEntries pour l'appRoot courant.
 *
 * - Paginé via `cursor` côté backend (on charge plus au scroll bottom ou
 *   via un bouton "Voir plus" — pour le MVP on charge 100 par défaut)
 * - Filtré par recherche `search` (passée au backend, qui filtre sur le
 *   displayName et previousPathShort)
 *
 * Note : `useTrashStore` n'est PAS importé ici pour garder le hook
 * composable. La recherche est passée en argument.
 */
export function useTrashListing(search: string = '', limit = 100): {
  entries: TrashEntryDTO[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { data, isLoading, isError, refetch } = trpc.trash.listBin.useQuery({
    appRoot: APP_ROOT,
    limit,
    search: search.trim() || undefined,
  });

  const entries = useMemo<TrashEntryDTO[]>(() => data?.items ?? [], [data]);

  return {
    entries,
    isLoading,
    isError,
    refetch: () => {
      refetch();
    },
  };
}
