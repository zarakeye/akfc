// src/components/cloudinary-finder/TreeView/TreeView.tsx
'use client';

import { useState } from 'react';
import { StatusRootNode } from '../types';
import { FolderItem } from './FolderItem';
import { MoveIntent } from '@server/cloudinary/schemas/move.schema';

type Props = {
  roots: StatusRootNode[];
  currentPath: string;
  onSelectFolder: (path: string) => void;
  onMove: (intent: MoveIntent) => void;
};

export function TreeView({
  roots,
  currentPath,
  onSelectFolder,
  onMove,
}: Props) {
  const [openFolders, setOpenFolders] = useState<Set<string>>(
    () => new Set()
  );

  function toggleFolder(key: string) {
    setOpenFolders(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div>
      {roots.map((tree) => (
        <FolderItem
          key={tree.status}
          status={tree.status}
          folder={tree.node}
          currentPath={currentPath}
          openFolders={openFolders}
          onToggleFolder={toggleFolder}
          onSelectFolder={onSelectFolder}
          level={0}
          onMove={onMove}
        />
      ))}
    </div>
  );
}
