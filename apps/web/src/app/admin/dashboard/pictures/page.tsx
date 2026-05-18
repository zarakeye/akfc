'use client';

import { JSX } from 'react';
import Finder from '@features/finder-core/components/Finder';
import { cloudinaryAdapter } from '@features/finder-adapters/cloudinary/cloudinary.adapter';
import { APP_ROOT } from '@config/app';

/**
 * Page de gestionnaire de galerie.
 *
 * Affiche le finder agnostique (`finder-core`) configuré avec l'adapter
 * Cloudinary, rooted sur l'app root du projet. C'est la page admin officielle
 * pour gérer les pictures (photos et vidéos).
 *
 * Migration : le legacy `cloudinary-finder/ui/layout/FinderLayout` qui était
 * utilisé ici précédemment a été supprimé en faveur du nouveau `Finder` qui
 * supporte multi-modes d'affichage, drag-and-drop entre dossiers, vue
 * corbeille intégrée, et cache unifié TreeView/GridView.
 */
export default function GalleryPage(): JSX.Element {
  return (
    <div className="p-6 h-full">
      <h1 className="text-2xl font-semibold mb-6">
        Gestionnaire de galerie
      </h1>

      <Finder adapter={cloudinaryAdapter} rootPath={APP_ROOT} />
    </div>
  );
}
