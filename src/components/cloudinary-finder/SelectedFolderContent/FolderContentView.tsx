'use client';

import React, { JSX } from 'react';

import { FolderNode, FileNode } from '@/components/cloudinary-finder/types';
import { isFileNode, isFolderNode } from '@components/cloudinary-finder/guards';

import type { DragSource } from '@/shared/cloudinary/move.types';
import type { MoveIntent } from '@/server/cloudinary/schemas/move.schema';

import GridFolderItem from './GridFolderItem';
import GridFileItem from './GridFileItem';

import { useSelectionStore } from '@/lib/stores/useSelectionStore';
import { trpc } from '@/lib/trpcClient';

type Props = {
  folder: FolderNode;
  onOpenFolder: (path: string) => void;
  onSelectFile?: (file: FileNode) => void;
  onMove: (intent: MoveIntent) => void;
};

function isInBinTree(path: string): boolean {
  return path.endsWith('/bin') || path.includes('/bin/');
}

export default function FolderContentView({
  folder,
  onOpenFolder,
  onSelectFile,
  onMove,
}: Props): JSX.Element {
  const subFolders = folder.children.filter(isFolderNode);
  const files = folder.children.filter(isFileNode);

  const { multiSelectActive, selection, clearSelection } = useSelectionStore();
  const utils = trpc.useUtils();

  /**
   * ✅ Nouvel UX:
   * - Dans /bin, le bouton change selon le multiSelect:
   *   - normal => "Vider la corbeille" (tout supprimer)
   *   - multiselect => "Supprimer la sélection" (seulement cochés)
   */
  const hasContent = folder.children.length > 0;

  /**
   * ✅ UX rule (bin):
   * - mode normal: bouton "🗑️ Vider la corbeille" (tout supprimer)
   * - mode multiselect: bouton "🗑️ Supprimer la sélection" (seulement les items cochés)
   */
  const inBin = isInBinTree(folder.fullPath);
  const selectionRootsCount = selection.roots.size;

  const showEmptyBinButton = inBin && !multiSelectActive && hasContent;
  const showDeleteSelectionButton = inBin && multiSelectActive && selectionRootsCount > 0;

  const emptyBin = trpc.cloudinary.emptyBin.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      clearSelection();
    },
    onError: (err) => console.error('[emptyBin] failed:', err),
  });

  /**
   * Supprimer uniquement la sélection dans la corbeille (roots - excluded)
   * - respecte la logique roots/excluded de ton store
   * - supprime Cloudinary + purge DB placeholders (via router)
   */
  const deleteSelectionInBin = trpc.cloudinary.deleteSelectionInBin.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      clearSelection();
    },
    onError: (err) => console.error('[deleteSelectionInBin] failed:', err),
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const raw = e.dataTransfer.getData('application/cloudinary');
    if (!raw) return;

    const source: DragSource = JSON.parse(raw);

    const intent: MoveIntent = {
      source,
      target: {
        type: 'folder',
        fullPath: folder.fullPath,
      },
    };

    onMove(intent);
  };

  return (
    <div
      className="space-y-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onMouseDown={(e) => {
        if (!multiSelectActive) return;

        const el = e.target as Element | null;
        if (!el) return;

        const insideItem = el.closest('[data-content-item="true"]');
        if (!insideItem) clearSelection();
      }}
    >
      {showEmptyBinButton && (
        <div className="mb-2">
          <button
            onClick={() => {
              const ok = confirm(
                '⚠️ Supprimer définitivement TOUT le contenu de la corbeille ?\n\nCette action est irréversible.'
              );
              if (!ok) return;
              emptyBin.mutate();
            }}
            disabled={emptyBin.isPending}
            className="px-4 py-2 rounded bg-red-600/20 border-red-600 hover:bg-red-600/20 disabled:opacity-50 cursor-pointer"
            title="Vider la corbeille"
          >
            {emptyBin.isPending ? 'Suppression…' : '🗑️ Vider la corbeille'}
          </button>
        </div>
      )}

      {showDeleteSelectionButton && (
        <div className="mb-2">
          <button
            onClick={() => {
              const roots = Array.from(selection.roots);
              const excluded = Array.from(selection.excluded);

              const ok = confirm(
                `⚠️ Supprimer définitivement la sélection ?\n\n` +
                  `Éléments racines: ${roots.length}\n` +
                  `Exclusions: ${excluded.length}\n\n` +
                  `Cette action est irréversible.`
              );
              if (!ok) return;

              deleteSelectionInBin.mutate({ roots, excluded });
            }}
            disabled={deleteSelectionInBin.isPending}
            className="px-4 py-2 rounded bg-red-600/20 border-red-600 hover:bg-red-600/20 disabled:opacity-50 cursor-pointer"
            title="Supprimer la sélection"
          >
            {deleteSelectionInBin.isPending
              ? 'Suppression…'
              : `🗑️ Supprimer la sélection (${selectionRootsCount})`}
          </button>
        </div>
      )}

      {subFolders.length > 0 && (
        <section>
          <h3 className="font-medium mb-2">Dossiers</h3>
          <div className="grid grid-cols-3 gap-4">
            {subFolders.map((subFolder) => (
              <GridFolderItem
                key={subFolder.fullPath}
                folder={subFolder}
                onOpenFolder={onOpenFolder}
                visibleNodes={folder.children}
              />
            ))}
          </div>
        </section>
      )}

      {files.length > 0 && (
        <section>
          <h3 className="font-medium mb-2">Images</h3>
          <div className="grid grid-cols-3 gap-4">
            {files.map((file) => (
              <GridFileItem
                key={file.fullPath}
                file={file}
                onSelect={onSelectFile}
                visibleNodes={folder.children}
              />
            ))}
          </div>
        </section>
      )}

      {subFolders.length === 0 && files.length === 0 && (
        <div className="text-gray-500 italic">Dossier vide</div>
      )}
    </div>
  );
}