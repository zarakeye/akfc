'use client';

import { JSX, useEffect, useMemo, useRef, useState } from 'react';

import type { FolderNode, TreeNode } from '@/features/cloudinary-finder/model/explorer/finder-ui.types';
import { explorerNodeToDragSource } from '@/features/cloudinary-finder/adapters/mappers/explorer.move.mapper';

import { useSelectionStore } from '@/features/cloudinary-finder/state/selection/useSelectionStore';
import { useLongPress } from '@/features/cloudinary-finder/hooks/useLongPress';
import { startDragGhost } from '@/features/cloudinary-finder/dnd/dragGhost.manager';

type Props = {
  folder: FolderNode;
  onOpenFolder: (path: string) => void;
  visibleNodes: TreeNode[];
};

type TriState = 'checked' | 'indeterminate' | 'unchecked';

function normalizePath(p: string) {
  return p.replace(/^\/+|\/+$/g, '');
}

function isStatusRootFolder(fullPath: string): boolean {
  const parts = normalizePath(fullPath).split('/').filter(Boolean);
  if (parts.length !== 2) return false;
  return parts[1] === 'pending' || parts[1] === 'published' || parts[1] === 'bin';
}

/**
 * ✅ Tri-state basé sur roots/excluded (pas sur les enfants présents dans la grille).
 *
 * - checked: folder sélectionné ET aucune exclusion sous lui
 * - indeterminate: descendant root sélectionné, ou folder sélectionné mais exclu partiellement
 * - unchecked: rien
 */
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

/**
 * Construit une sélection “actionnable” pour le drag depuis la grid.
 *
 * Spéc demandé : seuls les éléments VALIDÉS (checked) subissent l'action.
 * - Dossiers indéterminés : exclus
 * - Files checked : inclus
 * - Dossiers checked : inclus
 *
 * Dans la grid, on a une opportunité : on connaît visibleNodes.
 * => on peut ajouter en roots les items checked visibles, même si leur “check”
 * vient d'un root parent indéterminé.
 */
function buildActionableSelection(params: {
  selection: { roots: Set<string>; excluded: Set<string> };
  visibleNodes: TreeNode[];
  isSelected: (path: string) => boolean;
  getTriForFolder: (folderPath: string) => TriState;
}): { roots: string[]; excluded?: string[] } {
  const { selection, visibleNodes, isSelected, getTriForFolder } = params;

  const excludedArr = Array.from(selection.excluded);

  // 1) Roots “validés” (pas d'exclusion sous eux)
  const validRootsFromStore: string[] = [];
  for (const r of selection.roots) {
    const hasExcludedUnder = excludedArr.some((ex) => ex === r || ex.startsWith(`${r}/`));
    if (!hasExcludedUnder) validRootsFromStore.push(r);
  }

  const rootsSet = new Set<string>(validRootsFromStore);

  // 2) Ajouter les items checked visibles (files + folders), en évitant les doublons.
  for (const n of visibleNodes) {
    if (n.type === 'file') {
      if (isSelected(n.fullPath)) rootsSet.add(n.fullPath);
      continue;
    }
    if (n.type === 'folder') {
      if (getTriForFolder(n.fullPath) === 'checked') rootsSet.add(n.fullPath);
    }
  }

  // 3) Excluded : on ne garde que celles qui sont sous un root conservé
  const roots = Array.from(rootsSet);
  const keptExcluded = excludedArr.filter((ex) => roots.some((r) => ex === r || ex.startsWith(`${r}/`)));

  return {
    roots,
    excluded: keptExcluded.length ? keptExcluded : undefined,
  };
}

export default function GridFolderItem({ folder, onOpenFolder, visibleNodes }: Props): JSX.Element {
  const {
    multiSelectActive,
    selection,
    startSelection,
    toggleItem,
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

  // ✅ visuel: on garde l'indeterminate visible
  const highlighted = tri !== 'unchecked';

  // ✅ actionnable UNIQUEMENT si checked
  const isValidated = tri === 'checked';

  const checkboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!checkboxRef.current) return;
    checkboxRef.current.indeterminate = tri === 'indeterminate';
  }, [tri]);

  const didLongPressRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const longPress = useLongPress(() => {
    // ✅ status roots : pas de multiselect dessus
    if (statusRoot) return;

    didLongPressRef.current = true;
    startSelection(folder.fullPath);
  });

  const getTriForFolder = (path: string) =>
    getFolderTriState({ folderPath: path, roots: selection.roots, excluded: selection.excluded, isSelected });

  function resolveNodesForGhost(actionableRoots: string[]): TreeNode[] {
    if (!multiSelectActive) return [folder];
    if (!actionableRoots.length) return [folder];

    // Ghost = uniquement les roots actionnables qui sont visibles dans cette grille
    return visibleNodes.filter((n) => actionableRoots.includes(n.fullPath));
  }

  /**
   * Checkbox change
   * - status roots: pas de checkbox
   * - uncheck d'un folder root validé => garder descendance cochée
   * - sinon toggle standard
   */
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

  // ✅ Désactivation des actions sur les dossiers indéterminés en multiselect
  const draggable = !multiSelectActive ? true : !statusRoot && tri !== 'indeterminate';

  return (
    <div
      data-content-item="true"
      className={[
        'relative w-32 h-32 rounded border cursor-pointer flex flex-col items-center justify-center',
        'transition-colors duration-150',
        highlighted ? 'bg-slate-200/70 border-slate-300' : 'bg-gray-50 border-gray-200',
        'hover:shadow-md',
      ].join(' ')}
      draggable={draggable}
      onDragStart={
        draggable
          ? (e) => {
              setDragging(true);

              // ✅ actionnable = roots validés + items checked visibles
              const actionable = buildActionableSelection({
                selection,
                visibleNodes,
                isSelected,
                getTriForFolder,
              });

              // Si le folder “cliqué” est indeterminate => pas d'action (draggable=false déjà)
              // Si le folder n'est pas validé => on drag en single
              const shouldUseSelection = multiSelectActive && isValidated && actionable.roots.length > 0;

              const payload = explorerNodeToDragSource(
                shouldUseSelection
                  ? { kind: 'selection', selection: { roots: new Set(actionable.roots), excluded: new Set(actionable.excluded ?? []) } }
                  : { kind: 'single', node: folder }
              );

              e.dataTransfer.setData('application/cloudinary', JSON.stringify(payload));
              e.dataTransfer.effectAllowed = 'move';

              const nodesForGhost = shouldUseSelection
                ? resolveNodesForGhost(actionable.roots)
                : [folder];

              const previews = nodesForGhost.map((n) => {
                if (n.type === 'file') {
                  const thumbUrl = n.url.replace(
                    '/upload/',
                    '/upload/w_128,h_128,c_fit,dpr_auto,f_auto/'
                  );
                  return { kind: 'file' as const, name: n.name, thumbUrl };
                }
                return { kind: 'folder' as const, name: n.name };
              });

              startDragGhost({ e, source: payload, previews });
              longPress.onDragStart();
            }
          : undefined
      }
      onDragEnd={() => setDragging(false)}
      onClick={() => {
        if (didLongPressRef.current) {
          didLongPressRef.current = false;
          return;
        }

        if (dragging) return;

        if (multiSelectActive) {
          // ✅ status roots : navigation, pas de sélection
          if (statusRoot) {
            onOpenFolder(folder.fullPath);
            return;
          }
          toggleItem(folder.fullPath);
        } else {
          onOpenFolder(folder.fullPath);
        }
      }}
      onMouseDown={longPress.onMouseDown}
      onMouseUp={longPress.onMouseUp}
      onMouseLeave={longPress.onMouseLeave}
    >
      {multiSelectActive && !statusRoot && (
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={tri === 'checked'}
          onChange={handleCheckboxChange}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2 z-10 h-4 w-4 accent-blue-600"
          title={
            tri === 'indeterminate'
              ? 'Sélection partielle (indéterminée) — aucune action ne s’applique sur ce dossier'
              : 'Sélectionner ce dossier'
          }
        />
      )}

      <div className="text-3xl">📂</div>
      <div className="mt-1 text-xs truncate text-center px-2 w-full">{folder.name}</div>
    </div>
  );
}
