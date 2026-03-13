'use client';

import { JSX } from 'react';
import FinderLayout from '@/features/cloudinary-finder/ui/layout/FinderLayout';

/**
 * Page de gestionnaire de galerie.
 * 
 * Cette page affiche une layout de type gestionnaire de fichiers
 * qui permet de naviguer dans l'arborescence des pictures (photos et vidéos) de l'application.
 * 
 * Elle affiche un titre "Gestionnaire de galerie" et un composant FinderLayout
 * qui encapsule le layout de la page de gestionnaire.
 */
export default function GalleryPage(): JSX.Element {
  return (
    <div className="p-6 h-full">
      <h1 className="text-2xl font-semibold mb-6">
        Gestionnaire de galerie
      </h1>

      <FinderLayout />
    </div>
  );
}