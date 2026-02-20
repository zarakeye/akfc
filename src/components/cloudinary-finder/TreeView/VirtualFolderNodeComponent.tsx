'use client';

import { JSX, useState } from 'react';
import clsx from 'clsx';

import type { VirtualFolderNode } from '@/components/cloudinary-finder/types';
import type { DragSource } from '@/shared/cloudinary/move.types';
import type { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import { canMove } from '@/server/cloudinary/move.guards';

type Props = {
  node: VirtualFolderNode;
  currentPath?: string;
  onOpen: (path: string) => void;
  onMove: (intent: MoveIntent) => void;
};

/**
 * ✅ Virtual folder = dropzone only (non draggable)
 * ✅ Alignement visuel: réserve la place du chevron des folders réels
 * ✅ data-drop-* compatibles avec dragGhost.manager.ts
 */
export default function VirtualFolderNodeComponent({
  node,
  currentPath,
  onOpen,
  onMove,
}: Props): JSX.Element {
  const [isOver, setIsOver] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  const isActive = node.fullPath === currentPath;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // nécessaire pour autoriser le drop

    const raw = e.dataTransfer.getData('application/cloudinary');
    if (!raw) {
      setIsOver(true);
      setIsForbidden(true);
      return;
    }

    try {
      const source: DragSource = JSON.parse(raw);
      const ok = canMove(source, { type: 'virtual-folder', status: node.status });

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

      const intent: MoveIntent = {
        source,
        // ✅ IMPORTANT: virtual-folder target (pas folder/fullPath)
        target: { type: 'virtual-folder', status: node.status },
      };

      onMove(intent);
    } catch (err) {
      console.error('[VirtualFolderNodeComponent] Invalid drop payload', err);
    }
  };

  return (
    <div
      // ✅ requis pour dragGhost.manager.ts (document.dragover)
      data-drop-type="virtual-folder"
      data-drop-status={node.status}
      onClick={() => onOpen(node.fullPath)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        'px-9 py-1 rounded cursor-pointer select-none',
        isActive && 'bg-blue-100 text-blue-700',
        isOver && !isForbidden && 'bg-emerald-400/15',
        isOver && isForbidden && 'bg-rose-400/15'
      )}
    >
      <div className="flex items-center gap-2">
        {/* ✅ placeholder chevron pour aligner */}
        <span className="w-4 inline-block" />

        <span>📂</span>
        <span className="capitalize truncate">{node.name}</span>
      </div>
    </div>
  );
}
