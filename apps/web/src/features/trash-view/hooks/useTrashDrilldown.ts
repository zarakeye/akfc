'use client';

import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';
import type {
  TrashFolderNode,
  TrashFileNode,
} from '@contracts/trash/trash-node.types';

/**
 * Récupère le contenu d'une TrashEntry de type "folder", pour le drill-down.
 *
 * - `trashId` : id de l'entrée corbeille
 * - `relativePath` : chemin relatif dans l'entrée ("" = contenu racine de l'entrée)
 *
 * Retourne le contenu (children) du dossier virtuel à ce niveau. Les paths
 * affichés à l'utilisateur sont virtuels (l'utilisateur ne voit jamais le
 * vrai `bin/.trash/<uuid>/`).
 */
export function useTrashDrilldown(
  trashId: string | null,
  relativePath: string
): {
  children: Array<TrashFolderNode | TrashFileNode>;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, isLoading, isError } = trpc.trash.readTrashFolder.useQuery(
    {
      appRoot: APP_ROOT,
      trashId: trashId ?? '',
      relativePath: relativePath || undefined,
    },
    {
      enabled: trashId !== null,
    }
  );

  return {
    children: data?.folder.children ?? [],
    isLoading,
    isError,
  };
}
