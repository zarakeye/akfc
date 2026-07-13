'use client';

import { JSX } from 'react';

import PersoPhotoUploader from '@features/admin/perso/PersoPhotoUploader';

/**
 * Espace photos perso de l'admin connecté — `/(admin)/dashboard/mes-photos`.
 * Point de montage minimal (le placement final dashboard + profil viendra
 * ensuite).
 */
export default function MesPhotosPage(): JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Mes photos</h1>
      <PersoPhotoUploader />
    </div>
  );
}
