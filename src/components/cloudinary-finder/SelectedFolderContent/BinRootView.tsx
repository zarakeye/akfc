'use client';

import { JSX, useMemo } from 'react';
import clsx from 'clsx';

import { trpc } from '@/lib/trpcClient';
import { useSelectionStore } from '@/lib/stores/useSelectionStore';

type Props = {
  appRoot: string;
  onOpenTrashFolder: (params: { trashId: string; displayName: string }) => void;
  onSelectTrashFile: (params: { id: string; name: string; url?: string; previousPath: string }) => void;
};

/**
 * BinRootView
 *
 * Affiche la liste plate de la corbeille : TrashEntryDTO.
 *
 * - checkbox => sélection par trashId (store.binSelection)
 * - click item =>
 *   - folder => ouvre la navigation "trash-folder"
 *   - file   => ouvre la preview (read-only)
 */
export default function BinRootView({ appRoot, onOpenTrashFolder, onSelectTrashFile }: Props): JSX.Element {
  const toggleBinItem = useSelectionStore((s) => s.toggleBinItem);
  const isBinSelected = useSelectionStore((s) => s.isBinSelected);
  const multiSelectActive = useSelectionStore((s) => s.multiSelectActive);

  const { data, isLoading, isError, error } = trpc.trash.listBin.useQuery({
    appRoot,
    limit: 100,
  });

  const items = data?.items ?? [];

  const isEmpty = useMemo(() => !isLoading && items.length === 0, [isLoading, items.length]);

  if (isLoading) return <div className="text-gray-500">Chargement de la corbeille…</div>;
  if (isError) return <div className="text-red-600">Erreur : {error?.message ?? 'inconnue'}</div>;
  if (isEmpty) return <div className="text-gray-500 italic">Corbeille vide</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((it) => {
        const checked = isBinSelected(it.id);

        return (
          <div
            key={it.id}
            className={clsx(
              'border rounded-lg p-3 flex gap-2 items-start hover:shadow-sm transition',
              checked && 'ring-2 ring-blue-500'
            )}
            title={it.previousPath}
            onMouseDown={(e) => {
              // Empêche le focus/drag parasite
              e.stopPropagation();
            }}
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={checked}
              onChange={() => toggleBinItem(it.id)}
              onClick={(e) => e.stopPropagation()}
            />

            <div
              className="min-w-0 flex-1 cursor-pointer"
              onClick={() => {
                // Si multiselect, on permet quand même d'ouvrir en click,
                // mais l'utilisateur peut aussi cliquer checkbox.
                if (it.kind === 'folder') {
                  onOpenTrashFolder({ trashId: it.id, displayName: it.displayName });
                  return;
                }
                onSelectTrashFile({
                  id: it.id,
                  name: it.displayName,
                  url: it.previewUrl,
                  previousPath: it.previousPath,
                });
              }}
            >
              <div className="font-medium truncate">{it.displayName}</div>
              <div className="text-xs text-gray-500 truncate" title={it.previousPath}>
                {it.previousPathShort}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                {it.createdAt ? `Cloudinary: ${new Date(it.createdAt).toLocaleString()}` : ''}
                {it.sizeBytes !== undefined ? ` • ${it.sizeBytes.toLocaleString()} o` : ''}
              </div>
            </div>

            <div className="text-xs text-gray-400 select-none">
              {it.kind === 'folder' ? '📁' : '🖼️'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
