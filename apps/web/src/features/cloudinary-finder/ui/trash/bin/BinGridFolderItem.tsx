// src/components/cloudinary-finder/SelectedFolderContent/BinGridFolderItem.tsx
'use client';

import { JSX, useRef } from 'react';
import { useLongPress } from '@/features/cloudinary-finder/hooks/useLongPress';
import { useSelectionStore } from '@/features/cloudinary-finder/state/selection/useSelectionStore';

type Props = {
  trashId: string;
  displayName: string;
  canMultiSelect: boolean;
  onOpen: (trashId: string) => void;

  /**
   * Tooltip optionnel (previousPath)
   */
  title?: string;
};

export default function BinGridFolderItem({
  trashId,
  displayName,
  canMultiSelect,
  onOpen,
  title,
}: Props): JSX.Element {
  const binMultiSelectActive = useSelectionStore((s) => s.binMultiSelectActive);
  const binSelection = useSelectionStore((s) => s.binSelection);
  const startBinSelection = useSelectionStore((s) => s.startBinSelection);
  const toggleBinSelection = useSelectionStore((s) => s.toggleBinSelection);

  const selected = binSelection.has(trashId);
  const showCheckbox = canMultiSelect && binMultiSelectActive;

  const didLongPressRef = useRef(false);

  const longPress = useLongPress(() => {
    if (!canMultiSelect) return;
    didLongPressRef.current = true;
    startBinSelection(trashId);
  });

  return (
    <div
      data-content-item="true"
      title={title}
      className={[
        'relative w-32 h-32 rounded border cursor-pointer flex flex-col items-center justify-center',
        'transition-colors duration-150',
        selected && showCheckbox ? 'bg-slate-200/70 border-slate-300' : 'bg-gray-50 border-gray-200',
        'hover:shadow-md',
      ].join(' ')}
      onMouseDown={
        canMultiSelect
          ? (e) => {
              e.stopPropagation();
              longPress.onMouseDown();
            }
          : undefined
      }
      onMouseUp={canMultiSelect ? () => longPress.onMouseUp() : undefined}
      onMouseLeave={canMultiSelect ? () => longPress.onMouseLeave() : undefined}
      onClick={() => {
        if (didLongPressRef.current) {
          didLongPressRef.current = false;
          return;
        }

        if (!canMultiSelect) {
          onOpen(trashId);
          return;
        }

        if (binMultiSelectActive) {
          toggleBinSelection(trashId);
          return;
        }

        onOpen(trashId);
      }}
    >
      {showCheckbox && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleBinSelection(trashId)}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2 z-10 h-4 w-4 accent-blue-600"
        />
      )}

      <div className="text-3xl">📂</div>
      <div className="mt-1 text-xs truncate text-center px-2 w-full">
        {displayName}
      </div>
    </div>
  );
}