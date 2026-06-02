'use client';

import { JSX } from 'react';
import { Folder, FileText } from 'lucide-react';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';

type Props = {
  entry: TrashEntryDTO;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  /**
   * Right-click sur la card. Pass-through au parent (TrashEntriesList)
   * qui gère le menu contextuel centralisé. Optionnel pour compat
   * descendante — si absent, le clic droit conserve le menu natif du
   * navigateur.
   */
  onContextMenu?: (e: React.MouseEvent, entry: TrashEntryDTO) => void;
};

/**
 * Card en mode grille pour une TrashEntry.
 *
 * - Carrée (aspect-square) — cohérent avec le finder
 * - Icône Folder ou FileText selon le `kind`
 * - displayName en bas
 * - previousPathShort en tooltip et en petit sous-texte
 * - Sélectionnée → bordure bleue + fond bleu-50
 *
 * Le double-clic sur un folder déclenche le drill-down (géré par le parent).
 * Le right-click déclenche un menu contextuel (géré par le parent via
 * `onContextMenu`).
 */
export default function TrashEntryGrid({
  entry,
  selected,
  onClick,
  onDoubleClick,
  onContextMenu,
}: Props): JSX.Element {
  const isFolder = entry.kind === 'folder';
  const Icon = isFolder ? Folder : FileText;

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={
        onContextMenu
          ? (e) => {
              e.preventDefault();
              onContextMenu(e, entry);
            }
          : undefined
      }
      className={`
        relative aspect-square rounded-lg border bg-white overflow-hidden
        cursor-pointer select-none p-2
        flex flex-col items-center justify-center gap-2
        transition-shadow
        ${selected
          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
          : 'hover:shadow-md hover:border-gray-300'}
      `}
      title={entry.previousPath}
      role="button"
      aria-pressed={selected}
    >
      <Icon
        className={`h-12 w-12 ${isFolder ? 'text-blue-400' : 'text-gray-400'}`}
        strokeWidth={1.5}
      />
      <div className="text-xs text-center truncate w-full px-1" title={entry.displayName}>
        {entry.displayName}
      </div>
      <div className="text-[10px] text-gray-400 truncate w-full text-center px-1">
        {entry.previousPathShort}
      </div>
    </div>
  );
}
