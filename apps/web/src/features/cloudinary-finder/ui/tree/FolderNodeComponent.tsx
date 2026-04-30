// src/components/cloudinary-finder/TreeView/FolderNodeComponent.tsx
'use client';

import React, {
  Dispatch,
  JSX,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import clsx from 'clsx';

import type { FolderNode } from '@contracts/cloudinary/finder.types';
import type { DragSource, MoveTarget } from '@contracts/cloudinary/move.types';
import type { MoveIntent } from '@contracts/cloudinary/move.schema';

import { useSelectionStore } from '@features/cloudinary-finder/state/selection/useSelectionStore';
import { useLongPress } from '@features/cloudinary-finder/hooks/useLongPress';

import { canMove } from '@backend/modules/cloudinary/move.guards';
import { startDragGhost } from '@features/cloudinary-finder/dnd/dragGhost.manager';
import Image from 'next/image';
import {
  type TrashMap,
  getTrashIdFromStoragePath,
  getBinTooltipTitle,
  normalizePath,
} from '@features/cloudinary-finder/utils/binTrashUI';

type Props = {
  folder: FolderNode;
  currentPath?: string;
  onOpen: (path: string) => void;
  onMove: (intent: MoveIntent) => void;

  isOpen: boolean;
  onToggleOpen: () => void;

  multiSelectActive: boolean;
  openFolders: Set<string>;
  setOpenFolders: Dispatch<SetStateAction<Set<string>>>;

  trashMap?: TrashMap;

  binHasItems?: boolean;
};

type TriState = 'checked' | 'indeterminate' | 'unchecked';

function isStatusRootFolder(fullPath: string): boolean {
  const parts = normalizePath(fullPath).split('/').filter(Boolean);
  if (parts.length !== 2) return false;
  return parts[1] === 'pending' || parts[1] === 'published' || parts[1] === 'bin';
}

function isBinContext(currentPath?: string) {
  if (!currentPath) return false;
  const p = normalizePath(currentPath);
  return p.includes('/bin') && (p.endsWith('/bin') || p.includes('/bin/'));
}

function isInTrashStorage(fullPath: string) {
  const p = normalizePath(fullPath);
  return p.includes('/bin/.trash/');
}

function getFolderTriState(params: {
  folderPath: string;
  roots: Set<string>;
  excluded: Set<string>;
  isSelected: (path: string) => boolean;
}): TriState {
  const { folderPath, roots, excluded, isSelected } = params;

  const selectedSelf = isSelected(folderPath);

  let hasDescendantRoot = false;
  for (const r of roots) {
    if (r !== folderPath && r.startsWith(`${folderPath}/`)) {
      hasDescendantRoot = true;
      break;
    }
  }

  let hasExcludedInside = false;
  for (const ex of excluded) {
    if (ex === folderPath || ex.startsWith(`${folderPath}/`)) {
      hasExcludedInside = true;
      break;
    }
  }

  if (selectedSelf) return hasExcludedInside ? 'indeterminate' : 'checked';
  if (hasDescendantRoot) return 'indeterminate';
  return 'unchecked';
}

function binTooltipFallback() {
  return 'Élément supprimé (corbeille)';
}

export default function FolderNodeComponent({
  folder,
  currentPath,
  onOpen,
  onMove,
  isOpen,
  onToggleOpen,
  multiSelectActive,
  openFolders,
  setOpenFolders,
  trashMap,
  binHasItems,
}: Props): JSX.Element {
  const isActive = folder.fullPath === currentPath;

  const [isOver, setIsOver] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  const {
    selection,
    startSelection,
    toggleItem,
    clearSelection,
    isSelected,
    uncheckFolderPreserveDescendants,
  } = useSelectionStore();

  const statusRoot = isStatusRootFolder(folder.fullPath);

  const tri = useMemo(
    () =>
      getFolderTriState({
        folderPath: folder.fullPath,
        roots: selection.roots,
        excluded: selection.excluded,
        isSelected,
      }),
    [folder.fullPath, selection.roots, selection.excluded, isSelected]
  );

  const isValidated = tri === 'checked';
  const rowHighlighted = tri !== 'unchecked';

  const checkboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!checkboxRef.current) return;
    checkboxRef.current.indeterminate = tri === 'indeterminate';
  }, [tri]);

  const longPressFiredRef = useRef(false);

  const longPressHandlers = useLongPress(() => {
    if (statusRoot) return;
    longPressFiredRef.current = true;
    startSelection(folder.fullPath);
  });

  // ✅ BIN UI MASK
  const inBin = isBinContext(currentPath);
  const inTrashStorage = isInTrashStorage(folder.fullPath);
  const trashId = inTrashStorage ? getTrashIdFromStoragePath(folder.fullPath) : null;

  if (inBin && folder.name === '.trash') {
    return <></>;
  }

  let uiLabel = folder.name;
  if (inBin && inTrashStorage) {
    if (trashId && folder.name === trashId) {
      uiLabel = trashMap?.get(trashId)?.displayName ?? 'Élément supprimé';
    }
  }

  let title = folder.fullPath;
  if (inBin && inTrashStorage) {
    title = trashMap ? getBinTooltipTitle(folder.fullPath, trashMap) : binTooltipFallback();
  }

  function buildDragSource(): DragSource {
    if (multiSelectActive && isValidated) {
      return {
        type: 'selection',
        roots: Array.from(selection.roots),
        excluded: Array.from(selection.excluded),
      };
    }

    if (multiSelectActive && tri === 'indeterminate') {
      return { type: 'folder', fullPath: folder.fullPath };
    }

    if (multiSelectActive && tri === 'unchecked') {
      clearSelection();
      return { type: 'folder', fullPath: folder.fullPath };
    }

    return { type: 'folder', fullPath: folder.fullPath };
  }

  function buildFolderPreviewsForGhost(source: DragSource): { kind: 'folder'; name: string }[] {
    if (source.type === 'selection') {
      const excluded = new Set(source.excluded ?? []);
      const roots = (source.roots ?? []).filter((p) => !excluded.has(p));

      const previews = roots.map((p) => {
        const parts = p.split('/');
        const name = parts[parts.length - 1] || p;
        return { kind: 'folder' as const, name };
      });

      return previews.length ? previews : [{ kind: 'folder' as const, name: uiLabel }];
    }

    return [{ kind: 'folder' as const, name: uiLabel }];
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const source = buildDragSource();
    e.dataTransfer.setData('application/cloudinary', JSON.stringify(source));
    e.dataTransfer.effectAllowed = 'move';
    startDragGhost({ e, source, previews: buildFolderPreviewsForGhost(source) });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const raw = e.dataTransfer.getData('application/cloudinary');
    if (!raw) {
      setIsOver(true);
      setIsForbidden(true);
      return;
    }

    try {
      const source: DragSource = JSON.parse(raw);
      const target: MoveTarget = { type: 'folder', fullPath: folder.fullPath };

      const ok = canMove(source, target);
      setIsOver(true);
      setIsForbidden(!ok);
      e.dataTransfer.dropEffect = ok ? 'move' : 'none';
    } catch {
      setIsOver(true);
      setIsForbidden(true);
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = () => {
    setIsOver(false);
    setIsForbidden(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    setIsForbidden(false);

    const raw = e.dataTransfer.getData('application/cloudinary');
    if (!raw) return;

    try {
      const source: DragSource = JSON.parse(raw);
      const target: MoveTarget = { type: 'folder', fullPath: folder.fullPath };

      if (!canMove(source, target)) return;
      onMove({ source, target });
    } catch (err) {
      console.error('[FolderNodeComponent] Invalid drop payload', err);
    }
  };

  const subFolders = folder.children.filter((child): child is FolderNode => child.type === 'folder');

  const handleRowClick = () => {
    if (multiSelectActive) {
      if (statusRoot) {
        onOpen(folder.fullPath);
        return;
      }
      toggleItem(folder.fullPath);
      return;
    }
    onOpen(folder.fullPath);
  };

  const handleCheckboxChange = () => {
    if (statusRoot) return;

    const isRoot = selection.roots.has(folder.fullPath);

    if (tri === 'checked' && isRoot) {
      const directChildrenPaths = folder.children.map((c) => c.fullPath);
      uncheckFolderPreserveDescendants(folder.fullPath, directChildrenPaths);
      return;
    }

    toggleItem(folder.fullPath);
  };

  const draggable = !multiSelectActive ? true : !statusRoot && tri !== 'indeterminate';

  const showChevron = !multiSelectActive && subFolders.length > 0 && folder.name !== 'bin';

  /**
   * ✅ FIX: full/empty corrigé
   */
  const binIcon = binHasItems ? (
    <Image src="/full_trash.svg" alt="full-trash" width={20} height={20} />
  ) : (
    <Image src="/empty_trash.svg" alt="empty-trash" width={20} height={20} />
  );

  const icon = folder.name === 'bin' ? binIcon : '📁';

  return (
    <div className="select-none">
      <div
        data-tree-item="true"
        data-drop-type="folder"
        data-drop-path={folder.fullPath}
        draggable={draggable}
        onDragStart={draggable ? handleDragStart : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClickCapture={(e) => {
          if (!longPressFiredRef.current) return;
          longPressFiredRef.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={handleRowClick}
        onMouseDown={longPressHandlers.onMouseDown}
        onMouseUp={longPressHandlers.onMouseUp}
        onMouseLeave={longPressHandlers.onMouseLeave}
        className={clsx(
          'flex items-center gap-2 px-3 py-1 rounded cursor-pointer',
          isActive && !multiSelectActive && 'bg-blue-100 text-blue-700',
          isOver && !isForbidden && 'bg-emerald-400/15',
          isOver && isForbidden && 'bg-rose-400/15',
          multiSelectActive && rowHighlighted && 'bg-gray-200',
          multiSelectActive && !rowHighlighted && 'hover:bg-gray-100'
        )}
        title={title}
      >
        {multiSelectActive && !statusRoot ? (
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={tri === 'checked'}
            onChange={handleCheckboxChange}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 accent-blue-600"
            title={
              tri === 'indeterminate'
                ? 'Sélection partielle (indéterminée) — aucune action ne s’applique sur ce dossier'
                : 'Sélectionner ce dossier'
            }
          />
        ) : (
          <span className="w-4 inline-block" />
        )}

        {multiSelectActive ? (
          <span className="w-4 inline-block" />
        ) : showChevron ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggleOpen();
            }}
            className="cursor-pointer w-4 inline-block text-center"
          >
            {isOpen ? '▾' : '▸'}
          </span>
        ) : (
          <span className="w-4 inline-block" />
        )}

        <span>{icon}</span>

        <span className="capitalize truncate">{uiLabel}</span>
      </div>

      {isOpen && subFolders.length > 0 && (
        <div className="ml-4 space-y-1">
          {subFolders.map((child) => (
            <FolderNodeComponent
              key={child.fullPath}
              folder={child}
              currentPath={currentPath}
              onOpen={onOpen}
              onMove={onMove}
              isOpen={openFolders.has(child.fullPath)}
              onToggleOpen={() => {
                if (multiSelectActive) return;
                setOpenFolders((prev) => {
                  const next = new Set(prev);
                  next.has(child.fullPath) ? next.delete(child.fullPath) : next.add(child.fullPath);
                  return next;
                });
              }}
              multiSelectActive={multiSelectActive}
              openFolders={openFolders}
              setOpenFolders={setOpenFolders}
              trashMap={trashMap}
              binHasItems={binHasItems}
            />
          ))}
        </div>
      )}
    </div>
  );
}