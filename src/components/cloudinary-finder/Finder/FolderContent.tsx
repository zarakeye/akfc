'use client';

import { JSX } from 'react';
import Image from 'next/image';
import { FolderNode, FileNode } from '@/components/cloudinary-finder/types';
import { isFileNode, isFolderNode } from '@components/cloudinary-finder/guards';
import { DragSource } from '@/shared/cloudinary/move.types';
import { MoveIntent } from '@/server/cloudinary/schemas/move.schema';

type Props = {
  folder: FolderNode;
  onOpenFolder: (path: string) => void;
  onSelectFile?: (file: FileNode) => void; // callback pour la sidebar
  onMove: (intent: MoveIntent) => void;
};

/**
 * Component to display the content of a folder.
 *
 * @param {Props} props - The props object containing the folder to display and the callbacks.
 * @param {FolderNode} props.folder - The folder to display.
 * @param {(path: string) => void} props.onOpenFolder - Callback to open a folder.
 * @param {(file: FileNode) => void} props.onSelectFile - Callback to select a file.
 * @param {(intent: MoveIntent) => void} props.onMove - Callback to move a file or folder.
 *
 * @returns {JSX.Element} - The rendered JSX element.
 */
export function FolderContent({ folder, onOpenFolder, onSelectFile, onMove }: Props): JSX.Element {
  // Séparer les sous-dossiers et fichiers
  const subFolders = folder.children.filter(isFolderNode);
  const files = folder.children.filter(isFileNode);

  /**
   * Handles a drop event on a folder item.
   *
   * Prevents the default drag behavior, parses the drag data to get the source of the drag,
   * and then calls the onMove function with a MoveIntent object containing the source and target of the move.
   *
   * @param {React.DragEvent} e - The drop event.
   * @param {string} targetPath - The full path of the target folder.
   */
  const handleDropOnFolder = (e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    e.stopPropagation();

    const raw = e.dataTransfer.getData('application/cloudinary');
    if (!raw) return;

    const source: DragSource = JSON.parse(raw);

    onMove({
      source,
      target: {
        type: 'folder',
        fullPath: targetPath,
      },
    });
  };

  return (
    <div
      className="space-y-6"
      onDragOver={e => {
        e.preventDefault();
      }}
      onDrop={e => handleDropOnFolder(e, folder.fullPath)}
    >
      {/* 📁 Dossiers */}
      {subFolders.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Dossiers</h3>
          <div className="grid grid-cols-3 gap-4">
            {subFolders.map(f => (
              <button
                key={f.fullPath}
                type="button"
                draggable
                onDragStart={e => {
                  const source: DragSource = {
                    type: 'folder',
                    fullPath: f.fullPath,
                  };
                  e.dataTransfer.setData(
                    'application/cloudinary',
                    JSON.stringify(source),
                  );
                }}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={e => handleDropOnFolder(e, f.fullPath)}
                onClick={() => {
                  onOpenFolder(f.fullPath);
                }}
                className="
                  border rounded p-3 h-20
                  flex items-center justify-center
                  hover:bg-gray-100
                  text-left
                "
              >
                📁 {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🖼️ Fichiers */}
      {files.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Images</h3>
          <div className="grid grid-cols-4 gap-4">
            {files.map(file => (
              <div
                key={file.fullPath}
                draggable // prêt pour le drag&drop
                onDragStart={(e) => {
                  const source: DragSource = {
                    type: 'file',
                    fullPath: file.fullPath,
                  };
                  e.dataTransfer.setData(
                    'application/cloudinary',
                    JSON.stringify(source),
                  );
                }}
                onClick={() => onSelectFile?.(file)}
                className="
                  relative
                  w-32 h-32
                  rounded
                  border
                  overflow-hidden
                  bg-gray-50
                  cursor-pointer
                  flex
                  items-center
                  justify-center
                  hover:shadow-md
                "
              >
                <Image
                  src={getThumbnailUrl(file.url)}
                  alt={file.name}
                  fill
                  className="object-contain w-full h-32"
                />
                <div className="p-1 text-xs truncate text-center">{file.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subFolders.length === 0 && files.length === 0 && (
        <div className="text-gray-500">Dossier vide</div>
      )}
    </div>
  );
}

/**
 * Retourne une URL Cloudinary optimisée pour les miniatures
 * - 128x128 px
 * - crop fill pour garder le carré
 */
function getThumbnailUrl(url: string) {
  // Détection simple pour transformer l'URL Cloudinary existante
  // Si tu utilises des URL signées, adapte le parsing
  return url.replace(
    '/upload/',
    '/upload/w_128,h_128,c_fit,dpr_auto,f_auto/'
  );
}