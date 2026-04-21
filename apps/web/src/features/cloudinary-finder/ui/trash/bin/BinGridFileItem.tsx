'use client';

import { JSX, useRef } from 'react';
import Image from 'next/image';

import { useLongPress } from '@/features/cloudinary-finder/hooks/useLongPress';
import { useSelectionStore } from '@/features/cloudinary-finder/state/selection/useSelectionStore';
import { getMediaUrl } from '@/features/cloudinary-finder/utils/getMediaUrl';

type Props = {
  trashId: string;
  displayName: string;
  publicId?: string | null;

  /**
   * Bin: multiselect uniquement à la racine (/bin)
   */
  canMultiSelect: boolean;

  /**
   * Tooltip user-facing (ex: previousPath)
   */
  title?: string;

  /**
   * Click normal (read-only): ouvre preview (ou navigation)
   */
  onOpen: (trashId: string) => void;
};

export default function BinGridFileItem({
  trashId,
  displayName,
  publicId,
  canMultiSelect,
  title,
  onOpen,
}: Props): JSX.Element {
  const binMultiSelectActive = useSelectionStore((s) => s.binMultiSelectActive);
  const binSelection = useSelectionStore((s) => s.binSelection);
  const startBinSelection = useSelectionStore((s) => s.startBinSelection);
  const toggleBinSelection = useSelectionStore((s) => s.toggleBinSelection);

  const selected = binSelection.has(trashId);

  const didLongPressRef = useRef(false);

  const longPress = useLongPress(() => {
    if (!canMultiSelect) return;
    didLongPressRef.current = true;
    startBinSelection(trashId);
  });

  const showCheckbox = canMultiSelect && binMultiSelectActive;

  const thumbSrc = publicId
    ? getMediaUrl(
        {
          type: 'file',
          name: displayName,
          fullPath: publicId,
          publicId,
        },
        'thumb'
      )
    : null;

  return (
    <div
      data-content-item="true"
      title={title}
      className={[
        'relative w-32 h-32 rounded border cursor-pointer flex items-center justify-center',
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
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2 z-10 h-4 w-4 accent-blue-600"
        />
      )}

      {thumbSrc ? (
        <Image src={thumbSrc} alt={displayName} fill className="object-contain" />
      ) : (
        <div className="text-2xl">🖼️</div>
      )}

      <div className="absolute bottom-0 w-full bg-white/70 text-xs truncate text-center px-1">
        {displayName}
      </div>
    </div>
  );
}