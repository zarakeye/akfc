'use client';

import { JSX } from 'react';
import { File } from 'lucide-react';
import clsx from 'clsx';

import type { FinderNode } from '@contracts/finder';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { parentPath } from '@features/finder-core/utils/path';

/**
 * 📄 Item fichier dans la TreeView.
 *
 * Symétrique à `FinderTreeFolder` mais pour les fichiers : pas de chevron
 * d'expansion (un fichier n'a pas d'enfants), pas de drop-target (pour
 * 4.4-bis ; un fichier peut éventuellement devenir drop-target plus tard
 * pour des actions tierces, hors scope ici), juste une icône fichier
 * Lucide et le nom cliquable.
 *
 * 🎯 Comportement au clic
 *
 * Naviguer dans le dossier parent du fichier ET sélectionner le fichier.
 * C'est le comportement attendu d'un finder type macOS / VS Code : cliquer
 * sur un fichier dans l'arbo de gauche → on voit son dossier dans la
 * grille centrale ET le fichier est sélectionné (donc visible dans le
 * panneau de preview à droite).
 *
 * ⚠️ Ordre des opérations
 *
 * `setPath` reset la sélection ET désactive `multiSelectActive` (cf.
 * choix produit du 4.2). Donc on appelle d'abord `setPath(parent)`,
 * puis `selectOnly(file.id)` — sinon le step 1 effacerait la sélection
 * du step 2.
 *
 * Note : `useFinderData` rechargera automatiquement le contenu du dossier
 * parent suite au changement de `currentPath`, et le fichier sera alors
 * dans `files` du store, donc retrouvable par le PreviewPanel via son id.
 */
type Props = {
  node: FinderNode;
};

export default function FinderTreeFile({ node }: Props): JSX.Element {
  const setPath = useFinderStore((s) => s.setPath);
  const selectOnly = useFinderStore((s) => s.selectOnly);
  const currentPath = useFinderStore((s) => s.currentPath);
  const selectedIds = useFinderStore((s) => s.selection.roots);

  const isActive =
    currentPath === parentPath(node.path) && selectedIds.has(node.id);

  function handleClick() {
    setPath(parentPath(node.path));
    selectOnly(node.id);
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm',
        // Indenté de la même quantité que les sous-dossiers — on aligne
        // visuellement folders et files au même niveau hiérarchique.
        // L'absence de chevron est compensée par un padding gauche
        // équivalent à sa largeur.
        'pl-[1.625rem]',
        isActive && 'bg-accent text-accent-foreground font-medium',
        !isActive && 'hover:bg-accent/40',
      )}
      title={node.path}
    >
      <File className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />
      <span className="truncate">{node.name}</span>
    </div>
  );
}
