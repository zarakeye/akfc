'use client';

import { JSX, useRef, useState } from 'react';

import type { FolderNode, TreeNode } from '@components/cloudinary-finder/types';
import { explorerNodeToDragSource } from '@components/cloudinary-finder/explorer.move.mapper';

import { useSelectionStore } from '@/lib/stores/useSelectionStore';
import { isItemSelected } from '@/lib/selection/selection.utils';
import { useLongPress } from '@/lib/stores/useLongPress';
import { startDragGhost } from './dragGhost.manager';

type Props = {
  folder: FolderNode;
  onOpenFolder: (path: string) => void;
  visibleNodes: TreeNode[];
};

export default function GridFolderItem({ folder, onOpenFolder, visibleNodes }: Props): JSX.Element {
  const { multiSelectActive, selection, startSelection, toggleItem, clearSelection } =
    useSelectionStore();

  const selected = isItemSelected(folder.fullPath, selection);

  const didLongPressRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const longPress = useLongPress(() => {
    didLongPressRef.current = true;
    startSelection(folder.fullPath);
  });

  function resolveNodesForGhost(): TreeNode[] {
    if (!multiSelectActive) return [folder];

    const excluded = selection.excluded;
    const roots = [...selection.roots].filter((p) => !excluded.has(p));
    const selectedNodes = visibleNodes.filter((n) => roots.includes(n.fullPath));

    if (!selected) {
      clearSelection();
      return [folder];
    }

    return selectedNodes.length ? selectedNodes : [folder];
  }

  return (
    <div
      data-content-item="true"
      className={[
        'relative w-32 h-32 rounded border cursor-pointer flex flex-col items-center justify-center',
        'transition-colors duration-150',
        selected ? 'bg-slate-200/70 border-slate-300' : 'bg-gray-50 border-gray-200',
        'hover:shadow-md',
      ].join(' ')}
      draggable
      onDragStart={(e) => {
        setDragging(true);

        const nodesForGhost = resolveNodesForGhost();

        const payload = explorerNodeToDragSource(
          multiSelectActive && selected
            ? { kind: 'selection', selection }
            : { kind: 'single', node: folder }
        );

        e.dataTransfer.setData('application/cloudinary', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'move';

        const previews = nodesForGhost.map((n) => {
          if (n.type === 'file') {
            const thumbUrl = n.url.replace('/upload/', '/upload/w_128,h_128,c_fit,dpr_auto,f_auto/');
            return { kind: 'file' as const, name: n.name, thumbUrl };
          }
          return { kind: 'folder' as const, name: n.name };
        });

        startDragGhost({ e, source: payload, previews });
        longPress.onDragStart();
      }}
      onDragEnd={() => setDragging(false)}
      onClick={() => {
        if (didLongPressRef.current) {
          didLongPressRef.current = false;
          return;
        }

        if (dragging) return;

        if (multiSelectActive) toggleItem(folder.fullPath);
        else onOpenFolder(folder.fullPath);
      }}
      onMouseDown={longPress.onMouseDown}
      onMouseUp={longPress.onMouseUp}
      onMouseLeave={longPress.onMouseLeave}
    >
      {multiSelectActive && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleItem(folder.fullPath)}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2 z-10"
        />
      )}

      <div className="text-3xl">📂</div>
      <div className="mt-1 text-xs truncate text-center px-2 w-full">{folder.name}</div>
    </div>
  );
}
