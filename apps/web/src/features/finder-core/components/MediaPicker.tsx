'use client';

import { JSX } from 'react';
import { Modal } from '@/components/ui/Modal';
import Finder from '@features/finder-core/components/Finder';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import type { FileAdapter } from '@features/finder-core/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (selectedIds: string[]) => void;
  adapter: FileAdapter;
};

/**
 * 🖼️ MediaPicker : un composant de sélection de médias basé sur Finder
 * - Affiche un modal avec le Finder à l'intérieur
 * - Permet de sélectionner des fichiers et de valider la sélection
 */
export function MediaPicker({
  open,
  onClose,
  onSubmit,
  adapter,
}: Props): JSX.Element {
  const { selection } = useFinderStore();

  function handleSubmit() {
    const ids = Array.from(selection.selectedIds);
    onSubmit(ids);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      {/* HEADER */}
      <div className="p-4 border-b font-medium">
        Sélectionner des médias
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto">
        <Finder adapter={adapter} />
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {selection.selectedIds.size} sélectionné(s)
        </span>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded"
          >
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={selection.selectedIds.size === 0}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Valider
          </button>
        </div>
      </div>
    </Modal>
  );
}