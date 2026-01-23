'use client';

import { JSX, useState } from 'react';
import Image from 'next/image';
import { FolderNode, TreeNode, FileNode, VirtualFolderNode } from '@components/cloudinary-finder/types';
import { isFileNode, isFolderLike } from '@components/cloudinary-finder/guards';
import { getFolderKey } from '@components/cloudinary-finder/TreeView/tree.utils';

type Props = {
  folder: FolderNode;
  onSelectFile?: (file: FileNode) => void; // callback pour la sidebar
};

export function FolderContent({ folder, onSelectFile }: Props): JSX.Element {
  // Séparer les sous-dossiers et fichiers
  const subFolders = folder.children.filter(isFolderLike);
  const files = folder.children.filter(isFileNode);

  return (
    <div className="space-y-6">
      {/* 📁 Dossiers */}
      {subFolders.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Dossiers</h3>
          <div className="grid grid-cols-3 gap-4">
            {subFolders.map(f => (
              <div
                key={getFolderKey(f)}
                className="border rounded p-3 flex items-center justify-center h-20 cursor-pointer hover:bg-gray-100"
              >
                📁 {f.name}
              </div>
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
                key={file.publicId}
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
                  hover:shadow-md"
                draggable // prêt pour le drag&drop
              >
                <Image
                  src={getThumbnailUrl(file.url)}
                  alt={file.name}
                  fill
                  className="object-contain w-full h-32"
                  onClick={onSelectFile ? () => onSelectFile(file) : undefined}
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