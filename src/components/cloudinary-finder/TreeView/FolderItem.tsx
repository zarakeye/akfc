// src/components/cloudinary-finder/TreeView/FolderItem.tsx

// Récursivité UI

'use client';

import { FolderNode, VirtualFolderNode } from '../types';
import { isFolderLike } from '../guards';
import { getFolderKey } from './tree.utils';

type Props = {
  folder: FolderNode | VirtualFolderNode;
  currentPath: string;
  openFolders: Set<string>;
  onToggleFolder: (key: string) => void;
  onSelectFolder: (path: string) => void;
  level: number;
};

/**
 * A recursive component that renders a folder item in the tree view.
 *
 * @param {FolderNode | VirtualFolderNode} folder - The folder to render.
 * @param {string} currentPath - The current path being viewed.
 * @param {Set<string>} openFolders - A set of folder keys that are currently open.
 * @param {(key: string) => void} onToggleFolder - A callback to toggle the open state of a folder.
 * @param {(path: string) => void} onSelectFolder - A callback to select a folder.
 * @param {number} level - The level of the folder in the tree view.
 */
export function FolderItem({
  folder,
  currentPath,
  openFolders,
  onToggleFolder,
  onSelectFolder,
  level,
}: Props) {
  const key = getFolderKey(folder);
  const isOpen = openFolders.has(key);
  const isActive =
    folder.type === 'folder' && folder.path === currentPath;

  const subFolders = folder.children.filter(isFolderLike);

  return (
    <div>
      <div
        className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded ${
          isActive ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${level * 20}px` }}
      >
        {subFolders.length > 0 ? (
          <span
            onClick={() => onToggleFolder(key)}
            className="select-none w-4 text-center"
          >
            {isOpen ? '▼' : '▶'}
          </span>
        ) : (
          <span className="w-4" />
        )}

        <span
          onClick={() => {
            if (folder.type === 'folder') {
              onSelectFolder(folder.path);
            } else {
              onSelectFolder(`__virtual__/${folder.kind}`);
            }
          }}
        >
          📁 {folder.name}
        </span>
      </div>

      {isOpen &&
        subFolders.map(child => (
          <FolderItem
            key={getFolderKey(child)}
            folder={child}
            currentPath={currentPath}
            openFolders={openFolders}
            onToggleFolder={onToggleFolder}
            onSelectFolder={onSelectFolder}
            level={level + 1}
          />
        ))}
    </div>
  );
}