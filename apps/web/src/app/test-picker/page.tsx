'use client';

import { useState } from 'react';
import { MediaPicker } from '@/features/finder-core/components/MediaPicker';
import { finderStorageAdapter } from '@/features/finder-adapters/cloudinary/finderStorage.adapter';

export default function TestPickerPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Ouvrir Media Picker
      </button>

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        adapter={finderStorageAdapter}
        rootPath="AKFC"
        onSubmit={(ids) => {
          console.log('Selected:', ids);
        }}
      />
    </div>
  );
}