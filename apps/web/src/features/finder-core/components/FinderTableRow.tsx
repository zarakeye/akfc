'use client';

import { JSX } from 'react';
import { Folder, FileText, Image as ImageIcon, FileVideo, FileAudio, FileType } from 'lucide-react';
import type { FinderNode } from '@contracts/finder';
import type { TriState } from '@features/finder-core/utils/triState';
import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import { statusOf } from '@features/finder-core/utils/statusFolders';

type Props = {
  node: FinderNode;
  isSelected: boolean;
  multiSelectActive: boolean;
  triState: TriState;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  onLongPress: () => void;
  onDragStart: (e: React.DragEvent) => void;
};

/**
 * Row pour le mode "tableau" du finder.
 *
 * Mêmes mécaniques d'interaction qu'un `GridItem` :
 *   - clic → sélection (single ou toggle selon mode multi-select)
 *   - long-press → entrée en mode multi-select
 *   - drag → drag-and-drop pour déplacer
 *
 * Affichage : colonnes Nom / Type / Statut / Taille avec icônes.
 */
export default function FinderTableRow({
  node,
  isSelected,
  multiSelectActive,
  onClick,
  onDoubleClick,
  onLongPress,
  onDragStart,
}: Props): JSX.Element {
  const longPress = useLongPress(onLongPress);
  const isFolder = node.type === 'folder';

  return (
    <tr
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable
      onDragStart={onDragStart}
      onMouseDown={longPress.onMouseDown}
      onMouseUp={longPress.onMouseUp}
      onMouseLeave={longPress.onMouseLeave}
      onTouchStart={longPress.onTouchStart}
      onTouchEnd={longPress.onTouchEnd}
      className={`
        cursor-pointer select-none
        ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `}
    >
      {multiSelectActive && (
        <td className="px-2 py-2 w-8">
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className="h-4 w-4"
            aria-label={`Sélectionner ${node.name}`}
          />
        </td>
      )}
      <td className="px-2 py-2 w-8">
        {renderNodeIcon(
          node,
          `h-4 w-4 ${isFolder ? 'text-blue-500' : 'text-gray-500'}`,
        )}
      </td>
      <td className="px-3 py-2 text-sm font-medium text-gray-900">
        <div className="truncate max-w-[260px]" title={node.name}>
          {node.name}
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-gray-500 whitespace-nowrap">
        {isFolder ? 'Dossier' : (node.mimeType || node.meta?.format || 'Fichier')}
      </td>
      <td className="px-3 py-2 text-sm whitespace-nowrap">
        {!isFolder &&
        statusOf(node) === 'pending' ? (
          <span className="rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
            En attente
          </span>
        ) : null}
      </td>
      <td className="px-3 py-2 text-sm text-gray-500 text-right whitespace-nowrap">
        {isFolder ? '—' : formatBytes(node.size)}
      </td>
    </tr>
  );
}

// Rend l'icône d'un node. On retourne un ÉLÉMENT (pas un composant) pour
// éviter `<Icon>` avec une variable dynamique, que
// react-hooks/static-components interdit (il y voit un composant créé pendant
// le render). Les composants lucide utilisés sont statiques (importés), donc
// aucune création dynamique.
function renderNodeIcon(node: FinderNode, className: string): JSX.Element {
  const props = { className, strokeWidth: 1.5 };
  if (node.type === 'folder') return <Folder {...props} />;
  const kind = node.meta?.kind;
  if (kind === 'image') return <ImageIcon {...props} />;
  if (kind === 'video') return <FileVideo {...props} />;
  if (kind === 'document') return <FileText {...props} />;
  if (node.mimeType?.startsWith('audio/')) return <FileAudio {...props} />;
  if (node.mimeType?.startsWith('text/')) return <FileType {...props} />;
  return <FileText {...props} />;
}

function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}