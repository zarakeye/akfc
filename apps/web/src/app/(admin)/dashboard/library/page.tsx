'use client';

import { JSX, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Finder from '@features/finder-core/components/Finder';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { finderStorageAdapter } from '@/features/finder-adapters/cloudinary/finderStorage.adapter';
import { APP_ROOT } from '@config/app';

/**
 * Page bibliothèque.
 *
 * Affiche le finder agnostique (`finder-core`) configuré avec l'adapter
 * multi-backend (Cloudinary + R2 via `VirtualStorage`), rooted sur l'app
 * root du projet. C'est la page admin officielle pour gérer tous les types
 * d'assets : images et vidéos hébergés sur Cloudinary, audios / docs /
 * archives hébergés sur R2.
 *
 * Migration : le legacy `cloudinary-finder/ui/layout/FinderLayout` qui était
 * utilisé ici précédemment a été supprimé en faveur du nouveau `Finder` qui
 * supporte multi-modes d'affichage, drag-and-drop entre dossiers, vue
 * corbeille intégrée, et cache unifié TreeView/GridView.
 */
export default function GalleryPage(): JSX.Element {
  // Lien profond : `?path=AKFC/cours/x` ouvre le finder sur ce dossier.
  // Utilisé par la cloche de notifications pour mener droit au contenu.
  const searchParams = useSearchParams();
  const setPath = useFinderStore((state) => state.setPath);
  const requestedPath = searchParams.get('path');

  useEffect(() => {
    if (requestedPath) setPath(requestedPath);
  }, [requestedPath, setPath]);

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-semibold mb-6 shrink-0">
        Bibliothèque
      </h1>
      <div className="flex-1 min-h-0">
        <Finder adapter={finderStorageAdapter} rootPath={APP_ROOT} />
      </div>
    </div>
  );
}
