// src/components/cloudinary-finder/TreeView/FolderItem.tsx
'use client';

import { JSX } from 'react';
import { FolderNode } from '../types';
import { FolderStatus } from '@/core/cloudinary/folder.types';
import { isFolderNode } from '../guards';
import { getFolderKey } from './tree.utils';
import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import { DragSource } from '@/shared/cloudinary/move.types';
import clsx from 'clsx';
// import { FolderKind } from '@/components/cloudinary-finder/types';

type Props = {
  status: FolderStatus;
  folder: FolderNode | null; // null => virtual
  currentPath: string;
  openFolders: Set<string>;
  onToggleFolder: (key: string) => void;
  onSelectFolder: (path: string) => void;
  level: number;
  onMove: (intent: MoveIntent) => void;
};

/**
 * Folder item component.
 *
 * This component represents a single folder item in the tree view.
 * It displays the folder name and a toggle button to open/close the folder.
 * It also handles drag and drop events to move the folder to a new location.
 *
 * @param {Props} props - The props object containing the folder item properties.
 *
 * @returns {JSX.Element} - The folder item component.
 */
export function FolderItem({
  status,
  folder,
  currentPath,
  openFolders,
  onToggleFolder,
  onSelectFolder,
  level,
  onMove,
}: Props): JSX.Element {
  const isVirtual = folder === null;
  const key = isVirtual ? `__virtual__/${status}` : getFolderKey(folder);
  const isOpen = openFolders.has(key);

  const isActive =
   !isVirtual && folder.fullPath === currentPath;

  const subFolders = folder?.children?.filter(isFolderNode) ?? [];

  /************ DRAG ************/
  function handleDragStart(e: React.DragEvent) {
    if (isVirtual) return;

    const source: DragSource = {
      type: 'folder',
      fullPath: folder!.fullPath,
    };

    e.dataTransfer.setData(
      'application/cloudinary',
      JSON.stringify(source)
    );

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(
      e.currentTarget,
      16,
      16
    );
  }

  /**
   * Handles a drop event on the folder item.
   *
   * @param {React.DragEvent} e - The drop event.
   *
   * This function prevents the default drag behavior, parses the drag data
   * to get the source of the drag, and then calls the onMove function with
   * a MoveIntent object containing the source and target of the move.
   */
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();

    const raw = e.dataTransfer.getData('application/cloudinary');
    if (!raw) return;

    const source: DragSource = JSON.parse(raw);

    const target: MoveIntent['target'] = isVirtual
        ? { type: 'virtual-folder', status }
        : { type: 'folder', fullPath: folder!.fullPath };


    onMove({
      source,
      target,
    });
  }

  

  return (
    <div>
      <div
        className={clsx(
          'flex items-center gap-1 cursor-pointer px-2 py-1 rounded',
          isActive && 'bg-blue-100 font-medium',
          'hover:bg-green-50'
        )}
        style={{ paddingLeft: `${level * 16}px` }}
        draggable={!isVirtual}
        onDragStart={handleDragStart}
        onDragOver={e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onClick={() => {
          isVirtual
            ? onSelectFolder(`__virtual__/${status}`)
            : onSelectFolder(folder.fullPath);
        }}
        onDrop={handleDrop}
      >
        {subFolders.length > 0 ? (
          <span
            onClick={e => {
              e.stopPropagation();
              onToggleFolder(key);
            }}
            className="w-4 text-center select-none"
          >
            {isOpen ? '▼' : '▶'}
          </span>
        ) : (
          <span className="w-4" />
        )}

        <span>📁 {isVirtual ? status : folder!.name}</span>
      </div>

      {isOpen &&
        subFolders.map(child => (
          <FolderItem
            key={getFolderKey(child)}
            status={status}
            folder={child}
            currentPath={currentPath}
            openFolders={openFolders}
            onToggleFolder={onToggleFolder}
            onSelectFolder={onSelectFolder}
            level={level + 1}
            onMove={onMove}
          />
        ))}
    </div>
  );
}
