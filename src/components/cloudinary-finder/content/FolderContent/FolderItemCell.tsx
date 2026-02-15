import { JSX } from "react";
import clsx from "clsx";
import { useSelectionStore } from "@/lib/stores/useSelectionStore";
import { isItemSelected } from "@/lib/selection/selection.utils";
import { useLongPress } from "@/lib/stores/useLongPress";
import { DragSource } from "@/shared/cloudinary/move.types";

type Props = {
  path: string;
  label: string;
  draggable: boolean;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
};

export function FolderItemCell({ 
  path,
  label,
  draggable,
  onOpen,
  onDragStart,
}: Props): JSX.Element {
  const { multiSelectActive, selection, startSelection, toggleItem } = useSelectionStore();

  const selected = isItemSelected(path, selection);
  
  const longPress = useLongPress(() => {
    startSelection(path);
  });
  
  return (
    <div
      className={clsx(
        'relative p-3 h-20',
        'flex items-center justify-center cursor-pointer',
        'hover:bg-gray-100'
      )}
      draggable={draggable && !multiSelectActive}
      onDragStart={e => {
        if (multiSelectActive) return;

        const source: DragSource = {
          type: 'folder',
          fullPath: path,
        };

        e.dataTransfer.setData(
          'application/cloudinary',
          JSON.stringify(source),
        );
      }}
      // onDragOver={e => handleDragOver(e, f.fullPath)}
      // onDragLeave={handleDragLeave}
      // onDrop={e => handleDropOnFolder(e, f.fullPath)}
      onClick={() => {
        // onOpenFolder(f.fullPath);
        if (multiSelectActive) {
          toggleItem(path);
        } else {
          onOpen();
        }
      }}
      {...longPress}
    >
      {/* checkbox */}
      {multiSelectActive && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleItem(path)}
          className="absolute top-2 left-2"
          onClick={e => e.stopPropagation()}
        />
      )}

      📁 {label}
    </div>
  )
}