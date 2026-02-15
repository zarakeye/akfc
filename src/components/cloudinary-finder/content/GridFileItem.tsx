'use client';

import { JSX } from 'react';
import Image from 'next/image';

import { FileNode } from '@/components/cloudinary-finder/types';
import { DragSource } from '@/shared/cloudinary/move.types';

import { useSelectionStore } from '@/lib/stores/useSelectionStore';
import { isItemSelected } from '@/lib/selection/selection.utils';
import { useLongPress } from '@/lib/stores/useLongPress';

type Props = {
  file: FileNode;
  onSelect?: (file: FileNode) => void;
};

export default function GridFileItem({ file, onSelect }: Props): JSX.Element {
  const { multiSelectActive, selection, startSelection, toggleItem } = useSelectionStore();

  const selected = isItemSelected(file.fullPath, selection);

  const longPress = useLongPress(() => {
    startSelection(file.fullPath);
  });

  return (
    <div
      className="
        relative
        w-32 h-32
        rounded border
        bg-gray-50
        cursor-pointer
        flex items-center justify-center
        hover:shadow-md
      "
      draggable={!multiSelectActive}
      onDragStart={(e) => {
        if (multiSelectActive) {
          e.dataTransfer.setData(
            'application/cloudinary',
            JSON.stringify({
              type: 'selection',
              roots: [...selection.roots],
              excluded: [...selection.excluded],
            })
          );
        }

        const source: DragSource = {
          type: 'file',
          fullPath: file.fullPath,
        };

        e.dataTransfer.setData(
          'application/cloudinary',
          JSON.stringify(source)
        );
      }}
      onClick={() => {
        if (multiSelectActive) {
          toggleItem(file.fullPath);
        } else {
          onSelect?.(file);
        }
      }}
      {...longPress}
    >
      {multiSelectActive && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => {
            toggleItem(file.fullPath);
          }}
          className='absolute top-2 left-2 z-10'
        />
      )}

      <Image
        src={getThumNailUrl(file.url)}
        alt={file.name}
        fill
        className="object-contain"
      />
      
      <div className='absolute bottom-0 w-full bg-white/80 text-xs truncate text-center px-1'>
        {file.name}
      </div>
    </div>
  );
}

function getThumNailUrl(url: string) {
  return url.replace(
    '/upload/',
    '/upload/w_128,h_128,c_fit,dpr_auto,f_auto/'
  );
}
