'use client';

import { useFinderReadOnly } from "#features/finder-core/state/FinderReadOnlyContext.ts";
import { JSX, useState } from 'react';
import { Folder, FileText, Image as ImageIcon, FileVideo, FileAudio, FileType } from 'lucide-react';
import type { FinderNode } from '@akfc/contracts/finder/index.ts';
import type { TriState } from '#features/finder-core/utils/triState.ts';
import { useLongPress } from '#features/finder-core/hooks/useLongPress.ts';
import { isStatusFolder } from '#features/finder-core/utils/statusFolders.ts';
import { useNodeActions } from '#features/finder-core/hooks/useNodeActions.ts';
import ContextMenu, {
  type ContextMenuItem,
} from '#features/finder-core/components/ContextMenu.tsx';
import { RenameInput } from '#features/finder-core/components/RenameInput.tsx';
import { MoveDialog } from '#features/finder-core/components/MoveDialog.tsx';
import { isProtectedEntityFolder } from '#features/finder-core/utils/spaceFolderKind.ts';
import { PublishToMembersDialog } from '#features/member-documents/PublishToMembersDialog.tsx';
import { useSessionStore } from '#lib/stores/useSessionStore.ts';
import { displayName, baseNameOf } from '#features/finder-core/utils/fileType.ts';
import { useFinderStore } from "#features/finder-core/state/useFinderStore.ts";
import { useFolderDropTarget } from '#features/finder-core/hooks/useFolderDropTarget.ts';

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
  // Lecture seule (« Mes espaces ») : ni menu contextuel, ni glisser.
  const readOnly = useFinderReadOnly();
  const longPress = useLongPress(onLongPress);
  const isFolder = node.type === 'folder';
  // Un dossier de la grille reçoit les dépôts, comme dans l'arbre.
  const { isDragOver, handlers: dropHandlers } = useFolderDropTarget(node.path, {
    enabled: isFolder && !readOnly,
  });

  // Les dossiers de statut n'ont pas d'actions : ni menu, ni renommage, ni
  // déplacement. Même règle que dans la grille (cf. utils/statusFolders.ts).
  const isStatus = isStatusFolder(node.path);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [movingNodes, setMovingNodes] = useState<FinderNode[] | null>(null);
  const [publishTarget, setPublishTarget] = useState<FinderNode | null>(null);
  const isAdmin = useSessionStore((st) => (st.session?.user?.isAdmin ?? false));
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { effectiveNodesFor, deleteLabel, renameNode, moveNodes } =
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
      ...(targetNodes.some(
        (n) => n.type === "folder" && isProtectedEntityFolder(n.path),
      )
        ? []
        : [
            {
              label: 'Déplacer…',
              onClick: () => setMovingNodes(targetNodes),
            } as ContextMenuItem,
          ]),
      ...(isAdmin && !isFolder && !isStatus
        ? [
            {
              label: 'Rendre disponible aux membres',
              onClick: () => setPublishTarget(node),
            } as ContextMenuItem,
          ]
        : []),
      {
        label: deleteLabel(targetNodes.length, targetNodes),
        destructive: true,
        onClick: () => {
          useFinderStore.getState().askDelete(targetNodes);
        },
      },
    ];
  }

  return (
    <>
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={!readOnly}
      onDragStart={onDragStart}
      {...dropHandlers}
      data-finder-drop-path={isFolder ? node.path : undefined}
      onContextMenu={
        isStatus || readOnly
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
        ${isDragOver ? 'bg-info-muted ring-1 ring-ring' : isSelected ? 'bg-info-muted' : 'hover:bg-muted'}
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
        `h-4 w-4 shrink-0 ${isFolder ? 'text-muted-foreground' : 'text-muted-foreground'}`,
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
          className="text-sm font-medium text-foreground truncate min-w-0 flex-1"
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
      <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
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

    {publishTarget && (
      <PublishToMembersDialog
        path={publishTarget.path}
        defaultTitle={publishTarget.name}
        onClose={() => setPublishTarget(null)}
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