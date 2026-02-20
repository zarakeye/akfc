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

  const { multiSelectActive, clearSelection } = useSelectionStore();
  const utils = trpc.useUtils();

  /**
   * ✅ Nouvelle règle UX:
   * - le bouton "Supprimer définitivement" n'apparaît que si:
   *   1) on est dans bin (ou descendant)
   *   2) le dossier courant n'est pas vide
   *
   * => Ça empêche d'afficher le bouton dans des vues "vides" (ou virtual)
   */
  const hasContent = folder.children.length > 0;
  const showKillButton = isInBinTree(folder.fullPath) && hasContent;

  const emptyBin = trpc.cloudinary.emptyBin.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      clearSelection();
    },
    onError: (err) => console.error('[emptyBin] failed:', err),
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
      {showKillButton && (
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
            title='Vider la corbeille'
          >
            {emptyBin.isPending ? 'Suppression…' : '🗑️ Vider la corbeille'}
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