'use client';

import { JSX, useState } from 'react';
import { File } from 'lucide-react';
import clsx from 'clsx';

import type { FinderNode } from '@contracts/finder';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';
import { parentPath } from '@features/finder-core/utils/path';
import ContextMenu, {
  type ContextMenuItem,
} from '@features/finder-core/components/ContextMenu';

/**
 * 📄 Item fichier dans la TreeView.
 *
 * Symétrique à `FinderTreeFolder` mais pour les fichiers : pas de chevron
 * d'expansion (un fichier n'a pas d'enfants), pas de drop-target (un
 * fichier ne peut pas recevoir d'autres items), juste une icône fichier
 * Lucide, le nom cliquable et — depuis ce sous-chantier — drag-source
 * et long-press pour parité avec la GridView.
 *
 * ─── Drag + long-press (parité GridView) ─────────────────────────────────
 *
 * Pourquoi : Stéphane attend de pouvoir manipuler les fichiers depuis la
 * TreeView aussi bien que depuis la GridView. Sans ces handlers, on ne
 * peut ni glisser un fichier vers une autre destination, ni activer le
 * mode multi-select via longpress depuis la sidebar.
 *
 * Les handlers `onDragStart` et `onLongPress` viennent du parent `Finder`
 * (via `FinderTree`) et sont strictement les mêmes que ceux passés à
 * `GridItem` — un node draggé depuis la TreeView se comporte exactement
 * comme draggé depuis la GridView (même payload, même ghost preview).
 *
 * 🎯 Comportement au clic (inchangé)
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
 */
type Props = {
  node: FinderNode;
  /**
   * Callback déclenché au début d'un drag depuis ce fichier. Optionnel —
   * si non fourni, le fichier n'est pas draggable. Fourni par le parent
   * `Finder` via `FinderTree` ; identique à celui passé aux `GridItem`.
   */
  onDragStart?: (e: React.DragEvent, node: FinderNode) => void;
  /**
   * Callback déclenché au long-press (>= 500ms) sur ce fichier.
   * Optionnel pour la même raison. Active le mode multi-select dans le
   * store partagé.
   */
  onLongPress?: (node: FinderNode) => void;
};

export default function FinderTreeFile({
  node,
  onDragStart,
  onLongPress,
}: Props): JSX.Element {
  const setPath = useFinderStore((s) => s.setPath);
  const selectOnly = useFinderStore((s) => s.selectOnly);
  const toggleSelect = useFinderStore((s) => s.toggleSelect);
  const multiSelectActive = useFinderStore((s) => s.multiSelectActive);
  const currentPath = useFinderStore((s) => s.currentPath);
  const selectedIds = useFinderStore((s) => s.selection.roots);

  // Le hook est instancié inconditionnellement (rules of hooks). Si le
  // parent n'a pas fourni `onLongPress`, on no-op silencieusement.
  const longPress = useLongPress(() => {
    if (onLongPress) onLongPress(node);
  });

  // ─── Context menu (right-click) ─────────────────────────────────────────
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { effectiveNodesFor, deleteNodes, deleteLabel } = useNodeActions();

  const isActive =
    currentPath === parentPath(node.path) && selectedIds.has(node.id);

  const isDraggable = Boolean(onDragStart);

  /**
   * Comportement du clic sur un fichier de la TreeView.
   *
   * ─── Mode normal ─────────────────────────────────────────────────────
   * Naviguer dans le dossier parent + sélection unique (cf. la doc en
   * tête de fichier).
   *
   * ─── Mode multi-select ───────────────────────────────────────────────
   * On NE NAVIGUE PAS et on ne reset PAS la sélection — on toggle juste
   * l'appartenance du node à la sélection. Sans ce branchement, le longpress
   * dans la TreeView (qui active multiSelectActive via `onLongPress`) serait
   * immédiatement écrasé par le `mouseup` qui suit : ce dernier déclenche
   * un click → `setPath` → reset multiSelectActive → mode multi sorti
   * instantanément. C'était le bug "longpress sans effet dans la tree view
   * du bin" (et en réalité partout dans la tree view).
   */
  function handleClick() {
    // Avalage du click parasite qui suit un longpress (cf. doc dans
    // useLongPress.ts). Sans ce skip, le node qui vient d'être ajouté à
    // la sélection par le longpress serait toggle-off par ce click.
    if (longPress.consumeJustFired()) return;
    if (multiSelectActive) {
      toggleSelect(node.id);
      return;
    }
    setPath(parentPath(node.path));
    selectOnly(node.id);
  }

  function buildMenuItems(): ContextMenuItem[] {
    const targetNodes = effectiveNodesFor(node);
    return [
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
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuPos({ x: e.clientX, y: e.clientY });
        }}
        onMouseDown={longPress.onMouseDown}
        onMouseUp={longPress.onMouseUp}
        onMouseLeave={longPress.onMouseLeave}
        onTouchStart={longPress.onTouchStart}
        onTouchEnd={longPress.onTouchEnd}
        draggable={isDraggable}
        onDragStart={
          onDragStart
            ? (e) => {
                longPress.onDragStart();
                onDragStart(e, node);
              }
            : undefined
        }
        className={clsx(
          'flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm',
          // Indenté de la même quantité que les sous-dossiers — on aligne
          // visuellement folders et files au même niveau hiérarchique.
          // L'absence de chevron est compensée par un padding gauche
          // équivalent à sa largeur quand on n'est PAS en multi-select.
          // En multi-select, l'espace est récupéré par la checkbox.
          !multiSelectActive && 'pl-[1.625rem]',
          isActive && 'bg-accent text-accent-foreground font-medium',
          !isActive && 'hover:bg-accent/40',
        )}
        title={node.path}
      >
        {/* ─── Checkbox multi-select (parité avec GridItem) ─────────────
            Visible seulement quand `multiSelectActive`. Sans cette
            checkbox, le longpress dans la tree view activait bien le
            mode multi-select dans le store mais l'utilisateur n'avait
            aucun feedback visuel — d'où la perception "ça ne marche pas".
            En `readOnly` parce que le toggle est fait via le `onClick`
            du div parent (handleClick → toggleSelect en mode multi).
        */}
        {multiSelectActive && (
          <input
            type="checkbox"
            checked={selectedIds.has(node.id)}
            readOnly
            className="shrink-0"
          />
        )}
        <File className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />
        <span className="truncate">{node.name}</span>
      </div>

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
