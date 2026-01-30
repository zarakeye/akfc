// src/components/cloudinary-finder/TreeView/FolderItem.tsx
'use client';

import { FolderNode } from '../types';
import { FolderStatus } from '@/core/cloudinary/folder.types';
import { isRealFolderNode } from '../guards';
import { getFolderKey } from './tree.utils';
import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import { DragSource } from '@/shared/cloudinary/move.intent';
import { virtualTarget, folderTarget } from '../move.factories';
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

function isDropTarget(folder: FolderNode ) {
  return (
    folder.type === 'folder'
  );
}

export function FolderItem({
  status,
  folder,
  currentPath,
  openFolders,
  onToggleFolder,
  onSelectFolder,
  level,
  onMove,
}: Props) {
  const isVirtual = folder === null;
  const key = isVirtual ? `__virtual__/${status}` : getFolderKey(folder);
  const isOpen = openFolders.has(key);

  const isActive =
   !isVirtual && folder.fullPath === currentPath;

  const subFolders = folder?.children?.filter(isRealFolderNode) ?? [];

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    const raw = e.dataTransfer.getData('application/cloudinary');
    if (!raw) return;

    const source: DragSource = JSON.parse(raw);

    const target: MoveIntent['target'] = isVirtual
        ? { type: 'virtual', status }
        : { type: 'folder', fullPath: folder.fullPath };


    // onMove(intent);
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
          folder && isDropTarget(folder) && 'hover:bg-green-50'
        )}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() => {
          isVirtual
            ? onSelectFolder(`__virtual__/${status}`)
            : onSelectFolder(folder.fullPath);
        }}
        onDragOver={e => {
          if (!folder) return;
          if (!isDropTarget(folder)) {
            e.dataTransfer.dropEffect = 'none';
            return;
          };
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
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

        <span>📁 {isVirtual ? status : folder?.name}</span>
      </div>

      {isOpen &&
        subFolders.map(child => (
          <FolderItem
            status={status}
            key={getFolderKey(child)}
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
