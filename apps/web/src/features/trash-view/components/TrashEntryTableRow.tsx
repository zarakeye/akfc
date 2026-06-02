'use client';

import { JSX } from 'react';
import { Folder, FileText } from 'lucide-react';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';

type Props = {
  entry: TrashEntryDTO;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  /** Right-click — pass-through au parent (TrashEntriesList). */
  onContextMenu?: (e: React.MouseEvent, entry: TrashEntryDTO) => void;
};

/**
 * Row en mode tableau. Affiche : checkbox, icône, nom, chemin d'origine,
 * date de mise en corbeille, taille.
 *
 * La rangée entière est cliquable pour la sélection (toggle), le double-clic
 * sur un folder déclenche le drill-down.
 */
export default function TrashEntryTableRow({
  entry,
  selected,
  onClick,
  onDoubleClick,
  onContextMenu,
}: Props): JSX.Element {
  const isFolder = entry.kind === 'folder';
  const Icon = isFolder ? Folder : FileText;

  return (
    <tr
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
        cursor-pointer
        ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `}
    >
      <td className="px-3 py-2 w-8">
        <input
          type="checkbox"
          checked={selected}
          onChange={onClick}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4"
          aria-label={`Sélectionner ${entry.displayName}`}
        />
      </td>
      <td className="px-3 py-2 w-8">
        <Icon
          className={`h-4 w-4 ${isFolder ? 'text-blue-500' : 'text-gray-500'}`}
          strokeWidth={1.5}
        />
      </td>
      <td className="px-3 py-2 text-sm font-medium text-gray-900">
        <div className="truncate max-w-[200px]" title={entry.displayName}>
          {entry.displayName}
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-gray-500">
        <div className="truncate max-w-[300px]" title={entry.previousPath}>
          {entry.previousPathShort}
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-gray-500 whitespace-nowrap">
        {formatDate(entry.trashedAt)}
      </td>
      <td className="px-3 py-2 text-sm text-gray-500 text-right whitespace-nowrap">
        {entry.sizeBytes !== undefined ? formatBytes(entry.sizeBytes) : '—'}
      </td>
    </tr>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
