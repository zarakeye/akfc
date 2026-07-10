'use client';

import Finder from '@features/finder-core/components/Finder';
import { finderStorageAdapter } from '@/features/finder-adapters/cloudinary/finderStorage.adapter';

/**
 * Page de test du finder agnostique.
 *
 * Le `rootPath` est hardcodé à "AKFC" pour le test — c'est l'`appRoot`
 * du projet (côté backend, c'est ce que vaut `PROJECT_ROOT` lu de
 * `process.env.APP_SHORT_NAME`). Quand le finder sera utilisé dans
 * l'app admin réelle, le rootPath sera passé par le composant parent
 * qui aura accès à cette information (probablement via une variable
 * d'env publique ou une procédure tRPC dédiée).
 */
export default function TestFinderPage() {
  return (
    <div className='p-6'>
      <Finder adapter={finderStorageAdapter} rootPath="AKFC" />
    </div>
  );
}