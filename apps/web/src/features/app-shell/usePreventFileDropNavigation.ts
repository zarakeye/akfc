'use client';

import { useEffect } from 'react';

/**
 * Un fichier lâché à côté d'une zone de dépôt ne doit pas faire quitter la page.
 *
 * Par défaut, le navigateur ouvre un fichier qu'on dépose sur une page : la
 * photo glissée depuis le bureau remplace le tableau de bord, et une page en
 * cours d'édition est perdue. Les zones de dépôt (formulaires d'envoi) gèrent
 * elles-mêmes leurs fichiers et annulent ce comportement (`preventDefault`).
 * Partout ailleurs, on l'annule ici.
 *
 * Les écouteurs sont posés sur `window`, en phase de remontée : une zone de
 * dépôt passe avant eux, et s'ils voient `defaultPrevented`, ils ne font rien.
 * Seuls les fichiers sont concernés (`types` contient `Files`) : le
 * glisser-déposer du finder, qui transporte son propre type, n'est pas touché.
 */
export function usePreventFileDropNavigation(): void {
  useEffect(() => {
    const carriesFiles = (e: DragEvent): boolean =>
      Boolean(e.dataTransfer?.types.includes('Files'));

    const onDragOver = (e: DragEvent): void => {
      if (e.defaultPrevented || !carriesFiles(e)) return;
      e.preventDefault();
      // Curseur « interdit » : ici, le dépôt ne fera rien.
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
    };
    const onDrop = (e: DragEvent): void => {
      if (e.defaultPrevented || !carriesFiles(e)) return;
      e.preventDefault();
    };

    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, []);
}
