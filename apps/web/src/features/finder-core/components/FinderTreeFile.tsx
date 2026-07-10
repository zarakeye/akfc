'use client';

import { JSX, useState } from 'react';
import { File, Check } from 'lucide-react';
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
 * ─── Mode picker (panier) ─────────────────────────────────────────────────
 *
 * En `pickMode`, un clic sur le fichier l'épingle/retire du panier
 * (`onPickToggle`) au lieu de naviguer/sélectionner. L'appartenance au panier
 * est signalée par une coche verte, TOUJOURS visible (tactile-friendly).
 * C'est la SECONDE surface de pick, branchée sur le MÊME store que la grille
 * (`usePickerCartStore` via MediaPicker) — la synchro grille↔arbre est donc
 * automatique : cocher ici met à jour le store, la grille se re-render, et
 * inversement.
 *
 * ─── Drag + long-press (parité GridView) ─────────────────────────────────
 *
 * Les handlers `onDragStart` et `onLongPress` viennent du parent `Finder`
 * (via `FinderTree`) et sont strictement les mêmes que ceux passés à
 * `GridItem`.
 *
 * 🎯 Comportement au clic (mode normal, inchangé)
 *
 * Naviguer dans le dossier parent du fichier ET sélectionner le fichier.
 *
 * ⚠️ Ordre des opérations
 *
 * `setPath` reset la sélection ET désactive `multiSelectActive`. Donc on
 * appelle d'abord `setPath(parent)`, puis `selectOnly(file.id)`.
 */
type Props = {
  node: FinderNode;
  /**
   * Callback déclenché au début d'un drag depuis ce fichier. Optionnel —
   * si non fourni, le fichier n'est pas draggable.
   */
  onDragStart?: (e: React.DragEvent, node: FinderNode) => void;
  /**
   * Callback déclenché au long-press (>= 500ms) sur ce fichier. Optionnel.
   */
  onLongPress?: (node: FinderNode) => void;
  /**
   * Mode picker actif : le clic épingle/retire le fichier du panier au lieu
   * de naviguer. Optionnel — absent ⇒ comportement bibliothèque inchangé.
   */
  pickMode?: boolean;
  /** En pickMode : ce path est-il dans le panier ? Pilote la coche. */
  isInCart?: (path: string) => boolean;
  /** En pickMode : épingle/retire le fichier (délégué au store panier). */
  onPickToggle?: (node: FinderNode) => void;
};

export default function FinderTreeFile({
  node,
  onDragStart,
  onLongPress,
  pickMode = false,
  isInCart,
  onPickToggle,
}: Props): JSX.Element {
  const setPath = useFinderStore((s) => s.setPath);
  const selectOnly = useFinderStore((s) => s.selectOnly);
  const toggleSelect = useFinderStore((s) => s.toggleSelect);
  const multiSelectActive = useFinderStore((s) => s.multiSelectActive);
  const currentPath = useFinderStore((s) => s.currentPath);
  const selectedIds = useFinderStore((s) => s.selection.roots);

  const longPress = useLongPress(() => {
    if (onLongPress) onLongPress(node);
  });

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { effectiveNodesFor, deleteNodes, deleteLabel } = useNodeActions();

  const isActive =
    currentPath === parentPath(node.path) && selectedIds.has(node.id);

  const isDraggable = Boolean(onDragStart);

  // En pickMode, ce fichier est-il dans le panier ? (coche verte)
  const pinned = pickMode && Boolean(isInCart?.(node.path));

  /**
   * Comportement du clic sur un fichier de la TreeView.
   *
   * ─── Mode picker (panier) ────────────────────────────────────────────
   * Le clic épingle/retire le fichier du panier. On court-circuite la
   * navigation/sélection : le panier est la seule cible du clic.
   *
   * ─── Mode normal ─────────────────────────────────────────────────────
   * Naviguer dans le dossier parent + sélection unique.
   *
   * ─── Mode multi-select ───────────────────────────────────────────────
   * On NE NAVIGUE PAS et on ne reset PAS la sélection — on toggle juste
   * l'appartenance du node à la sélection.
   */
  function handleClick() {
    // Avalage du click parasite qui suit un longpress.
    if (longPress.consumeJustFired()) return;

    // Mode picker : le clic alimente le panier, rien d'autre.
    if (pickMode) {
      onPickToggle?.(node);
      return;
    }

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
                // DnD imbriqué : sans stopPropagation, saisir un enfant
                // fait remonter l'événement au premier ancêtre draggable
                // (la ligne du dossier parent) → mauvaise source résolue
                // (bug « cours/cours », 2026-07-03).
                e.stopPropagation();
                longPress.onDragStart();
                onDragStart(e, node);
              }
            : undefined
        }
        className={clsx(
          'flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm',
          // Indentation : alignée sur les sous-dossiers. En multi-select OU
          // en pickMode, l'espace gauche est occupé par la checkbox / coche.
          !multiSelectActive && !pickMode && 'pl-[1.625rem]',
          pinned && 'bg-emerald-50',
          isActive && !pinned && 'bg-accent text-accent-foreground font-medium',
          !isActive && !pinned && 'hover:bg-accent/40',
        )}
        title={node.path}
      >
        {/* ─── Coche panier (pickMode) ─────────────────────────────────────
            Toujours présente en pickMode (pour aligner l'indentation) ;
            remplie en vert si le fichier est dans le panier. Tactile-friendly :
            visible en permanence, pas au hover. */}
        {pickMode && (
          <span
            className={clsx(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
              pinned ? 'bg-emerald-500 text-white' : 'border border-gray-300',
            )}
            aria-hidden
          >
            {pinned && <Check className="h-3 w-3" />}
          </span>
        )}

        {/* Checkbox multi-select (masquée en pickMode) */}
        {multiSelectActive && !pickMode && (
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
