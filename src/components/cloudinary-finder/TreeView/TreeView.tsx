'use client';

import { JSX, useState } from 'react';
import { FolderNode, VirtualFolderNode, TreeNode } from '../types';
import { isFolderLike } from '../guards';
import { getFolderKey } from './tree.utils';
import { FolderItem } from './FolderItem';

type Props = {
  node: FolderNode | VirtualFolderNode;
  currentPath: string;
  onSelectFolder: (path: string) => void;
};

/**
 * Affiche un arbre de dossiers Cloudinary.
 *
 * @param node Le dossier racine de l'arbre.
 * @param currentPath Le chemin actuel du dossier sélectionné.
 * @param onSelectFolder La fonction à appeler lorsque le dossier est sélectionné.
 * @returns Un élément JSX représentant l'arbre de dossiers Cloudinary.
 */
export function TreeView({ node, currentPath, onSelectFolder }: Props): JSX.Element {
  const rootKey = node.type === 'folder' ? node.path : `__virtual__/${node.kind}`;
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set([rootKey]));

/**
 * Toggle the state of a folder in the openFolders set.
 *
 * @param path The path of the folder to toggle.
 */
  function toggleFolder(path: string) {
    setOpenFolders(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }

  return (
    <div>
      <FolderItem
        folder={node}
        currentPath={currentPath}
        openFolders={openFolders}
        onToggleFolder={toggleFolder}
        onSelectFolder={onSelectFolder}
        level={0}
      />
    </div>
  );
}