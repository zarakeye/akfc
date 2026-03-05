'use client';

import { JSX } from 'react';
import { trpc } from '@/lib/trpcClient';

import BinGridFolderItem from '@/features/cloudinary-finder/ui/trash/bin/BinGridFolderItem';
import BinGridFileItem from '@/features/cloudinary-finder/ui/trash/bin/BinGridFileItem';

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
 * ✅ rendu fidèle GridFolderItem/GridFileItem
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
    <div className="grid grid-cols-3 gap-4">
      {children.map((n) => {
        if (n.type === 'folder') {
          const next = relativePath ? `${relativePath}/${n.name}` : n.name;
          const title = n.meta?.previousPath ?? n.fullPath;

          return (
            <BinGridFolderItem
              key={n.fullPath}
              trashId={n.fullPath} // read-only
              displayName={n.name}
              canMultiSelect={false}
              title={title}
              onOpen={() => onOpenRelativeFolder(next)}
            />
          );
        }

        const title = n.meta?.previousPath ?? n.fullPath;

        return (
          <BinGridFileItem
            key={n.fullPath}
            trashId={n.fullPath} // read-only
            displayName={n.name}
            previewUrl={n.url}
            canMultiSelect={false}
            title={title}
            onOpen={() => {
              onSelectTrashFile({
                name: n.name,
                url: n.url,
                previousPath: n.meta?.previousPath ?? '',
              });
            }}
          />
        );
      })}
    </div>
  );
}