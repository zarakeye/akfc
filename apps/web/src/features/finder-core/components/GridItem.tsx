'use client';

import { JSX, useState } from 'react';
import { Folder } from 'lucide-react';
import clsx from 'clsx';

import type { FinderNode } from '@contracts/finder';

import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import type { TriState } from '@features/finder-core/utils/triState';

/* -------------------------------------------------------------------------- */
/*                                  GRID ITEM                                 */
/* -------------------------------------------------------------------------- */

/**
 * Item de la grille — rend une **card carrée visuelle** unique pour un
 * dossier ou un fichier.
 *
 * 🎨 Choix visuels :
 *
 * - **Card carrée** (`aspect-square`) plutôt que liste linéaire : rend la
 *   grille parcourable d'un coup d'œil, fidèle à l'esprit du legacy
 *   de l'ancienne implémentation Cloudinary-specific (depuis supprimée).
 *
 * - **Image réelle pour les fichiers image** (object-cover sur la card
 *   entière) — c'est ce qu'attend l'utilisateur final dans un finder de
 *   médias. Pour les fichiers non-image, on affiche une icône typée
 *   (vidéo / audio / document) centrée.
 *
 * - **Nom en overlay-bas semi-transparent** quand il y a une vignette
 *   image (sinon il masquerait le contenu visuel) ; nom en bloc classique
 *   pour folders et fichiers non-image.
 *
 * - **Sélection** matérialisée par un `ring` bleu plutôt qu'un fond
 *   coloré — plus lisible quand le contenu de la card est lui-même
 *   coloré (cas d'une vignette).
 *
 * - **Checkbox visible uniquement en mode multi-select** (cohérent avec
 *   la décision 4.2). Posée en overlay en haut-gauche avec fond
 *   semi-transparent pour rester lisible sur n'importe quelle vignette.
 *
 * 🪝 Un sous-composant par item est nécessaire pour que `useLongPress`
 * soit appelé une fois par instance (rules of hooks).
 */
type GridItemProps = {
  node: FinderNode;
  isSelected: boolean;
  multiSelectActive: boolean;
  triState: TriState;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  onLongPress: () => void;
  onDragStart: (e: React.DragEvent) => void;
};

export default function GridItem({
  node,
  isSelected,
  multiSelectActive,
  triState,
  onClick,
  onDoubleClick,
  onLongPress,
  onDragStart,
}: GridItemProps): JSX.Element {
  const longPress = useLongPress(onLongPress);

  // État local pour détecter si la vignette image a échoué à charger.
  // Si oui, on fallback sur l'icône typée — meilleur que de laisser le
  // placeholder broken-image natif du navigateur.
  const [imgFailed, setImgFailed] = useState(false);

  const isFolder = node.type === 'folder';
  const kind = node.meta?.kind;
  const url = node.meta?.url;
  const hasImageThumb = !isFolder && kind === 'image' && url && !imgFailed;

  return (
    <div
      draggable
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      onDoubleClick={onDoubleClick}
      onMouseDown={longPress.onMouseDown}
      onMouseUp={longPress.onMouseUp}
      onMouseLeave={longPress.onMouseLeave}
      onTouchStart={longPress.onTouchStart}
      onTouchEnd={longPress.onTouchEnd}
      onDragStart={(e) => {
        longPress.onDragStart();
        onDragStart(e);
      }}
      className={clsx(
        'relative aspect-square rounded-lg border bg-white overflow-hidden cursor-pointer select-none',
        'transition-shadow hover:shadow-md',
        isSelected ? 'ring-2 ring-blue-400 border-blue-300' : 'border-gray-200',
      )}
      title={node.name}
    >
      {/* ----------------------------- CONTENU ----------------------------- */}
      {hasImageThumb ? (
        <img
          src={url}
          alt={node.name}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <CardIcon node={node} />
      )}

      {/* ------------------------------ NOM ------------------------------- */}
      {/* En overlay-bas si vignette image (pour ne pas masquer le visuel),
          en bloc classique sinon. */}
      <div
        className={clsx(
          'absolute bottom-0 left-0 right-0 px-2 py-1.5 text-xs truncate',
          hasImageThumb
            ? 'bg-gradient-to-t from-black/70 to-black/0 text-white'
            : 'bg-white border-t border-gray-100 text-gray-700',
        )}
      >
        {node.name}
      </div>

      {/* ---------------------------- CHECKBOX ---------------------------- */}
      {/* Visible uniquement en mode multi-select. Posée en overlay
          en haut-gauche, fond semi-transparent pour rester lisible
          sur n'importe quelle vignette. */}
      {multiSelectActive && (
        <div className="absolute top-1.5 left-1.5 bg-white/80 backdrop-blur-sm rounded p-0.5">
          <input
            type="checkbox"
            checked={triState === 'checked'}
            ref={(el) => {
              if (el) el.indeterminate = triState === 'indeterminate';
            }}
            readOnly
            className="block"
          />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                CARD ICON                                   */
/* -------------------------------------------------------------------------- */

/**
 * Affiche l'icône centrale d'une card sans vignette image.
 *
 * Pour les dossiers : icône Lucide `Folder` (cohérent avec la TreeView
 * qui utilise déjà Lucide). Pour les fichiers : emoji typé selon
 * `meta.kind` (vidéo / audio implicite / document). Les emojis sont
 * lisibles, accessibles, et n'ajoutent pas de dépendance.
 */
function CardIcon({ node }: { node: FinderNode }): JSX.Element {
  if (node.type === 'folder') {
    return (
      <div className="w-full h-full flex items-center justify-center pb-6 text-blue-400">
        <Folder className="w-16 h-16" strokeWidth={1.5} />
      </div>
    );
  }

  const kind = node.meta?.kind;
  const emoji = kind === 'video' ? '🎬' : '📄';

  return (
    <div className="w-full h-full flex items-center justify-center pb-6 text-5xl">
      {emoji}
    </div>
  );
}
