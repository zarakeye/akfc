'use client';

import { JSX } from 'react';
import { Folder, FileText } from 'lucide-react';
import type { TrashEntryDTO } from '@akfc/contracts/trash/trash.dto.ts';
import { trashTooltip } from '#features/trash-view/lib/trashDates.ts';

type Props = {
  entry: TrashEntryDTO;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  /** Right-click — pass-through au parent (TrashEntriesList). */
  onContextMenu?: (e: React.MouseEvent, entry: TrashEntryDTO) => void;
};

/**
 * Row en mode liste compacte — pour scanner rapidement beaucoup d'entrées.
 *
 * Affichage minimal : icône + nom + previousPathShort + date à droite.
 * Plus dense que le mode tableau (pas de checkbox explicite ni padding large).
 */
export default function TrashEntryCompactRow({
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
        cursor-pointer select-none
        flex items-center gap-3 px-3 py-1.5
        border-b border-border last:border-b-0
        ${selected ? 'bg-info-muted' : 'hover:bg-muted'}
      `}
      role="button"
      aria-pressed={selected}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${isFolder ? 'text-info' : 'text-muted-foreground'}`}
        strokeWidth={1.5}
      />
      <span className="text-sm font-medium text-foreground truncate min-w-0 max-w-[40%]" title={entry.displayName}>
        {entry.displayName}
      </span>
      <span className="text-xs text-muted-foreground truncate flex-1 min-w-0" title={trashTooltip(entry)}>
        {entry.previousPathShort}
      </span>
      <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
        {formatRelativeDate(entry.trashedAt)}
      </span>
    </div>
  );
}

function formatRelativeDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
}
