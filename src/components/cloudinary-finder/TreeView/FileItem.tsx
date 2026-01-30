'use client';

import { DragSource } from '@/shared/cloudinary/move.intent';

type Props = {
  file: {
    fullPath: string;
    name: string;
  };
};

export function FileItem({ file }: Props) {
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