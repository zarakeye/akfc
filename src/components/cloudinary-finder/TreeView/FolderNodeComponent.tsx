'use client';

import React, {
  Dispatch,
  JSX,
  SetStateAction,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

import type { FolderNode } from '@/components/cloudinary-finder/types';
import type { DragSource, MoveTarget } from '@/shared/cloudinary/move.types';
import type { MoveIntent } from '@/server/cloudinary/schemas/move.schema';

import { useSelectionStore } from '@/lib/stores/useSelectionStore';
import { isItemSelected } from '@/lib/selection/selection.utils';
import { useLongPress } from '@/lib/stores/useLongPress';

import { canMove } from '@/server/cloudinary/move.guards';

// ✅ ghost IDENTIQUE à la grid
import { startDragGhost } from '@/components/cloudinary-finder/SelectedFolderContent/dragGhost.manager';

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
};

/**
 * FolderNodeComponent (Tree)
 * - ✅ Multi-select (checkbox) via useSelectionStore
 * - ✅ DnD : utilise dragGhost.manager.ts => rendu 100% identique à la grid
 * - ✅ data-drop-* compatibles dragGhost.manager.ts
 * - ✅ FIX: pile de ghosts = on passe la LISTE COMPLETE, le manager fait slice(0,3)+compteur+dx/dy
 */
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
}: Props): JSX.Element {
  const isActive = folder.fullPath === currentPath;

  const [isOver, setIsOver] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  const { selection, startSelection, toggleItem, clearSelection } =
    useSelectionStore();

  const selected = isItemSelected(folder.fullPath, selection);

  // ✅ empêche le “click parasite” quand on relâche après longpress
  const longPressFiredRef = useRef(false);

  const longPressHandlers = useLongPress(() => {
    longPressFiredRef.current = true;
    startSelection(folder.fullPath);
  });

  function buildDragSource(): DragSource {
    // ✅ multi-select & item sélectionné => payload selection
    if (multiSelectActive && selected) {
      return {
        type: 'selection',
        roots: Array.from(selection.roots),
        excluded: Array.from(selection.excluded),
      };
    }

    // ✅ multi-select mais item NON sélectionné => reset + drag uniquement lui
    if (multiSelectActive && !selected) {
      clearSelection();
      return { type: 'folder', fullPath: folder.fullPath };
    }

    // ✅ mode normal
    return { type: 'folder', fullPath: folder.fullPath };
  }

  /**
   * ✅ FIX IMPORTANT (pile identique grid)
   * On NE coupe PAS à 3 ici.
   * On renvoie la liste complète => dragGhost.manager.ts gère:
   * - slice(0,3) pour affichage
   * - compteur si > 3
   * - dx/dy pour la pile
   */
  function buildFolderPreviewsForGhost(source: DragSource): { kind: 'folder'; name: string }[] {
    if (source.type === 'selection') {
      const excluded = new Set(source.excluded ?? []);
      const roots = (source.roots ?? []).filter((p) => !excluded.has(p));

      // ⚠️ ici on reste sur "roots" (pas d’expansion descendants),
      // exactement comme ta logique selection roots/excluded.
      // => pile visible dès que tu as plusieurs roots sélectionnés.
      const previews = roots.map((p) => {
        const parts = p.split('/');
        const name = parts[parts.length - 1] || p;
        return { kind: 'folder' as const, name };
      });

      return previews.length ? previews : [{ kind: 'folder' as const, name: folder.name }];
    }

    return [{ kind: 'folder' as const, name: folder.name }];
  }

  // -----------------------
  // Drag (source)
  // -----------------------
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const source = buildDragSource();

    e.dataTransfer.setData('application/cloudinary', JSON.stringify(source));
    e.dataTransfer.effectAllowed = 'move';

    // ✅ ghost IDENTIQUE grid (pile + badge + compteur gérés par manager)
    startDragGhost({
      e,
      source,
      previews: buildFolderPreviewsForGhost(source),
    });
  };

  // -----------------------
  // Drop (target)
  // -----------------------
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

      const intent: MoveIntent = { source, target };
      onMove(intent);
    } catch (err) {
      console.error('[FolderNodeComponent] Invalid drop payload', err);
    }
  };

  // -----------------------
  // Toggle + navigation
  // -----------------------
  const handleRowClick = () => {
    if (multiSelectActive) {
      toggleItem(folder.fullPath);
      return;
    }
    onOpen(folder.fullPath);
  };

  const subFolders = folder.children.filter(
    (child): child is FolderNode => child.type === 'folder'
  );

  return (
    <div className="select-none">
      <div
        data-drop-type="folder"
        data-drop-path={folder.fullPath}
        draggable
        onDragStart={handleDragStart}
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
          multiSelectActive && selected && 'bg-gray-200',
          multiSelectActive && !selected && 'hover:bg-gray-100'
        )}
      >
        {/* Checkbox */}
        {multiSelectActive ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => toggleItem(folder.fullPath)}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="w-4 inline-block" />
        )}

        {/* Chevron */}
        {multiSelectActive ? (
          <span className="w-4 inline-block" />
        ) : subFolders.length > 0 ? (
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

        <span>{folder.name === 'bin' ? '🗑️' : '📁'}</span>
        <span className="capitalize truncate">{folder.name}</span>
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
                  next.has(child.fullPath)
                    ? next.delete(child.fullPath)
                    : next.add(child.fullPath);
                  return next;
                });
              }}
              multiSelectActive={multiSelectActive}
              openFolders={openFolders}
              setOpenFolders={setOpenFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
}
