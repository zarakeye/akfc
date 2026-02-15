'use client';

import { VirtualFolderNode } from "@/components/cloudinary-finder/types";
import { MoveIntent } from "@server/cloudinary/schemas/move.schema";

import { JSX, useState } from "react";
import clsx from "clsx";
import { DragSource } from "@/shared/cloudinary/move.types";

type Props = {
  node: VirtualFolderNode,
  currentPath?: string,
  onOpen: (path: string) => void,
  onMove: (intent: MoveIntent) => void
}

/**
 * VirtualFolderNodeComponent is a React component that represents a virtual folder in the tree view.
 * It accepts the following props:
 * - `node`: The virtual folder object to be displayed.
 * - `currentPath`: The current path of the user in the tree view.
 * - `onOpen`: A function to be called when the user clicks on the virtual folder to open it.
 * - `onMove`: A function to be called when the user drags and drops a folder item.
 * 
 * The component renders a folder item with a chevron on the left if the folder has subfolders, and a drag handle on the right.
 * If the folder is currently open, it renders a list of subfolders below the folder item.
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
    e.preventDefault(); // Nécessaire pour autoriser le drop
    setIsOver(true);
  };

  /**
   * Resets the `isOver` state to `false` when the user drags
   * something out of the virtual folder node.
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsOver(false);
  };

  /**
   * Handles a drop event on a virtual folder node.
   * Parses the dropped item from the `application/cloudinary` data transfer format,
   * and calls the `onMove` function with the parsed item as the source and the current folder as the target.
   * If the dropped item is invalid, logs an error to the console.
   */
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
      onClick={() => onOpen(node.fullPath)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        'px-3 py-1 rounded cursor-pointer select-none',
        isActive && 'bg-blue-100 text-blue-700',
        isOver && 'bg-blue-50'
      )}
    >
      <div className="flex items-center gap-2">
        <span>📂</span>
        <span className="capitalize">{node.name}</span>
      </div>
    </div>
  );
}