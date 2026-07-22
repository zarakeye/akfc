'use client';

import { JSX, useState } from 'react';
import { Folder, FileText, Image as ImageIcon, FileVideo, FileAudio, FileType } from 'lucide-react';
import type { FinderNode } from '@contracts/finder';
import type { TriState } from '@features/finder-core/utils/triState';
import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import { isStatusFolder } from '@features/finder-core/utils/statusFolders';
import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';
import ContextMenu, {
  type ContextMenuItem,
} from '@features/finder-core/components/ContextMenu';
import { RenameInput } from '@features/finder-core/components/RenameInput';
import { MoveDialog } from '@features/finder-core/components/MoveDialog';
import { displayName, baseNameOf } from '@features/finder-core/utils/fileType';

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
 * Ligne en mode liste compacte pour le finder — densité maximale.
 *
 * Affichage minimal : icône + nom + taille à droite. Une ligne par item,
 * sans bordure intermédiaire (juste un divide-y au parent), pour scanner
 * rapidement beaucoup d'items.
 */
export default function FinderCompactRow({
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

  // Les dossiers de statut n'ont pas d'actions : ni menu, ni renommage, ni
  // déplacement. Même règle que dans la grille (cf. utils/statusFolders.ts).
  const isStatus = isStatusFolder(node.path);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [movingNodes, setMovingNodes] = useState<FinderNode[] | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode, moveNodes } =
    useNodeActions();

  // L'action porte sur la sélection effective quand le node visé en fait
  // partie, sur lui seul sinon — la sémantique du DnD, reprise telle quelle.
  function buildMenuItems(): ContextMenuItem[] {
    const targetNodes = effectiveNodesFor(node);
    return [
      {
        label: 'Renommer',
        onClick: () => {
          setRenameError(null);
          setIsRenaming(true);
        },
      },
      {
        label: 'Déplacer…',
        onClick: () => setMovingNodes(targetNodes),
      },
      {
        label: deleteLabel(targetNodes.length, targetNodes),
        destructive: true,
        onClick: () => {
          void deleteNodes(targetNodes);
        },
      },
    ];
  }

  return (
    <>
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable
      onDragStart={onDragStart}
      onContextMenu={
        isStatus
          ? undefined
          : (e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuPos({ x: e.clientX, y: e.clientY });
            }
      }
      onMouseDown={longPress.onMouseDown}
      onMouseUp={longPress.onMouseUp}
      onMouseLeave={longPress.onMouseLeave}
      onTouchStart={longPress.onTouchStart}
      onTouchEnd={longPress.onTouchEnd}
      className={`
        cursor-pointer select-none
        flex items-center gap-3 px-3 py-1.5
        ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `}
      role="button"
      aria-pressed={isSelected}
    >
      {multiSelectActive && (
        <input
          type="checkbox"
          checked={isSelected}
          readOnly
          className="h-4 w-4 shrink-0"
          aria-label={`Sélectionner ${node.name}`}
        />
      )}
      {renderNodeIcon(
        node,
        `h-4 w-4 shrink-0 ${isFolder ? 'text-blue-500' : 'text-gray-500'}`,
      )}
      {isRenaming ? (
        <span className="min-w-0 flex-1">
          <RenameInput
            initial={baseNameOf(node.name, node.meta?.format)}
            error={renameError}
            onCancel={() => {
              setIsRenaming(false);
              setRenameError(null);
            }}
            onCommit={async (value) => {
              const message = await renameNode(node, value);
              if (message) {
                setRenameError(message);
                return;
              }
              setIsRenaming(false);
              setRenameError(null);
            }}
          />
        </span>
      ) : (
        <span
          className="text-sm font-medium text-gray-900 truncate min-w-0 flex-1"
          title={displayName(node.name, node.meta?.format)}
          onDoubleClick={(e) => {
            // Double-clic sur le NOM : renommer. Ailleurs sur la ligne :
            // ouvrir. Le même partage que dans la grille.
            e.stopPropagation();
            if (!isStatus) {
              setRenameError(null);
              setIsRenaming(true);
            }
          }}
        >
          {displayName(node.name, node.meta?.format)}
        </span>
      )}
      <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
        {isFolder ? '—' : formatBytes(node.size)}
      </span>
    </div>

    {movingNodes && (
      <MoveDialog
        title={
          movingNodes.length === 1
            ? `Déplacer « ${displayName(
                movingNodes[0].name,
                movingNodes[0].meta?.format,
              )} »`
            : `Déplacer ${movingNodes.length} éléments`
        }
        onClose={() => setMovingNodes(null)}
        onConfirm={async (destination) => {
          const message = await moveNodes(movingNodes, destination);
          if (message) throw new Error(message);
          setMovingNodes(null);
        }}
      />
    )}

    {menuPos && (
      <ContextMenu
        x={menuPos.x}
        y={menuPos.y}
        items={buildMenuItems()}
        onClose={() => setMenuPos(null)}
      />
    )}
    </>
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