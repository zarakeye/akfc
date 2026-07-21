'use client';

import { JSX, useState } from 'react';
import { Folder, Music, Check, FileText } from 'lucide-react';
import clsx from 'clsx';

import type { FinderNode } from '@contracts/finder';

import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import { statusOf } from '@features/finder-core/utils/statusFolders';
import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';
import ContextMenu, {
  type ContextMenuItem,
} from '@features/finder-core/components/ContextMenu';
import { isStatusFolder } from '@features/finder-core/utils/statusFolders';
import type { TriState } from '@features/finder-core/utils/triState';
import { getFileExtension, isAudioFile, isPdfFile, getCloudinaryVideoThumbnail, isTextFile } from '@features/finder-core/utils/fileType';
import { useNodeTextContent } from '@features/finder-core/hooks/useNodeTextContent';

/* -------------------------------------------------------------------------- */
/*                              FORMAT HELPERS                                */
/* -------------------------------------------------------------------------- */

/**
 * Extensions reconnues comme "audio" pour affiner l'affichage GridItem.
 *
 * Le contrat `FinderNodeMeta.kind` ne distingue pas audio de document
 * (les deux sont 'document'). Pour afficher une icône note de musique
 * sur les fichiers audio, on fait la détection ici via l'extension du
 * nom de fichier — c'est l'information dont on dispose toujours en UI.
 *
 * Doit rester aligné avec `AUDIO_FORMATS` dans PreviewPanel.tsx et la
 * liste ACCEPTED_MIME_TYPES côté DragNDropForm.
 */




/**
 * Transforme une URL Cloudinary de vidéo en URL de thumbnail JPG.
 *
 * Pattern Cloudinary :
 *   - URL vidéo :     https://res.cloudinary.com/<cloud>/video/upload/v123/path/foo.mp4
 *   - URL thumbnail : https://res.cloudinary.com/<cloud>/video/upload/so_auto/v123/path/foo.jpg
 *
 * Le transformation `so_auto` (start_offset auto) demande à Cloudinary de
 * sélectionner le frame le plus représentatif de la vidéo (algorithme
 * "auto" qui évite les frames noirs en début/fin). Cloudinary calcule
 * cette thumbnail à la volée et la cache sur son CDN.
 *
 * Retourne `null` si l'URL n'est pas une URL Cloudinary vidéo
 * reconnaissable — dans ce cas, le caller fallback sur l'emoji vidéo.
 */

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
 *   grille parcourable d'un coup d'œil.
 *
 * - **Vignette réelle** pour les images (object-cover sur la card entière)
 *   et pour les vidéos Cloudinary (thumbnail générée via transformation).
 *   Au hover sur une vidéo, on monte un <video> par-dessus la thumbnail
 *   qui lit la vidéo muted+loop pour preview.
 *
 * - **Icône Music** pour les fichiers audio (détection via extension),
 *   emoji 📄 pour les autres documents non-affichables.
 *
 * - **Badge type en haut à droite** : affiche l'extension du fichier
 *   (MP4, PDF, MD…). Style adapté selon que la card a une vignette ou non.
 *
 * - **Nom en overlay-bas semi-transparent** quand vignette image/vidéo,
 *   en bloc classique sinon.
 *
 * - **Sélection** : `ring` bleu (plus lisible sur vignette colorée).
 *
 * - **Checkbox visible uniquement en mode multi-select**, en overlay
 *   haut-gauche (fond semi-transparent pour rester lisible).
 *
 * ─── Mode picker (panier) ───────────────────────────────────────────────────
 *
 * Quand `pickMode` est actif (picker média), un clic sur un FICHIER pickable
 * appelle `onPickToggle(node)` au lieu de la sélection/preview habituelle (la
 * navigation des dossiers reste au simple clic). L'appartenance au panier est
 * signalée par un overlay vert avec coche (`isInCart`), TOUJOURS visible (pas
 * au hover) pour rester utilisable au tactile. Ces props sont optionnelles :
 * absentes, le GridItem se comporte comme dans la bibliothèque (inchangé).
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
  /**
   * Mode picker actif : le clic sur un fichier pickable épingle au panier
   * (via le handler de clic du parent) plutôt que de sélectionner. Optionnel.
   */
  pickMode?: boolean;
  /**
   * Ce node est-il dans le panier ? Pilote l'overlay « épinglé ». Optionnel
   * (défaut : false). N'a d'effet visuel qu'en `pickMode`.
   */
  isInCart?: boolean;
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
  pickMode = false,
  isInCart = false,
}: GridItemProps): JSX.Element {
  // Détection : ce node est-il un dossier de statut (pending/published/bin) ?
  // Si oui, il est exclu du DnD, du longpress, de la checkbox et du menu
  // contextuel — cf. doc dans utils/statusFolders.ts.
  const isStatus = isStatusFolder(node.path);

  // Wrapper du callback longpress pour no-op silencieusement sur les
  // status folders. Le hook est instancié inconditionnellement (rules of hooks).
  const longPress = useLongPress(() => {
    if (isStatus) return;
    onLongPress();
  });

  // État local pour détecter si la vignette image/thumbnail a échoué.
  // Fallback sur l'icône typée plutôt que le placeholder broken-image natif.
  const [imgFailed, setImgFailed] = useState(false);

  // État de hover pour activer le preview vidéo au survol.
  // Le <video> n'est monté qu'au hover pour économiser bande passante :
  // chaque <video> mounté télécharge ses premiers KB pour préparer la
  // lecture. À 50 items dans la grille, ça représenterait plusieurs MB
  // de transfert inutile au mount.
  const [isHovering, setIsHovering] = useState(false);

  // ─── Context menu (right-click) ─────────────────────────────────────────
  //
  // Position du menu en coords viewport, ou null si menu fermé. La
  // sémantique de l'action varie selon le contexte :
  //   - Hors bin : "Mettre à la corbeille" (trashToBin)
  //   - Dans bin : "Supprimer définitivement" (deleteForever)
  //   - Si multi-select actif et le node est sélectionné : action sur
  //     TOUTE la sélection (cohérent avec le DnD multi)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { effectiveNodesFor, deleteNodes, deleteLabel } = useNodeActions();

  const isFolder = node.type === 'folder';
  const kind = node.meta?.kind;
  const url = node.meta?.url;

  // Statut depuis la métadonnée (cf. MediaMeta.status) ; fallback sur le
  // chemin pour les fichiers sans row MediaAsset. Seul `pending` est badgé :
  // l'absence de badge signifie « publié ».
  const isPending =
    !isFolder && statusOf(node) === 'pending';

  // L'extension affichée comme badge et utilisée pour les heuristiques
  // (détection audio…) peut venir de deux endroits :
  //   - `node.meta.format` : présent quand le backend a stocké le format
  //     séparément (cas Cloudinary, qui n'inclut pas l'extension dans le
  //     publicId/name).
  //   - L'extension du `node.name` : présent pour R2 où le nom contient
  //     le fichier complet (ex: "foo.md", "bar.mp3").
  //
  // Ordre de préférence : `format` d'abord (plus fiable), `name` ensuite.
  // Sans cela, les fichiers Cloudinary récents (sans ext dans name)
  // n'auraient ni badge ni détection audio.
  const extension = !isFolder
    ? (node.meta?.format?.toLowerCase() ?? getFileExtension(node.name))
    : null;
  const isAudio = isAudioFile(extension);

  // Vignette image : kind explicite + url + pas d'erreur de chargement
  const hasImageThumb = !isFolder && kind === 'image' && url && !imgFailed;

  // Vignette vidéo : kind explicite + url Cloudinary transformable
  const videoThumbnailUrl =
    !isFolder && kind === 'video' && url ? getCloudinaryVideoThumbnail(url) : null;
  const hasVideoThumb = Boolean(videoThumbnailUrl) && !imgFailed;

  // "Visual thumb" générique pour ajuster le style du nom et du badge.
  const hasVisualThumb = hasImageThumb || hasVideoThumb;

  // En mode picker, un fichier épinglé reçoit un anneau vert (distinct du
  // bleu de sélection) pour que l'état « dans le panier » soit lisible.
  const pinned = pickMode && isInCart;

  // Construit les items du menu contextuel pour ce node.
  // L'action `Supprimer` agit soit sur le node seul, soit sur toute la
  // sélection si on est en multi-select avec ce node dedans.
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
        draggable={!isStatus}
        onClick={(e) => {
          // Avale le click parasite qui suit immédiatement un longpress
          // (cf. doc dans useLongPress.ts). Sans ce skip, le toggle dans
          // le handler `onClick` du parent défait la sélection que le
          // longpress vient juste d'ajouter.
          if (longPress.consumeJustFired()) return;
          e.stopPropagation();
          onClick(e);
        }}
        onDoubleClick={onDoubleClick}
        onContextMenu={
          isStatus
            ? undefined
            : (e) => {
                // Bloque le menu contextuel natif ; affiche le nôtre.
                // Désactivé pour les status folders (pending/published/bin) :
                // ils n'ont pas d'action "Supprimer" / "Mettre à la corbeille"
                // donc le menu serait vide.
                e.preventDefault();
                e.stopPropagation();
                setMenuPos({ x: e.clientX, y: e.clientY });
              }
        }
        onMouseDown={longPress.onMouseDown}
        onMouseUp={longPress.onMouseUp}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          longPress.onMouseLeave();
        }}
        onTouchStart={longPress.onTouchStart}
        onTouchEnd={longPress.onTouchEnd}
        onDragStart={(e) => {
          longPress.onDragStart();
          onDragStart(e);
        }}
      className={clsx(
        'relative aspect-square rounded-lg border bg-white overflow-hidden cursor-pointer select-none',
        'transition-shadow hover:shadow-md',
        pinned
          ? 'ring-2 ring-emerald-500 border-emerald-300'
          : isSelected
          ? 'ring-2 ring-blue-400 border-blue-300'
          : 'border-gray-200',
      )}
      title={node.name}
    >
      {/* ----------------------------- CONTENU ----------------------------- */}
      {hasImageThumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={node.name}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : hasVideoThumb ? (
        <>
          {/* Thumbnail toujours présente — fallback visuel pendant le load
              de la vidéo au hover, et état affiché au repos. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={videoThumbnailUrl ?? undefined}
            alt={node.name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
          {/* Preview vidéo monté UNIQUEMENT au hover.
              - muted + autoPlay : essentiel pour que le navigateur autorise l'autoplay
              - loop : la preview tourne en boucle tant qu'on hover
              - playsInline : pas de plein écran forcé sur iOS Safari
              - démonté au unhover : libère mémoire + arrête le DL */}
          {isHovering && url && (
            <video
              src={url}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              aria-hidden
            />
          )}
        </>
      ) : (
        isTextFile(extension) && url ? (
          <GridTextPreview url={url} />
        ) : (
          <CardIcon node={node} isAudio={isAudio} />
        )
      )}

      {/* ------------------------------ NOM ------------------------------- */}
      {/* En overlay-bas si vignette visuelle (pour ne pas masquer le visuel),
          en bloc classique sinon. */}
      <div
        className={clsx(
          'absolute bottom-0 left-0 right-0 px-2 py-1.5 text-xs truncate',
          hasVisualThumb
            ? 'bg-gradient-to-t from-black/70 to-black/0 text-white'
            : 'bg-white border-t border-gray-100 text-gray-700',
        )}
      >
        {node.name}
      </div>

      {/* --------------------------- BADGE TYPE --------------------------- */}
      {/* En haut à droite, affiche l'extension du fichier. Visible sur tous
          les fichiers (jamais sur les dossiers). Style adapté pour rester
          lisible aussi bien sur fond image/vidéo que sur fond icône.

          Pour les fichiers audio, on affiche aussi le badge — l'utilisateur
          voit ainsi (Music icon centrale + badge MP3/WAV en coin) ce qui est
          plus parlant que l'icône seule. */}
      {!isFolder && extension && (
        isPdfFile(extension) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/icons/pdf.svg"
            alt="PDF"
            className="absolute top-1.5 right-1.5 h-5 w-5 drop-shadow-sm"
          />
        ) : (
          <div
            className={clsx(
              'absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wide',
              hasVisualThumb
                ? 'bg-white/85 backdrop-blur-sm text-gray-700 shadow-sm'
                : 'bg-gray-100 text-gray-600 border border-gray-200',
            )}
          >
            {extension}
          </div>
        )
      )}

      {/* -------------------------- BADGE STATUT -------------------------- */}
      {/* Sous le badge de type (le coin haut-gauche est pris par la
          checkbox). Orange : état de travail, pas une erreur. */}
      {isPending && (
        <div
          className={clsx(
            'absolute right-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold',
            extension && !isFolder ? 'top-7' : 'top-1.5',
            hasVisualThumb
              ? 'bg-amber-500/90 text-white shadow-sm backdrop-blur-sm'
              : 'bg-amber-100 text-amber-800 border border-amber-200',
          )}
        >
          En attente
        </div>
      )}

      {/* ---------------------------- CHECKBOX ---------------------------- */}
      {/* Visible uniquement en mode multi-select. Posée en overlay
          en haut-gauche, fond semi-transparent pour rester lisible
          sur n'importe quelle vignette. */}
      {multiSelectActive && !isStatus && (
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

      {/* --------------------------- PANIER (PICK) ------------------------ */}
      {/* En mode picker, badge « épinglé » sur les fichiers du panier.
          TOUJOURS visible (pas au hover) et cible large : utilisable au
          tactile. Overlay vert distinct du bleu de multi-select. */}
      {pickMode && !isFolder && isInCart && (
        <div className="absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
          <Check className="h-4 w-4" aria-label="Dans la sélection" />
        </div>
      )}
      </div>

      {/* Menu contextuel — rendu hors du `<div>` principal pour éviter
          que ses clics/mousedown ne bubblent vers les handlers du div
          (sélection, hover, etc.). Positionné en `fixed` viewport. */}
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

/* -------------------------------------------------------------------------- */
/*                                CARD ICON                                   */
/* -------------------------------------------------------------------------- */

/**
 * Affiche l'icône centrale d'une card sans vignette image/vidéo.
 *
 * - **Dossier** : icône Lucide `Folder`.
 * - **Audio** : icône Lucide `Music` (détectée par extension côté caller).
 * - **Vidéo non-Cloudinary** (sans thumbnail générable) : emoji 🎬
 * - **Autres** : emoji 📄
 *
 * Mix icônes Lucide / emojis : on garde les emojis pour les fallback
 * génériques (déjà en place dans la version précédente), et on adopte
 * Lucide pour les cas où on veut un look design plus précis (audio).
 */
function CardIcon({
  node,
  isAudio,
}: {
  node: FinderNode;
  isAudio: boolean;
}): JSX.Element {
  if (node.type === 'folder') {
    return (
      <div className="w-full h-full flex items-center justify-center pb-6 text-blue-400">
        <Folder className="w-16 h-16" strokeWidth={1.5} />
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="w-full h-full flex items-center justify-center pb-6 text-purple-400">
        <Music className="w-14 h-14" strokeWidth={1.5} />
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


/**
 * Aperçu du début d'un fichier texte dans une card de la grille. Réutilise
 * `useNodeTextContent` (le même hook que la sidebar), plafonné à quelques
 * centaines d'octets — on ne veut qu'un aperçu.
 */
function GridTextPreview({ url }: { url: string }): JSX.Element {
  const { content, loading } = useNodeTextContent(url, { maxBytes: 600 });

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-[10px] text-gray-400">…</div>
      </div>
    );
  }
  if (!content) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <FileText className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div className="w-full h-full overflow-hidden bg-gray-50 p-2">
      <pre className="text-[7px] leading-[1.3] text-gray-600 whitespace-pre-wrap break-words font-mono">
        {content}
      </pre>
    </div>
  );
}
