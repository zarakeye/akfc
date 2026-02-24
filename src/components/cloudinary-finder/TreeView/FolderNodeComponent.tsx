'use client';

import React, {
  Dispatch,
  JSX,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

import type { FolderNode } from '@/components/cloudinary-finder/types';
import type { DragSource, MoveTarget } from '@/shared/cloudinary/move.types';
import type { MoveIntent } from '@/server/cloudinary/schemas/move.schema';

import { useSelectionStore } from '@/lib/stores/useSelectionStore';
import { useLongPress } from '@/lib/stores/useLongPress';

import { canMove } from '@/server/cloudinary/move.guards';
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

type TriState = 'checked' | 'indeterminate' | 'unchecked';

function normalizePath(p: string) {
  return p.replace(/^\/+|\/+$/g, '');
}

/**
 * pending/published/bin = “status roots” => pas de checkbox.
 *
 * Convention actuelle :
 * - <appRoot>/<status>
 */
function isStatusRootFolder(fullPath: string): boolean {
  const parts = normalizePath(fullPath).split('/').filter(Boolean);
  if (parts.length !== 2) return false;
  return parts[1] === 'pending' || parts[1] === 'published' || parts[1] === 'bin';
}

/**
 * ✅ Tri-state basé sur roots/excluded (pas sur les enfants chargés).
 *
 * Pourquoi ?
 * - En tree view, un folder peut être fermé => ses descendants ne sont pas dans le DOM.
 * - L'état du checkbox doit refléter le store (roots/excluded), pas seulement les enfants visibles.
 *
 * Règles :
 * - checked:
 *   - le folder est sélectionné (isSelected(folderPath) = true)
 *   - ET il n'existe aucune exclusion sous ce folder
 * - indeterminate:
 *   - le folder n'est pas sélectionné mais un descendant root l'est
 *   - OU le folder est sélectionné mais on a des exclusions sous lui
 * - unchecked:
 *   - rien de sélectionné dans ce sous-arbre
 */
function getFolderTriState(params: {
  folderPath: string;
  roots: Set<string>;
  excluded: Set<string>;
  isSelected: (path: string) => boolean;
}): TriState {
  const { folderPath, roots, excluded, isSelected } = params;

  const selectedSelf = isSelected(folderPath);

  // descendant root ? (si oui, le parent devient indeterminate)
  let hasDescendantRoot = false;
  for (const r of roots) {
    if (r !== folderPath && r.startsWith(`${folderPath}/`)) {
      hasDescendantRoot = true;
      break;
    }
  }

  // exclusion sous le folder ? (si oui et folder sélectionné => indeterminate)
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

  const {
    selection,
    startSelection,
    toggleItem,
    clearSelection,
    isSelected,
    uncheckFolderPreserveDescendants,
  } = useSelectionStore();

  const statusRoot = useMemo(() => isStatusRootFolder(folder.fullPath), [folder.fullPath]);

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

  /**
   * ✅ “Actionnable” = UNIQUEMENT les éléments validés.
   *
   * Spéc demandé : en multiselect,
   * - checked => peut subir action
   * - indeterminate => NE DOIT PAS subir action
   */
  const isValidated = tri === 'checked';

  // indeterminate reste visuel, mais non-actionnable
  const rowHighlighted = tri !== 'unchecked';

  const checkboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!checkboxRef.current) return;
    checkboxRef.current.indeterminate = tri === 'indeterminate';
  }, [tri]);

  const longPressFiredRef = useRef(false);

  const longPressHandlers = useLongPress(() => {
    // ✅ Status roots : pas de multiselect dessus
    if (statusRoot) return;

    longPressFiredRef.current = true;
    startSelection(folder.fullPath);
  });

  function buildDragSource(): DragSource {
    // ✅ multiselect + élément validé => selection
    if (multiSelectActive && isValidated) {
      return {
        type: 'selection',
        roots: Array.from(selection.roots),
        excluded: Array.from(selection.excluded),
      };
    }

    // ✅ multiselect + indeterminate => pas d'action (on évite le move/delete involontaire)
    if (multiSelectActive && tri === 'indeterminate') {
      // on renvoie un drag source “neutre” (mais on désactive draggable en amont)
      return { type: 'folder', fullPath: folder.fullPath };
    }

    // ✅ multiselect + item non sélectionné => reset + drag uniquement ce folder
    // (comportement conservé)
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

      return previews.length ? previews : [{ kind: 'folder' as const, name: folder.name }];
    }

    return [{ kind: 'folder' as const, name: folder.name }];
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

  /**
   * Row click
   * - Multi-select:
   *   - status root => navigation (onOpen) (pas de sélection)
   *   - normal folder => toggle
   * - Normal:
   *   - navigation
   */
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

  /**
   * Checkbox change
   * - status roots: pas de checkbox
   * - uncheck d'un folder root validé => garder descendance cochée
   * - sinon toggle standard
   */
  const handleCheckboxChange = () => {
    if (statusRoot) return;

    const isRoot = selection.roots.has(folder.fullPath);

    // ✅ spécial: uncheck d'un folder root validé => on garde la descendance cochée
    if (tri === 'checked' && isRoot) {
      const directChildrenPaths = folder.children.map((c) => c.fullPath);
      uncheckFolderPreserveDescendants(folder.fullPath, directChildrenPaths);
      return;
    }

    toggleItem(folder.fullPath);
  };

  // ✅ Désactivation des actions sur les dossiers indéterminés
  // - ils restent visibles, mais ne peuvent pas être draggés (action).
  // - les folders status restent draggables en mode normal (utile), mais pas en multiselect.
  const draggable = !multiSelectActive
    ? true
    : !statusRoot && tri !== 'indeterminate';

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

          // background: sélection visuelle (checked OU indeterminate)
          multiSelectActive && rowHighlighted && 'bg-gray-200',
          multiSelectActive && !rowHighlighted && 'hover:bg-gray-100'
        )}
      >
        {/* Checkbox : pas sur les status roots */}
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
                  next.has(child.fullPath) ? next.delete(child.fullPath) : next.add(child.fullPath);
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
