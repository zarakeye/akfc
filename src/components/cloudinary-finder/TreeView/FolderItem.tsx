'use client';

import { JSX, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { FolderNode } from '../types';
import { FolderStatus } from '@/core/cloudinary/folder.types';
import { isFolderNode } from '../guards';
import { getFolderKey } from './tree.utils';

import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import { DragSource } from '@/shared/cloudinary/move.types';

type Props = {
  status: FolderStatus;
  folder: FolderNode | null;
  currentPath: string;
  openFolders: Set<string>;
  onToggleFolder: (key: string) => void;
  onSelectFolder: (path: string) => void;
  level: number;
  onMove: (intent: MoveIntent) => void;
};

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
  const isActive = !isVirtual && folder.fullPath === currentPath;
  const subFolders = folder?.children?.filter(isFolderNode) ?? [];

  /** 🆕 drag state visuel */
  const [dragOverState, setDragOverState] =
    useState<'none' | 'allowed' | 'forbidden'>('none');

  /** 🆕 refs drag custom */
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const dragSourceRef = useRef<DragSource | null>(null);
  const draggingRef = useRef(false);

  /**********************
   * 🆕 DRAG START (custom)
   **********************/
  function handlePointerDown(e: React.PointerEvent) {
    if (isVirtual) return;

    e.preventDefault();

    draggingRef.current = true;
    dragSourceRef.current = {
      type: 'folder',
      fullPath: folder!.fullPath,
    };

    // Ghost visuel
    const ghost = document.createElement('div');
    ghost.className = "fixed z-[9999] pointer-events-none flex flex-col justify-center items-center";

    const folderNameParagraph = document.createElement('p');
    folderNameParagraph.textContent = `📁 ${folder!.name}`;
    ghost.appendChild(folderNameParagraph);

    document.body.appendChild(ghost);
    ghostRef.current = ghost;

    moveGhost(e.clientX, e.clientY);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  }

  /**
   * Updates the ghost element's position by setting its left and top CSS
   * properties to the given x and y coordinates, with an offset of 12px.
   * If the ghost element does not exist, the function does nothing.
   */
  function moveGhost(x: number, y: number) {
    if (!ghostRef.current) return;
    ghostRef.current.style.left = `${x + 12}px`;
    ghostRef.current.style.top = `${y + 12}px`;
  }

  /**********************
   * 🆕 DRAG MOVE
   *
   * Handles a pointer move event while dragging a folder item.
   *
   * Updates the ghost element's position and updates the drag over state
   * based on whether the pointer is over a drop zone or not.
   *
   * If the pointer is over a drop zone, it checks if the target path is not equal
   * to the source path and if the target path does not start with the source path.
   * If the conditions are met, it sets the drag over state to 'allowed', otherwise it sets
   * it to 'forbidden'. It also updates the ghost element's icon accordingly.
   */
  function handlePointerMove(e: PointerEvent) {
    if (!draggingRef.current) return;

    moveGhost(e.clientX, e.clientY);

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;

    const dropZone = el.closest('[data-drop-folder]');
    if (!dropZone) {
      setDragOverState('none');
      updateGhostIcon(folder!.name, 'forbidden');
      return;
    }

    const targetPath = dropZone.getAttribute('data-drop-folder');
    const sourcePath = dragSourceRef.current?.fullPath;

    const allowed =
      targetPath &&
      sourcePath &&
      targetPath !== sourcePath &&
      !targetPath.startsWith(`${sourcePath}/`);

    setDragOverState(allowed ? 'allowed' : 'forbidden');
    updateGhostIcon(folder!.name, allowed ? 'allowed' : 'forbidden');
  }


  /**
   * Updates the ghost element's icon based on the drag over state.
   *
   * @param {string} folderName - The name of the folder being dragged.
   * @param {'allowed'|'forbidden'} state - The drag over state.
   */
  function updateGhostIcon(folderName: string, state: 'allowed' | 'forbidden') {
    if (!ghostRef.current) return;

    const symbol = state === 'allowed' ? '＋' : '×';
    const color = state === 'allowed' ? 'text-green-600' : 'text-red-600';

    // Conteneur principal
    const container = document.createElement('div');
    container.className = 'flex flex-col justify-center items-center';

    // Ligne dossier
    const folderLine = document.createElement('p');
    folderLine.textContent = `📁 ${folderName}`;

    // Ligne symbole
    const symbolLine = document.createElement('p');
    symbolLine.textContent = symbol;
    symbolLine.className = color;

    // Assemblage
    container.appendChild(folderLine);
    container.appendChild(symbolLine);

    // Injection dans le ghost
    ghostRef.current.innerHTML = '';
    ghostRef.current.appendChild(container);
  }


  /**********************
   * 🆕 DRAG END
   *
   * Handles a pointer up event, which marks the end of a drag gesture.
   * If the pointer is over a drop zone and the drag over state is 'allowed',
   * it calls the onMove callback with a MoveIntent object containing the source and target of the move.
   * Finally, it cleans up the drag state by calling the cleanupDrag function.
   * @param {PointerEvent} e - The pointer up event.
   */
  function handlePointerUp(e: PointerEvent) {
    draggingRef.current = false;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const dropZone = el?.closest('[data-drop-folder]');

    if (
      dropZone &&
      dragSourceRef.current &&
      dragOverState === 'allowed'
    ) {
      const targetPath = dropZone.getAttribute('data-drop-folder');

      if (targetPath) {
        onMove({
          source: dragSourceRef.current,
          target: { type: 'folder', fullPath: targetPath },
        });
      }
    }

    cleanupDrag();
  }

  /**
   * Cleans up the drag state by removing the ghost element, setting the drag over state to 'none',
   * and removing the event listener for the pointer move event.
   */
  function cleanupDrag() {
    setDragOverState('none');

    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }

    dragSourceRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
  }

  useEffect(() => cleanupDrag, []);

  return (
    <div>
      <div
        data-drop-folder={!isVirtual ? folder!.fullPath : undefined}
        className={clsx(
          'flex items-center gap-1 px-2 py-1 rounded cursor-pointer',
          dragOverState === 'allowed' && 'bg-sky-400/20',
          dragOverState === 'forbidden' && 'bg-red-400/20',
          isActive && 'bg-blue-100 font-medium',
          'hover:bg-green-50'
        )}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() =>
          isVirtual
            ? onSelectFolder(`__virtual__/${status}`)
            : onSelectFolder(folder!.fullPath)
        }
      >
        {/* Chevron */}
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

        {/* 🆕 icône drag custom */}
        <div
          onPointerDown={handlePointerDown}
          className="flex items-center gap-1 select-none cursor-grab"
        >
          <span>📁</span>
          <span className="truncate">{isVirtual ? status : folder!.name}</span>
        </div>

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
