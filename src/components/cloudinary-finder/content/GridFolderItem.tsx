'use client';

import { JSX } from "react";

import { FolderNode } from "@components/cloudinary-finder/types";
import { DragSource } from "@/shared/cloudinary/move.types";

import { useSelectionStore } from "@/lib/stores/useSelectionStore";
import { isItemSelected } from "@/lib/selection/selection.utils";
import { useLongPress } from "@/lib/stores/useLongPress";

type Props = {
  folder: FolderNode;
  onOpenFolder: (path: string) => void;
};

export default function GridFolderItem({ folder, onOpenFolder }: Props): JSX.Element {
  const { multiSelectActive, selection, startSelection, toggleItem } = useSelectionStore();

  const selected = isItemSelected(folder.fullPath, selection);

  const longPress = useLongPress(() => {
    startSelection(folder.fullPath);
  });

  return (
    <div
      className="
        relative
        w-32 h-32
        bg-gray-50
        cursor-pointer
        flex flex-col items-center justify-center
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
            }),
          );
          return;
        }

        const source: DragSource = {
          type: 'folder',
          fullPath: folder.fullPath,
        };

        e.dataTransfer.setData(
          'application/cloudinary',
          JSON.stringify(source),
        );
      }}
      onClick={() => {
        if (multiSelectActive) {
          toggleItem(folder.fullPath);
        } else {
          onOpenFolder(folder.fullPath);
        }
      }}
      {...longPress}
    >
      {/* checkbox */}
      {multiSelectActive && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleItem(folder.fullPath)}
          className="absolute top-2 left-2"
          onClick={e => e.stopPropagation()}
        />
      )}

      <div className="text-3xl">📂</div>
      <div className="mt-1 text-xs truncate text-center">{folder.name}</div>
    </div>
  );
}