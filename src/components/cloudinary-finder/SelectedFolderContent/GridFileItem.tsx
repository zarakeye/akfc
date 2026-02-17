'use client';

import { JSX, useRef, useState } from 'react';
import Image from 'next/image';

import type { FileNode, TreeNode } from '@/components/cloudinary-finder/types';
import { explorerNodeToDragSource } from '@components/cloudinary-finder/explorer.move.mapper';

import { useSelectionStore } from '@/lib/stores/useSelectionStore';
import { isItemSelected } from '@/lib/selection/selection.utils';
import { useLongPress } from '@/lib/stores/useLongPress';
import { startDragGhost } from './dragGhost.manager';

type Props = {
  file: FileNode;
  onSelect?: (file: FileNode) => void;
  visibleNodes: TreeNode[];
};

export default function GridFileItem({ file, onSelect, visibleNodes }: Props): JSX.Element {
  const { multiSelectActive, selection, startSelection, toggleItem, clearSelection } =
    useSelectionStore();

  const selected = isItemSelected(file.fullPath, selection);

  const didLongPressRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const longPress = useLongPress(() => {
    didLongPressRef.current = true;
    startSelection(file.fullPath);
  });

  function toThumb(url: string) {
    return url.replace('/upload/', '/upload/w_128,h_128,c_fit,dpr_auto,f_auto/');
  }

  function resolveNodesForGhost(): TreeNode[] {
    if (!multiSelectActive) return [file];

    const excluded = selection.excluded;
    const roots = [...selection.roots].filter((p) => !excluded.has(p));
    const selectedNodes = visibleNodes.filter((n) => roots.includes(n.fullPath));

    if (!selected) {
      clearSelection();
      return [file];
    }

    return selectedNodes.length ? selectedNodes : [file];
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

        const nodesForGhost = resolveNodesForGhost();

        const payload = explorerNodeToDragSource(
          multiSelectActive && selected
            ? { kind: 'selection', selection }
            : { kind: 'single', node: file }
        );

        e.dataTransfer.setData('application/cloudinary', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'move';

        const previews = nodesForGhost.map((n) => {
          if (n.type === 'file') {
            return { kind: 'file' as const, name: n.name, thumbUrl: toThumb(n.url) };
          }
          return { kind: 'folder' as const, name: n.name };
        });

        startDragGhost({ e, source: payload, previews });

        // ✅ Important : annuler tout long press résiduel
        longPress.onDragStart();
      }}
      onDragEnd={() => setDragging(false)}
      onClick={() => {
        // ignore le click qui suit immédiatement le longPress
        if (didLongPressRef.current) {
          didLongPressRef.current = false;
          return;
        }

        // ignore si drag
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
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2 z-10"
        />
      )}

      <Image src={toThumb(file.url)} alt={file.name} fill className="object-contain" />

      <div className="absolute bottom-0 w-full bg-white/70 text-xs truncate text-center px-1">
        {file.name}
      </div>
    </div>
  );
}
