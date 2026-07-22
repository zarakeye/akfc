'use client';

import { JSX, useState } from 'react';
import { File, Music, Check, FileText, Play } from 'lucide-react';
import { effectiveExtension, isAudioFile, isPdfFile, isTextFile, videoPosterUrl, displayName } from '@features/finder-core/utils/fileType';
import { statusOf } from '@features/finder-core/utils/statusFolders';
import clsx from 'clsx';

import type { FinderNode } from '@contracts/finder';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';
import { RenameInput } from '@features/finder-core/components/RenameInput';
import { baseNameOf } from '@features/finder-core/utils/fileType';
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

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode } =
    useNodeActions();

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
        label: 'Renommer',
        onClick: () => {
          setRenameError(null);
          setIsRenaming(true);
        },
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

        <TreeFileVisual node={node} />
        {isRenaming ? (
          <RenameInput
            initial={baseNameOf(node.name)}
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
        ) : (
          <span
            className="truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setRenameError(null);
              setIsRenaming(true);
            }}
          >
            {displayName(node.name, node.meta?.format)}
          </span>
        )}
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


/**
 * Vignette typée d'un fichier dans la tree view :
 *   - image  → aperçu réel (meta.url), fallback icône si l'image casse ;
 *   - audio  → note de musique ;
 *   - pdf    → logo PDF ;
 *   - autre  → icône fichier générique.
 * Un point orange discret signale le statut « en attente ».
 */
function TreeFileVisual({ node }: { node: FinderNode }): JSX.Element {
  const [imgFailed, setImgFailed] = useState(false);
  const url = node.meta?.url;
  const kind = node.meta?.kind;
  const extension = effectiveExtension(node.meta?.format, node.name);
  const status = statusOf(node);
  const isPending = status === 'pending';
  const isPublished = status === 'published';

  const hasImageThumb = kind === 'image' && url && !imgFailed;
  const videoThumb =
    kind === 'video' && url ? videoPosterUrl(url) : null;

  let inner: JSX.Element;
  if (hasImageThumb) {
    inner = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={node.name}
        className="h-5 w-5 shrink-0 rounded-sm object-cover"
        onError={() => setImgFailed(true)}
      />
    );
  } else if (videoThumb && !imgFailed) {
    inner = (
      // eslint-disable-next-line @next/next/no-img-element
      <span className="relative inline-flex h-5 w-5 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={videoThumb}
          alt={node.name}
          className="h-5 w-5 rounded-sm object-cover"
          onError={() => setImgFailed(true)}
        />
        {/* Badge play : distingue une vidéo d'une image au premier coup d'œil. */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-black/55">
            <Play className="h-2 w-2 text-white fill-white translate-x-[0.5px]" />
          </span>
        </span>
      </span>
    );
  } else if (isPdfFile(extension)) {
    // eslint-disable-next-line @next/next/no-img-element
    inner = <img src="/icons/pdf.svg" alt="PDF" className="h-5 w-5 shrink-0" />;
  } else if (isAudioFile(extension)) {
    inner = <Music className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={1.5} />;
  } else if (isTextFile(extension)) {
    // Texte : simple icône (16px trop petit pour un aperçu de contenu).
    inner = <FileText className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={1.5} />;
  } else {
    inner = <File className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={1.5} />;
  }

  // Statut inconnu (ou corbeille) : pas de pastille, rendu nu.
  if (!isPending && !isPublished) return inner;

  // Les DEUX états sont marqués — « publié » ne se déduit plus d'une absence.
  // Les « en attente » sont estompés pour que les publiés ressortent.
  return (
    <span className="relative inline-flex shrink-0">
      <span className={clsx('inline-flex', isPending && 'opacity-60')}>
        {inner}
      </span>
      <span
        className={clsx(
          'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-1 ring-white',
          isPending ? 'bg-orange-400' : 'bg-emerald-500',
        )}
        aria-label={isPending ? 'En attente' : 'Publié'}
      />
    </span>
  );
}
