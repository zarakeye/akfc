'use client';

import { JSX } from 'react';
import { DragSource } from '@/shared/cloudinary/move.types';

type Props = {
  file: {
    fullPath: string;
    name: string;
  };
};

/**
 * A component that represents a file item in the tree view.
 * It renders a draggable div with the file name.
 *
 * @param {Props} props - The props object.
 * @param {file} props.file - The file object to be rendered.
 * @returns {JSX.Element} - The rendered JSX element.
 */
export function FileItem({ file }: Props): JSX.Element {
  /**
   * Handles a drag start event on the file item.
   * Sets the drag data to contain the file path and sets the drag effect to 'move'.
   * Also sets the drag image to be a small version of the file item.
   * @param {React.DragEvent} e - The drag start event.
   */
  function handleDragStart(e: React.DragEvent) {
    const dragSource: DragSource = {
      type: 'file',
      fullPath: file.fullPath,
    };

    e.dataTransfer.setData(
      'application/cloudinary',
      JSON.stringify(dragSource)
    );

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(
      e.currentTarget,
      16,
      16
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-move"
    >
      🖼️ {file.name}
    </div>
  );
}