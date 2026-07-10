'use client';

import { JSX } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

import type { FinderNode } from '@contracts/finder';

/**
 * PickerCart
 *
 * Bandeau du panier de sélection média — RENDU WEB du panier. La logique
 * (contenu, ajout/retrait) vit dans `@workspace/finder-core/cart` ; ce
 * composant ne fait qu'AFFICHER les nodes qu'on lui passe et émettre des
 * intentions de retrait. C'est volontaire : le mobile (Expo) aura son propre
 * rendu de panier, branché sur le même store.
 *
 * ─── Responsive / tactile ───────────────────────────────────────────────────
 *
 * - Vignettes en rangée horizontale scrollable (la sélection peut être longue).
 * - La croix de retrait est TOUJOURS visible (pas au hover) et dimensionnée
 *   pour le doigt — sur tactile il n'y a pas de survol, une action masquée
 *   serait inatteignable.
 * - Pensé pour devenir une barre fixe en bas sur mobile (enrichissement
 *   ultérieur) : il est déjà isolé, donc on pourra lui donner un layout
 *   distinct sans toucher au reste du picker.
 */

type Props = {
  /** Médias actuellement dans le panier, dans l'ordre d'insertion. */
  nodes: FinderNode[];
  /** Retire un média du panier par son path. */
  onRemove: (path: string) => void;
  /** Vide entièrement le panier. */
  onClear: () => void;
};

/**
 * Dérive une URL de vignette pour la mini-card du panier. Image → l'URL
 * directe ; vidéo Cloudinary → thumbnail JPG (so_auto). Sinon `null` →
 * on affiche une pastille générique.
 */
function thumbUrlFor(node: FinderNode): string | null {
  const kind = node.meta?.kind;
  const url = node.meta?.url;
  if (!url) return null;
  if (kind === 'image') return url;
  if (kind === 'video' && url.includes('/video/upload/')) {
    const withSoAuto = url.includes('/upload/so_auto/')
      ? url
      : url.replace('/upload/', '/upload/so_auto/');
    return withSoAuto.replace(/\.(mp4|webm|mov|avi|mkv|m4v|ogv|flv|wmv)$/i, '.jpg');
  }
  return null;
}

export function PickerCart({ nodes, onRemove, onClear }: Props): JSX.Element | null {
  if (nodes.length === 0) return null;

  return (
    <div className="border-t bg-gray-50">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-medium text-gray-600">
          Sélection ({nodes.length})
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
        >
          Tout retirer
        </button>
      </div>

      {/* Rangée scrollable de vignettes. scrollbar-hidden est défini dans
          globals.css (réutilisé d'ailleurs). */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hidden">
        {nodes.map((node) => {
          const thumb = thumbUrlFor(node);
          return (
            <div
              key={node.path}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white"
              title={node.name}
            >
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt={node.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">
                  {node.meta?.kind === 'video' ? '🎬' : '📄'}
                </div>
              )}

              {/* Croix de retrait — toujours visible, cible tactile généreuse. */}
              <button
                type="button"
                onClick={() => onRemove(node.path)}
                aria-label={`Retirer ${node.name} de la sélection`}
                className={clsx(
                  'absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center',
                  'rounded-full bg-black/60 text-white',
                  'hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                )}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}