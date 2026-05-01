'use client';

import { JSX } from 'react';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';

export default function PreviewPanel(): JSX.Element {
  const { selection, files } = useFinderStore();

  const selectedId = Array.from(selection.selectedIds)[0];

  if (!selectedId) {
    return (
      <div className='h-full flex items-center justify-center text-gray-400'>
        Aucun élément sélectionné
      </div>
    );
  }

  const file = files.find((f) => f.id === selectedId);

  if (!file) {
    return (
      <div className='h-full flex items-center justify-center text-red-400'>
        Aperçu indisponible
      </div>
    );
  }

  return (
    <div className='p-4 h-full flex flex-col gap-4'>
      <div className='text-sm font-medium truncate'>{file.name}</div>

      {file.url ? (
        <img
          src={file.url}
          alt={file.name}
          className='max-h-75 object-contain rounded border'
        />
      ) : (
        <div className='text-gray-400 text-sm'>
          Pas de preview disponible
        </div>
      )}
    </div>
  );
}