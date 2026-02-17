'use client';

import { VirtualFolderNode } from "@/components/cloudinary-finder/types";
import { MoveIntent } from "@server/cloudinary/schemas/move.schema";

import { JSX, useState } from "react";
import clsx from "clsx";
import { DragSource } from "@/shared/cloudinary/move.types";

type Props = {
  node: VirtualFolderNode;
  currentPath?: string;
  onOpen: (path: string) => void;
  onMove: (intent: MoveIntent) => void;
};

/**
 * VirtualFolderNodeComponent represents a "status root" that may not exist physically yet.
 * It is a drop target (so items can be moved into it).
 */
export default function VirtualFolderNodeComponent({
  node,
  currentPath,
  onOpen,
  onMove,
}: Props): JSX.Element {
  const [isOver, setIsOver] = useState<boolean>(false);

  const isActive = node.fullPath === currentPath;

  // 🔹 Autoriser le drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);

    const raw = e.dataTransfer.getData('application/cloudinary');
    if (!raw) return;

    try {
      const source: DragSource = JSON.parse(raw);

      const intent: MoveIntent = {
        source,
        target: {
          type: 'folder',
          fullPath: node.fullPath,
        },
      };

      onMove(intent);
    } catch (err) {
      console.error('[VirtualFolderNode] Invalid drop payload', err);
    }
  };

  return (
    <div
      /**
       * ✅ AJOUT IMPORTANT :
       * Marqueur pour que FinderLayout sache qu'on clique sur un item Tree
       * et ne clearSelection pas en mode multiSelect.
       */
      data-tree-item="true"
      onClick={() => onOpen(node.fullPath)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        /**
         * ✅ Action effectuée :
         * - On adopte la même structure que FolderNodeComponent pour l'alignement :
         *   flex + gap-2 + px-3 py-1
         * - On ajoute un spacer "w-4" à gauche (colonne chevron) même si virtual n'a pas de chevron.
         */
        'flex items-center gap-2 px-3 py-1 rounded cursor-pointer select-none',
        isActive && 'bg-blue-100 text-blue-700',
        isOver && 'bg-blue-50'
      )}
    >
      {/* Spacer chevron pour aligner avec les folders réels */}
      <span className="w-4 inline-block" />

      <span>📂</span>
      <span className="capitalize">{node.name}</span>
    </div>
  );
}
