'use client';

import { JSX } from 'react';
import clsx from 'clsx';

import { trpc } from '@/lib/trpcClient';

type Props = {
  appRoot: string;
  trashId: string;
  relativePath: string;
  onOpenRelativeFolder: (nextRelativePath: string) => void;
  onSelectTrashFile: (file: { name: string; url: string; previousPath: string }) => void;
};

/**
 * TrashFolderView
 *
 * Navigation lecture seule à l'intérieur d'un root trash (folder).
 * - pas de checkbox
 * - pas de DnD
 * - folders => navigation (relativePath)
 * - files   => preview (read-only)
 */
export default function TrashFolderView({
  appRoot,
  trashId,
  relativePath,
  onOpenRelativeFolder,
  onSelectTrashFile,
}: Props): JSX.Element {
  const { data, isLoading, isError, error } = trpc.trash.readTrashFolder.useQuery({
    appRoot,
    trashId,
    relativePath: relativePath || undefined,
  });

  if (isLoading) return <div className="text-gray-500">Chargement…</div>;
  if (isError) return <div className="text-red-600">Erreur : {error?.message ?? 'inconnue'}</div>;
  if (!data) return <div className="text-gray-500">Vide</div>;

  const children = data.folder.children;

  if (!children || children.length === 0) {
    return <div className="text-gray-500 italic">Dossier vide</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {children.map((n) => {
        if (n.type === 'folder') {
          return (
            <div
              key={n.fullPath}
              className={clsx('border rounded-lg p-3 cursor-pointer hover:shadow-sm transition')}
              onClick={() => {
                // relativePath = current + '/' + folderName
                const next = relativePath ? `${relativePath}/${n.name}` : n.name;
                onOpenRelativeFolder(next);
              }}
              title={n.fullPath}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📁</span>
                <div className="font-medium truncate">{n.name}</div>
              </div>
              <div className="text-xs text-gray-500 truncate mt-1" title={n.meta.previousPath}>
                {n.meta.previousPath}
              </div>
            </div>
          );
        }

        // file
        return (
          <div
            key={n.fullPath}
            className={clsx('border rounded-lg p-3 cursor-pointer hover:shadow-sm transition')}
            onClick={() => {
              onSelectTrashFile({ name: n.name, url: n.url, previousPath: n.meta.previousPath });
            }}
            title={n.meta.previousPath}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🖼️</span>
              <div className="font-medium truncate">{n.name}</div>
            </div>
            <div className="text-xs text-gray-500 truncate mt-1" title={n.meta.previousPath}>
              {n.meta.previousPath}
            </div>
          </div>
        );
      })}
    </div>
  );
}
