'use client';

import { JSX } from 'react';

import { FolderNode, FileNode } from '@/components/cloudinary-finder/types';
import { isFileNode, isFolderNode } from '@components/cloudinary-finder/guards';

import { DragSource } from '@/shared/cloudinary/move.types';
import { MoveIntent } from '@/server/cloudinary/schemas/move.schema';

import GridFolderItem from './GridFolderItem';
import GridFileItem from './GridFileItem';

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const raw = e.dataTransfer.getData('application/cloudinary');
    if (!raw) return;

    const source: DragSource = JSON.parse(raw);

    onMove({
      source,
      target: {
        type: 'folder',
        fullPath: folder.fullPath,
      },
    });
  };

  return (
    <div
      className="space-y-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
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
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
