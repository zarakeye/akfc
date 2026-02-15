// src/components/cloudinary-finder/TreeView/TreeView.tsx
'use client';

import { JSX } from 'react';
import {  RootNode } from '../types';
import VirtualFolderNodeComponent from '@components/cloudinary-finder/TreeView/VirtualFolderNodeComponent';
import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import FolderNodeComponent from '@/components/cloudinary-finder/TreeView/FolderNodeComponent';

type Props = {
  roots: RootNode[];
  currentPath: string;
  onOpen: (path: string) => void;
  onMove: (intent: MoveIntent) => void;
};

export function TreeView({
  roots,
  currentPath,
  onOpen,
  onMove,
}: Props): JSX.Element {
  return (
    <div className="space-y-1">
      {roots.map((node) => {
        // 🔹 Virtual folder
        if (node.type === 'virtual-folder') {
          return (
            <VirtualFolderNodeComponent
              key={node.fullPath}
              node={node}
              currentPath={currentPath}
              onOpen={onOpen}
              onMove={onMove}
            />
          );
        }

        // 🔹 Real folder (TypeScript sait ici que node est FolderNode)
        return (
          <FolderNodeComponent
            key={node.fullPath}
            folder={node}
            currentPath={currentPath}
            onOpen={onOpen}
            onMove={onMove}
          />
        );
      })}
    </div>
  );
}
