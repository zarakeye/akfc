'use client';

import { JSX, useState } from 'react';
import { useSelectionStore } from '@/lib/stores/useSelectionStore';

import type { FolderStatus } from '@/core/cloudinary/folder.types';

export default function MultiSelectSidebar(): JSX.Element {
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  const [status, setStatus] = useState<FolderStatus>('pending');

  /**
   * Apply the status to the currently selected files/folders.
   * This will clear the current selection and update the status of the selected files/folders.
   * @param {FolderStatus} status - The status to apply to the selected files/folders.
   */
  function handleValidate() {
    // 👉 ici on branchera la mutation de changement de statut
    console.log('Apply status: ', status);
    clearSelection();
    // setStatus('published');
  }

  const statuses: FolderStatus[] = ['pending', 'published', 'bin'];

  return (
    <div className="p-4 space-y-4">
      <h2 className='font-semibold text-lg'>Modifier le statut</h2>

      <div className='space-y-2'>
        {statuses.map((s) => (
          <label key={s} className='flex items-center gap-2 cursor-pointer'>
            <input
              type="radio"
              name="status"
              // value={s}
              checked={status === s}
              onChange={() => setStatus(s)}
            />
            <span>{s}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleValidate}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Valider
      </button>
      
      <button
        onClick={clearSelection}
        className="w-full text-white py-2 rounded"
      >
        Annuler
      </button>
    </div>
  );
}