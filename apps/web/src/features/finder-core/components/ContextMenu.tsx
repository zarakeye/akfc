'use client';

import { JSX, useEffect, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';

/**
 * Item de menu contextuel.
 *
 * 3 types via union discriminée :
 *
 *  - `item` (défaut) : item cliquable normal.
 *      `onClick` requis. `checked` affiche un ✓ à gauche (radio-like).
 *      `destructive` rouge, `disabled` grisé.
 *  - `separator` : ligne fine de séparation entre groupes d'items.
 *  - `header` : libellé de section (gris, non cliquable, plus petit).
 *      Utilisé pour structurer un menu plat en sections logiques
 *      ("Trier par", "Ordre", etc.).
 */
export type ContextMenuItem =
  | {
      type?: 'item';
      label: string;
      onClick: () => void;
      destructive?: boolean;
      disabled?: boolean;
      /** Affiche un ✓ à gauche du label. Utile pour les groupes radio-like. */
      checked?: boolean;
    }
  | { type: 'separator' }
  | { type: 'header'; label: string };

type Props = {
  /** Position du clic en coordonnées viewport (event.clientX/Y) */
  x: number;
  y: number;
  items: ContextMenuItem[];
  /** Callback appelé pour fermer le menu (click outside, Escape, ou après onClick d'un item) */
  onClose: () => void;
};

/**
 * Menu contextuel flottant générique.
 *
 * 🎯 Pattern d'utilisation
 *
 * Le composant parent maintient un state `menuPos: { x, y } | null`, monte
 * conditionnellement ce composant quand `menuPos` est non-null, et passe
 * `onClose={() => setMenuPos(null)}`.
 *
 * ```tsx
 * const [menuPos, setMenuPos] = useState<{x:number;y:number}|null>(null);
 * <div onContextMenu={(e) => { e.preventDefault(); setMenuPos({x: e.clientX, y: e.clientY}); }}>
 *   ...
 * </div>
 * {menuPos && <ContextMenu x={menuPos.x} y={menuPos.y} items={[...]} onClose={() => setMenuPos(null)} />}
 * ```
 *
 * 🪟 Fermeture
 *
 * Trois moyens de fermer le menu :
 *   1. Clic sur un item (onClick exécuté puis onClose)
 *   2. Clic en dehors du menu (mousedown global)
 *   3. Touche Escape (keydown global)
 *
 * 📐 Positionnement
 *
 * `position: fixed` aux coordonnées viewport. Après le premier rendu, on
 * mesure la taille du menu et on ajuste si nécessaire pour ne pas déborder
 * du viewport (utile près du bord droit/bas de l'écran).
 */
export default function ContextMenu({
  x,
  y,
  items,
  onClose,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ x, y });

  // ─── Ajustement de la position pour ne pas déborder du viewport ─────────
  //
  // useLayoutEffect plutôt que useEffect pour que l'ajustement se fasse
  // AVANT que le navigateur peigne le premier rendu — évite le flash.
  useLayoutEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const padding = 8;
    let newX = x;
    let newY = y;

    // Déborde à droite ? On colle à droite moins la largeur.
    if (rect.right > window.innerWidth - padding) {
      newX = Math.max(padding, window.innerWidth - rect.width - padding);
    }
    // Déborde en bas ? On colle en bas moins la hauteur.
    if (rect.bottom > window.innerHeight - padding) {
      newY = Math.max(padding, window.innerHeight - rect.height - padding);
    }

    if (newX !== x || newY !== y) {
      setAdjustedPos({ x: newX, y: newY });
    }
  }, [x, y]);

  // Marqueur lu par le listener Échap du finder : tant qu'une surface est
  // empilée, Échap lui appartient. Le DOM sert d'arbitre parce qu'il ne
  // dépend pas de l'ordre de montage des listeners.
  // ─── Click outside + Escape ──────────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    // mousedown plutôt que click pour fermer le menu AVANT que le click
    // ne déclenche d'autres handlers (sélection, ouverture, etc.).
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      data-finder-overlay
      style={{
        position: 'fixed',
        top: adjustedPos.y,
        left: adjustedPos.x,
        zIndex: 1000,
      }}
      className="bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[200px]"
      // Empêche le mousedown DANS le menu de remonter à l'écouteur global
      // qui fermerait le menu avant que le onClick de l'item ne soit lu.
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item, idx) => {
        if (item.type === 'separator') {
          return (
            <div
              key={idx}
              className="my-1 border-t border-gray-200"
              role="separator"
            />
          );
        }

        if (item.type === 'header') {
          return (
            <div
              key={idx}
              className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              {item.label}
            </div>
          );
        }

        // item normal (type undefined ou 'item')
        return (
          <button
            key={idx}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              item.onClick();
              onClose();
            }}
            className={clsx(
              'w-full text-left px-3 py-1.5 text-sm transition-colors',
              'flex items-center gap-2',
              item.disabled && 'text-gray-400 cursor-not-allowed',
              !item.disabled && !item.destructive && 'text-gray-700 hover:bg-gray-100',
              !item.disabled && item.destructive && 'text-red-600 hover:bg-red-50',
            )}
          >
            {/* Slot pour le ✓ — toujours rendu pour aligner les labels même
                quand pas coché. Plus propre que d'aligner via padding. */}
            <span className="inline-block w-3 shrink-0 text-blue-600">
              {item.checked ? '✓' : ''}
            </span>
            <span className="flex-1 truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
