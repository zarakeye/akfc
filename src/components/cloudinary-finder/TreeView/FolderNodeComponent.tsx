'use client';

import React, { JSX, useState } from 'react';
import type { FolderNode } from '@/components/cloudinary-finder/types';
import type { DragSource } from '@/shared/cloudinary/move.types';
import { MoveIntent } from '@/server/cloudinary/schemas/move.schema';
import clsx from 'clsx';

type Props = {
  folder: FolderNode;
  currentPath?: string;
  onOpen: (path: string) => void;
  onMove: (intent: MoveIntent) => void;
};

export default function FolderNodeComponent({
  folder,
  currentPath,
  onOpen,
  onMove,
}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isOver, setIsOver] = useState<boolean>(false);
  const isActive = folder.fullPath === currentPath;

  // -------------
  // Drag (source)
  // -------------
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const payload = {
      type: 'folder',
      fullPath: folder.fullPath,
    };

    e.dataTransfer.setData('application/cloudinary', JSON.stringify(payload));
    e.stopPropagation();
  };

  // -------------
  // Drop (target)
  // -------------
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsOver(false);
  };

  /**
   * Handles a drop event on a folder item.
   * Calls `onMove` with the dropped item as source and current folder as target.
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);

    const raw = e.dataTransfer.getData('application/cloudinary');
    if (!raw) return;

    try {
      const source: DragSource = JSON.parse(raw);

      const intent: MoveIntent = {
        source,
        target: {
          type: 'folder',
          fullPath: folder.fullPath,
        },
      };

      onMove(intent);
    } catch (err) {
      console.error('[FolderItem] Invalid drop payload', err);
    }
  };

  // -------------------
  // Toggle + Navigation
  // -------------------
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((v) => !v);
  };

  const handleOpen = () => {
    onOpen(folder.fullPath);
  };

  const subFolders = folder.children.filter(
    (child): child is FolderNode => child.type === 'folder'
  );

  return (
    <div className="select-none">
      {/* Ligne principale */}
      <div
        /**
         * ✅ AJOUT IMPORTANT :
         * Permet au handler du <aside> (FinderLayout) de détecter
         * que le clic est sur un item Tree, et donc de NE PAS clearSelection.
         */
        data-tree-item="true"
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleOpen}
        className={clsx(
          'flex items-center gap-2 px-3 py-1 rounded cursor-pointer',
          isActive && 'bg-blue-100 text-blue-700',
          isOver && 'bg-blue-50'
        )}
      >
        {/* Chevron */}
        {subFolders.length > 0 ? (
          <span onClick={handleToggle} className="cursor-pointer w-4 inline-block">
            {isOpen ? '▾' : '▸'}
          </span>
        ) : (
          <span className="w-4 inline-block" />
        )}

        {/* Icône dossier */}
        <span>📁</span>

        {/* Nom */}
        <span>{folder.name}</span>
      </div>

      {/* Enfants */}
      {isOpen && subFolders.length > 0 && (
        <div className="ml-4 space-y-1">
          {subFolders.map((child) => (
            <FolderNodeComponent
              key={child.fullPath}
              folder={child}
              currentPath={currentPath}
              onOpen={onOpen}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
