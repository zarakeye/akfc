// src/app/dashboard/gallery/page.tsx
'use client';

import FinderLayout from '@/components/cloudinary-finder/content/FinderLayout';

export default function GalleryPage() {
  return (
    <div className="p-6 h-full">
      <h1 className="text-2xl font-semibold mb-6">
        Gestionnaire de galerie
      </h1>

      <FinderLayout />
    </div>
  );
}