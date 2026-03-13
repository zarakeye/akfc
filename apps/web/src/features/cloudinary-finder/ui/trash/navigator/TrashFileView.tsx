// src/components/cloudinary-finder/SelectedFolderContent/TrashFileView.tsx
'use client';

import { JSX, useMemo } from 'react';
import Image from 'next/image';

import BinGridFileItem from '@/features/cloudinary-finder/ui/trash/bin/BinGridFileItem';

type Props = {
  file: { name: string; url: string; previousPath: string };
  onBack: () => void;
};

function toLarge(url: string) {
  return url.replace('/upload/', '/upload/w_1400,h_1400,c_limit,dpr_auto,f_auto/');
}

export default function TrashFileView({ file, onBack }: Props): JSX.Element {
  const largeSrc = useMemo(() => toLarge(file.url), [file.url]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="px-3 py-2 rounded bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer"
          title="Retour"
        >
          ← Retour
        </button>

        <div className="min-w-0">
          <div className="text-sm text-gray-600 truncate" title={file.previousPath}>
            {file.previousPath}
          </div>
        </div>
      </div>

      {/* ✅ “Allure GridFileItem” : on affiche la card 32×32 telle quelle */}
      <div className="flex items-start gap-4">
        <BinGridFileItem
          trashId={file.url} // identifiant stable en read-only
          displayName={file.name}
          previewUrl={file.url}
          canMultiSelect={false}
          title={file.previousPath}
          onOpen={() => {
            // read-only: pas d’action (clic sur la card ne fait rien)
          }}
        />

        {/* Preview grande (read-only), dans un cadre cohérent */}
        <div className="flex-1">
          <div className="relative w-full h-[60vh] rounded border bg-gray-50 overflow-hidden">
            <Image src={largeSrc} alt={file.name} fill className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}