'use client';

import { JSX, useRef } from 'react';
import Image from 'next/image';

import { useLongPress } from '@/lib/stores/useLongPress';
import { useSelectionStore } from '@/lib/stores/useSelectionStore';

type Props = {
  trashId: string;
  displayName: string;
  previewUrl?: string | null;

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

function toThumb(url: string) {
  // ✅ même logique que GridFileItem
  return url.replace('/upload/', '/upload/w_128,h_128,c_fit,dpr_auto,f_auto/');
}

export default function BinGridFileItem({
  trashId,
  displayName,
  previewUrl,
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

  return (
    <div
      data-content-item="true"
      title={title}
      className={[
        // ✅ EXACTEMENT le gabarit de GridFileItem
        'relative w-32 h-32 rounded border cursor-pointer flex items-center justify-center',
        'transition-colors duration-150',
        selected && showCheckbox ? 'bg-slate-200/70 border-slate-300' : 'bg-gray-50 border-gray-200',
        'hover:shadow-md',
      ].join(' ')}
      onMouseDown={canMultiSelect ? (e) => {
        e.stopPropagation();
        longPress.onMouseDown();
      } : undefined}
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

      {/* ✅ thumbnail / fallback */}
      {previewUrl ? (
        <Image src={toThumb(previewUrl)} alt={displayName} fill className="object-contain" />
      ) : (
        <div className="text-2xl">🖼️</div>
      )}

      {/* ✅ label bas identique */}
      <div className="absolute bottom-0 w-full bg-white/70 text-xs truncate text-center px-1">
        {displayName}
      </div>
    </div>
  );
}