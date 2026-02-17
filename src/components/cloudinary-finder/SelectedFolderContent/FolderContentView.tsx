'use client';

import { JSX, useMemo } from 'react';

import { FolderNode, FileNode } from '@/components/cloudinary-finder/types';
import { isFileNode, isFolderNode } from '@components/cloudinary-finder/guards';

import type { DragSource } from '@/shared/cloudinary/move.types';
import type { MoveIntent } from '@/server/cloudinary/schemas/move.schema';

import GridFolderItem from './GridFolderItem';
import GridFileItem from './GridFileItem';

import { useSelectionStore } from '@/lib/stores/useSelectionStore';

type Props = {
  folder: FolderNode;
  onOpenFolder: (path: string) => void;
  onSelectFile?: (file: FileNode) => void;
  onMove: (intent: MoveIntent) => void;
};

export default function FolderContentView({
  folder,
  onOpenFolder,
  onSelectFile,
  onMove,
}: Props): JSX.Element {
  const subFolders = folder.children.filter(isFolderNode);
  const files = folder.children.filter(isFileNode);

  const { multiSelectActive, isSelected, clearSelection } = useSelectionStore();

  // (Optionnel) pas encore utilisé ici, conservé pour la suite
  const selectedPathsInFolder = useMemo(() => {
    if (!multiSelectActive) return [];
    return folder.children
      .filter((item) => isSelected(item.fullPath))
      .map((item) => item.fullPath);
  }, [folder.children, multiSelectActive, isSelected]);

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
      /**
       * ✅ Action effectuée :
       * - Sortie multi-select sur clic "vide"
       * - Détection robuste : si le click n'est PAS dans un [data-content-item="true"]
       */
      onMouseDown={(e) => {
        if (!multiSelectActive) return;
        
        const el = e.target as Element | null;
        if (!el) return;

        const insideItem = el.closest('[data-content-item="true"]');
        if (!insideItem) clearSelection();
      }}
    >
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
