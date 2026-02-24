'use client';

import { JSX, useRef, useState } from 'react';
import Image from 'next/image';

import type { FileNode, TreeNode } from '@/components/cloudinary-finder/types';
import { explorerNodeToDragSource } from '@components/cloudinary-finder/explorer.move.mapper';

import { useSelectionStore } from '@/lib/stores/useSelectionStore';
import { useLongPress } from '@/lib/stores/useLongPress';
import { startDragGhost } from './dragGhost.manager';

type Props = {
  file: FileNode;
  onSelect?: (file: FileNode) => void;
  visibleNodes: TreeNode[];
};

/**
 * Construit une sélection “actionnable” pour le drag depuis la grid.
 *
 * Spéc demandé : seuls les éléments VALIDÉS (checked) subissent l'action.
 * - Fichiers checked : inclus
 * - Dossiers indéterminés : exclus (ils ne sont jamais “checked” côté file)
 *
 * Ici, comme on est sur un file item, l'objectif est surtout :
 * - drag en multiselect => déplacer la sélection de tous les items cochés visibles
 * - sans inclure les dossiers indéterminés (filtrés dans explorer.move.mapper)
 */
function buildActionableSelection(params: {
  selection: { roots: Set<string>; excluded: Set<string> };
  visibleNodes: TreeNode[];
  isSelected: (path: string) => boolean;
}): { roots: string[]; excluded?: string[] } {
  const { selection, visibleNodes, isSelected } = params;

  const excludedArr = Array.from(selection.excluded);

  // 1) roots validés (pas d'exclusion sous eux)
  const validRootsFromStore: string[] = [];
  for (const r of selection.roots) {
    const hasExcludedUnder = excludedArr.some((ex) => ex === r || ex.startsWith(`${r}/`));
    if (!hasExcludedUnder) validRootsFromStore.push(r);
  }

  const rootsSet = new Set<string>(validRootsFromStore);

  // 2) ajouter les fichiers cochés visibles
  for (const n of visibleNodes) {
    if (n.type !== 'file') continue;
    if (isSelected(n.fullPath)) rootsSet.add(n.fullPath);
  }

  const roots = Array.from(rootsSet);
  const keptExcluded = excludedArr.filter((ex) => roots.some((r) => ex === r || ex.startsWith(`${r}/`)));

  return {
    roots,
    excluded: keptExcluded.length ? keptExcluded : undefined,
  };
}

export default function GridFileItem({ file, onSelect, visibleNodes }: Props): JSX.Element {
  const {
    multiSelectActive,
    selection,
    startSelection,
    toggleItem,
    isSelected,
  } = useSelectionStore();

  // ✅ sélection implicite (roots/excluded) = vrai même si file est descendant d’un root
  const selected = isSelected(file.fullPath);

  const didLongPressRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const longPress = useLongPress(() => {
    didLongPressRef.current = true;
    startSelection(file.fullPath);
  });

  function toThumb(url: string) {
    return url.replace('/upload/', '/upload/w_128,h_128,c_fit,dpr_auto,f_auto/');
  }

  return (
    <div
      data-content-item="true"
      className={[
        'relative w-32 h-32 rounded border cursor-pointer flex items-center justify-center',
        'transition-colors duration-150',
        selected ? 'bg-slate-200/70 border-slate-300' : 'bg-gray-50 border-gray-200',
        'hover:shadow-md',
      ].join(' ')}
      draggable
      onDragStart={(e) => {
        setDragging(true);

        // ✅ actionnable = roots validés + fichiers cochés visibles
        const actionable = buildActionableSelection({ selection, visibleNodes, isSelected });

        // En multiselect, on utilise “selection” uniquement si le file est coché
        // ET si on a au moins 1 root actionnable.
        const shouldUseSelection = multiSelectActive && selected && actionable.roots.length > 0;

        const payload = explorerNodeToDragSource(
          shouldUseSelection
            ? { kind: 'selection', selection: { roots: new Set(actionable.roots), excluded: new Set(actionable.excluded ?? []) } }
            : { kind: 'single', node: file }
        );

        e.dataTransfer.setData('application/cloudinary', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'move';

        const nodesForGhost: TreeNode[] = shouldUseSelection
          ? visibleNodes.filter((n) => actionable.roots.includes(n.fullPath))
          : [file];

        const previews = nodesForGhost.map((n) => {
          if (n.type === 'file') {
            return { kind: 'file' as const, name: n.name, thumbUrl: toThumb(n.url) };
          }
          return { kind: 'folder' as const, name: n.name };
        });

        startDragGhost({ e, source: payload, previews });

        // ✅ annule le long press résiduel
        longPress.onDragStart();
      }}
      onDragEnd={() => setDragging(false)}
      onClick={() => {
        if (didLongPressRef.current) {
          didLongPressRef.current = false;
          return;
        }

        if (dragging) return;

        if (multiSelectActive) toggleItem(file.fullPath);
        else onSelect?.(file);
      }}
      onMouseDown={longPress.onMouseDown}
      onMouseUp={longPress.onMouseUp}
      onMouseLeave={longPress.onMouseLeave}
    >
      {multiSelectActive && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleItem(file.fullPath)}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2 z-10 h-4 w-4 accent-blue-600"
        />
      )}

      <Image src={toThumb(file.url)} alt={file.name} fill className="object-contain" />

      <div className="absolute bottom-0 w-full bg-white/70 text-xs truncate text-center px-1">
        {file.name}
      </div>
    </div>
  );
}
