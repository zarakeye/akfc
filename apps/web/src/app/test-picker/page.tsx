'use client';

import { useState } from 'react';
import { MediaPicker } from '@/features/finder-core/components/MediaPicker';
import { cloudinaryAdapter } from '@/features/cloudinary-adapter/cloudinaryAdapter';

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
        adapter={cloudinaryAdapter}
        onSubmit={(ids) => {
          console.log('Selected:', ids);
        }}
      />
    </div>
  );
}