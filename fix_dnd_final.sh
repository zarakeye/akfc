#!/bin/bash
# Fix DnD complet (remplace fix_move_v3 cote front + fix_dnd_nested) :
#  1. stopPropagation du dragstart : saisir un enfant ne demarre plus le
#     drag du parent ;
#  2. drop inter-statuts = pur changement de statut (status-folder), la
#     position fine est ignoree, le sous-chemin preserve ; drop meme
#     statut = deplacement normal ;
#  3. trace de diagnostic retiree.
# À lancer depuis la RACINE du monorepo : bash fix_dnd_final.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

echo "-> apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
cat > 'apps/web/src/features/finder-core/components/FinderTreeFolder.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

import type { FinderNode } from "@contracts/finder";
import type { FileAdapter } from "@contracts/finder";

import { APP_ROOT } from "@config/app";
import { trpc } from "@trpc/trpcClient";

import { useFinderStore } from "@features/finder-core/state/useFinderStore";
import { useLongPress } from "@features/finder-core/hooks/useLongPress";
import { useNodeActions } from "@features/finder-core/hooks/useNodeActions";
import { useTrashMap } from "@features/finder-core/state/TrashMapContext";
import { isStatusFolder } from "@features/finder-core/utils/statusFolders";
import ContextMenu, {
  type ContextMenuItem,
} from "@features/finder-core/components/ContextMenu";
import {
  FINDER_DRAG_MIME,
  tryParsePayload,
  isDropAllowed,
  isDropEffective,
} from "@features/finder-core/dnd/payload";
import FinderTreeFile from "@features/finder-core/components/FinderTreeFile";

/**
 * FinderTreeFolder
 *
 * Composant récursif d'un dossier dans la TreeView. (Doc de chargement /
 * corbeille / barre verticale inchangée — cf. historique.)
 *
 * ─── Mode picker (panier) ─────────────────────────────────────────────────
 *
 * Le dossier lui-même ne s'épingle pas (seuls les fichiers vont au panier) :
 * en pickMode il navigue/déplie comme d'habitude. Mais il PROPAGE les props
 * pick (`pickMode`/`isInCart`/`onPickToggle`) à ses enfants — sous-dossiers
 * (récursion) et `FinderTreeFile` — pour que les fichiers de l'arbre soient
 * pickables, branchés sur le même store que la grille.
 */

type Props = {
  node: FinderNode;
  adapter: FileAdapter;
  currentPath: string;
  onOpen: (path: string) => void;
  openPaths: Set<string>;
  onToggleOpen: (path: string) => void;
  onDragStart?: (e: React.DragEvent, node: FinderNode) => void;
  onLongPress?: (node: FinderNode) => void;
  /** Mode picker actif — propagé aux enfants (fichiers pickables). */
  pickMode?: boolean;
  /** En pickMode : ce path est-il dans le panier ? Propagé aux fichiers. */
  isInCart?: (path: string) => boolean;
  /** En pickMode : épingle/retire un fichier. Propagé aux fichiers. */
  onPickToggle?: (node: FinderNode) => void;
};

export default function FinderTreeFolder({
  node,
  adapter,
  currentPath,
  onOpen,
  openPaths,
  onToggleOpen,
  onDragStart,
  onLongPress,
  pickMode = false,
  isInCart,
  onPickToggle,
}: Props) {
  const isOpen = openPaths.has(node.path);
  const isActive = node.path === currentPath;

  const isStatus = isStatusFolder(node.path);

  const longPress = useLongPress(() => {
    if (isStatus) return;
    if (onLongPress) onLongPress(node);
  });

  const isDraggable = Boolean(onDragStart) && !isStatus;

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { effectiveNodesFor, deleteNodes, deleteLabel } = useNodeActions();

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

  const trashToBinMutation = trpc.trash.trashToBin.useMutation();

  const trashMap = useTrashMap();

  const inTrashStorage =
    node.path.includes("/.trash/") || node.path.endsWith("/.trash");
  const isTrashRootSkipNode = node.name === ".trash";

  const isTrashWrapperNode = Boolean(node.path.match(/\/bin\/\.trash\/[^/]+$/));

  const trashEntryForName = trashMap.get(node.name);

  const [loadedChildren, setLoadedChildren] = useState<FinderNode[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reloadKey = useFinderStore((s) => s.reloadKey);
  const isFirstReloadKeyRef = useRef(true);
  const autoLoadTriggeredRef = useRef(false);

  useEffect(() => {
    if (isFirstReloadKeyRef.current) {
      isFirstReloadKeyRef.current = false;
      return;
    }
    setLoadedChildren(null);
    autoLoadTriggeredRef.current = false;
  }, [reloadKey]);

  useEffect(() => {
    if (!isTrashRootSkipNode && !isTrashWrapperNode) return;
    if (autoLoadTriggeredRef.current) return;
    if (node.children && node.children.length > 0) return;
    if (loadedChildren !== null) return;
    if (!adapter.getTree) return;

    async function autoLoad() {
      const cached = useFinderStore.getState().contentCache.get(node.path);
      if (cached) {
        autoLoadTriggeredRef.current = true;
        setLoadedChildren([...cached.folders, ...cached.files]);
        return;
      }

      autoLoadTriggeredRef.current = true;
      setIsLoading(true);

      try {
        const { root } = await adapter.getTree!({ path: node.path, depth: 1 });
        const children = root.children ?? [];
        setLoadedChildren(children);
        useFinderStore.getState().cacheChildrenAt(node.path, children);
      } catch (err) {
        console.error("[FinderTreeFolder] auto-load skip-node failed", err);
        setLoadError("Erreur chargement contenu corbeille");
      } finally {
        setIsLoading(false);
      }
    }

    void autoLoad();
  }, [
    isTrashRootSkipNode,
    isTrashWrapperNode,
    node.path,
    node.children,
    loadedChildren,
    adapter,
  ]);

  const [isDragOver, setIsDragOver] = useState(false);

  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);
  const exitMultiSelect = useFinderStore((s) => s.exitMultiSelect);
  const toggleSelect = useFinderStore((s) => s.toggleSelect);
  const multiSelectActive = useFinderStore((s) => s.multiSelectActive);
  const selectedIds = useFinderStore((s) => s.selection.roots);

  const effectiveChildren: FinderNode[] | undefined =
    node.children !== undefined ? node.children : (loadedChildren ?? undefined);

  const hasChildren = node.hasChildren ?? (effectiveChildren?.length ?? 0) > 0;

  const isMaterializing =
    isOpen &&
    hasChildren &&
    node.children === undefined &&
    loadedChildren === null &&
    !isTrashRootSkipNode &&
    !isTrashWrapperNode;

  function handleToggleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleOpen(node.path);
  }

  /**
   * Clic sur le LIBELLÉ du dossier.
   *
   * En pickMode comme en mode normal, un dossier NAVIGUE (on ne met pas de
   * dossier au panier). En multi-select, il toggle sa sélection (sauf status).
   */
  function handleRowClick() {
    if (longPress.consumeJustFired()) return;
    if (multiSelectActive && !pickMode) {
      if (isStatus) return;
      toggleSelect(node.id);
      return;
    }
    onOpen(node.path);
  }

  function isFinderDrag(e: React.DragEvent): boolean {
    return e.dataTransfer.types.includes(FINDER_DRAG_MIME);
  }

  function handleDragEnter(e: React.DragEvent) {
    if (!isFinderDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!isFinderDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setIsDragOver(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const raw = e.dataTransfer.getData(FINDER_DRAG_MIME);
    const payload = tryParsePayload(raw);
    if (!payload) return;

    const items = payload.items;
    const targetPath = node.path;

    if (!isDropAllowed(targetPath, items)) return;
    if (!isDropEffective(targetPath, items)) return;

    const BIN_ROOT_PATH = `${APP_ROOT}/bin`;

    if (targetPath === BIN_ROOT_PATH) {
      try {
        await trashToBinMutation.mutateAsync({
          appRoot: APP_ROOT,
          sources: items.map((it) => ({
            kind:
              it.type === "folder" ? ("folder" as const) : ("file" as const),
            fullPath: it.path,
          })),
        });
        reloadFolderContent();
        exitMultiSelect();
      } catch (err) {
        console.error("[FinderTreeFolder] trashToBin failed", err);
      }
      return;
    }

    if (!adapter.moveItems) {
      console.warn(
        "[FinderTreeFolder] adapter.moveItems unavailable, drop ignoré",
      );
      return;
    }

    // Statut = 2e segment du path (`AKFC/<statut>/…`). Un drop dont la
    // cible est sous un statut DIFFÉRENT de celui des items dropés est un
    // pur CHANGEMENT DE STATUT : la cible `status-folder` substitue ce
    // seul segment et préserve le sous-chemin (cf. resolveTargetPath). La
    // position fine du drop est alors ignorée — déposer sur `AKFC/published`
    // ou `AKFC/published/cours` produit le même effet (décision 2026-07-03 :
    // aucune réorganisation pendant un changement de statut). Un drop dans
    // le MÊME statut reste un déplacement `folder` classique.
    const statusOf = (path: string): string | undefined =>
      path.startsWith(`${APP_ROOT}/`)
        ? path.slice(APP_ROOT.length + 1).split("/")[0]
        : undefined;

    const targetStatus = statusOf(targetPath);
    const isStatusChange =
      (targetStatus === "pending" || targetStatus === "published") &&
      items.some((it) => statusOf(it.path) !== targetStatus);

    try {
      await adapter.moveItems({
        items,
        target: isStatusChange
          ? {
              type: "status-folder",
              status: targetStatus as "pending" | "published",
            }
          : { type: "folder", path: targetPath },
      });
      reloadFolderContent();
      exitMultiSelect();
    } catch (err) {
      console.error("[FinderTreeFolder] drop failed", err);
    }
  }

  const showChevron = hasChildren;

  // ─── Skip visuel du `.trash` ET des wrappers uuid ────────────────────────
  if (isTrashRootSkipNode || isTrashWrapperNode) {
    return (
      <>
        {effectiveChildren?.map((child) =>
          child.type === "folder" ? (
            <FinderTreeFolder
              key={child.path}
              node={child}
              adapter={adapter}
              currentPath={currentPath}
              onOpen={onOpen}
              openPaths={openPaths}
              onToggleOpen={onToggleOpen}
              onDragStart={onDragStart}
              onLongPress={onLongPress}
              pickMode={pickMode}
              isInCart={isInCart}
              onPickToggle={onPickToggle}
            />
          ) : (
            <FinderTreeFile
              key={child.path}
              node={child}
              onDragStart={onDragStart}
              onLongPress={onLongPress}
              pickMode={pickMode}
              isInCart={isInCart}
              onPickToggle={onPickToggle}
            />
          ),
        )}
      </>
    );
  }

  let displayLabel = node.name;
  if (inTrashStorage && trashEntryForName) {
    displayLabel = trashEntryForName.displayName;
  } else if (
    inTrashStorage &&
    !trashEntryForName &&
    node.path.match(/\/bin\/\.trash\/[^/]+$/)
  ) {
    displayLabel = "Élément supprimé";
  }

  return (
    <div
      className="select-none"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        onClick={handleRowClick}
        onContextMenu={
          isStatus
            ? undefined
            : (e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuPos({ x: e.clientX, y: e.clientY });
              }
        }
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
        onMouseDown={longPress.onMouseDown}
        onMouseUp={longPress.onMouseUp}
        onMouseLeave={longPress.onMouseLeave}
        onTouchStart={longPress.onTouchStart}
        onTouchEnd={longPress.onTouchEnd}
        data-finder-drop-path={node.path}
        className={clsx(
          "flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm",
          isActive &&
            !isDragOver &&
            "bg-accent text-accent-foreground font-medium",
          !isActive && !isDragOver && "hover:bg-accent/40",
          isDragOver && "bg-blue-100 ring-1 ring-blue-300",
        )}
        title={node.path}
      >
        {showChevron ? (
          <button
            type="button"
            onClick={handleToggleOpen}
            className="flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={isOpen ? "Replier" : "Déplier"}
          >
            {isLoading || isMaterializing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="inline-block h-4 w-4" />
        )}

        {/* Checkbox multi-select — masquée en pickMode (le dossier ne pick pas,
            et en pickMode la multi-select n'est pas la cible du clic). */}
        {multiSelectActive && !pickMode && !isStatus && (
          <input
            type="checkbox"
            checked={selectedIds.has(node.id)}
            readOnly
            className="shrink-0"
          />
        )}

        {isOpen ? (
          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        <span className="truncate capitalize">{displayLabel}</span>
      </div>

      {loadError && isOpen && (
        <div className="ml-3 pl-3 border-l border-border">
          <div className="px-2 py-1 text-xs text-destructive">{loadError}</div>
        </div>
      )}

      {isOpen && isMaterializing && (
        <div className="ml-3 pl-3 border-l border-border">
          <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Chargement…</span>
          </div>
        </div>
      )}

      {isOpen && effectiveChildren && effectiveChildren.length > 0 && (
        <div className="ml-3 pl-3 border-l border-border">
          {effectiveChildren.map((child) =>
            child.type === "folder" ? (
              <FinderTreeFolder
                key={child.path}
                node={child}
                adapter={adapter}
                currentPath={currentPath}
                onOpen={onOpen}
                openPaths={openPaths}
                onToggleOpen={onToggleOpen}
                onDragStart={onDragStart}
                onLongPress={onLongPress}
                pickMode={pickMode}
                isInCart={isInCart}
                onPickToggle={onPickToggle}
              />
            ) : (
              <FinderTreeFile
                key={child.path}
                node={child}
                onDragStart={onDragStart}
                onLongPress={onLongPress}
                pickMode={pickMode}
                isInCart={isInCart}
                onPickToggle={onPickToggle}
              />
            ),
          )}
        </div>
      )}

      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          items={buildMenuItems()}
          onClose={() => setMenuPos(null)}
        />
      )}
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/finder-core/components/FinderTreeFile.tsx"
cat > 'apps/web/src/features/finder-core/components/FinderTreeFile.tsx' << 'FILE_EOF'
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
FILE_EOF

echo "-> packages/backend/src/modules/storage/resolveMoveIntent.service.ts"
cat > 'packages/backend/src/modules/storage/resolveMoveIntent.service.ts' << 'FILE_EOF'
import type {
  StorageAdapter,
  StorageMoveIntent,
  StorageMoveOperation,
  StorageMoveSource,
  StorageMoveTarget,
} from "@contracts/storage";

/**
 * resolveMoveIntent.service.ts
 *
 * Couche 2 du pipeline de move : résout une intention riche en N opérations
 * atomiques, et les exécute via l'adapter de stockage.
 *
 *   Couche 3 — INTENTION              StorageMoveIntent (entrée de ce service)
 *   Couche 2 — RÉSOLUTION             ce service
 *   Couche 1 — OPÉRATION              StorageMoveOperation (sortie)
 *
 * ─── Ce que ce service fait, et ce qu'il ne fait pas ──────────────────────
 *
 * Il fait :
 *   - expanse une `selection` (roots + excluded) en N items concrets en
 *     interrogeant l'adapter (`list` ou `getTree`)
 *   - traduit une cible `status-folder` (lifecycle status applicatif) en
 *     path concret en respectant la convention `${appRoot}/${status}/...`
 *   - produit N `StorageMoveOperation` atomiques
 *   - les exécute séquentiellement via `adapter.move()`
 *
 * Il ne fait pas :
 *   - aucun appel direct à un provider (Cloudinary, R2, etc.). Tout passe
 *     par l'interface `StorageAdapter` reçue en paramètre.
 *   - aucune validation Zod (l'input est supposé déjà validé en amont,
 *     typiquement par `storageMoveIntentSchema` au niveau du router).
 *   - aucune logique de DB (l'adapter ou le service métier qui l'appelle
 *     se charge de propager les changements en DB si nécessaire).
 *
 * ─── Note importante sur la convention de path ────────────────────────────
 *
 * La traduction d'un `status-folder` en path concret repose sur la
 * convention `${appRoot}/${status}/...`. Cette convention est applicative
 * (imposée par le projet à tous ses stockages) et est documentée dans le
 * contrat `move.intent.ts`. Si demain le projet change cette convention,
 * c'est ici qu'il faudra la refléter.
 *
 * Le suffixe préservé d'un asset déplacé par `status-folder` correspond à
 * tout ce qui suit le `<status>` actuel dans son path. Exemple :
 *   source : `AKFC/pending/cours/12/photo.jpg`
 *   target : `{ type: 'status-folder', status: 'published' }`
 *   → path concret : `AKFC/published/cours/12/photo.jpg`
 */

export type ResolveMoveIntentParams = {
  adapter: StorageAdapter;
  appRoot: string;
  intent: StorageMoveIntent;
};

/**
 * Résout et exécute une intention de move.
 *
 * Renvoie le tableau des opérations atomiques effectivement exécutées —
 * utile pour les caller qui veulent logger, auditer, ou rejouer.
 *
 * Wrapper rétrocompatible équivalent à `planMoveOperations` suivi de
 * `executeMoveOperations`. Si tu as besoin d'insérer une garde ou un
 * audit entre les deux phases (ex: le router `storage.move` qui refuse
 * de sortir un asset référencé de published — sous-chantier 7), utilise
 * les deux fonctions séparément plutôt que ce wrapper.
 */
export async function resolveMoveIntent(
  params: ResolveMoveIntentParams
): Promise<StorageMoveOperation[]> {
  const operations = await planMoveOperations(params);
  await executeMoveOperations(params.adapter, operations);
  return operations;
}

/**
 * Phase 1 du pipeline : résout l'intention en N opérations atomiques,
 * **sans rien exécuter**. Ne fait que lire (via l'adapter) et calculer.
 *
 * Permet d'insérer des gardes sur les opérations planifiées avant
 * exécution. Utilisé par le router `storage.move` pour faire passer
 * les opérations à `assertOperationsDontUnpublishReferencedAssets`
 * avant l'appel à `executeMoveOperations`.
 */
export async function planMoveOperations(
  params: ResolveMoveIntentParams
): Promise<StorageMoveOperation[]> {
  const { adapter, appRoot, intent } = params;

  if (!adapter.move) {
    throw new Error(
      "Adapter does not support move(). " +
        "Cannot resolve a StorageMoveIntent on a read-only adapter."
    );
  }

  // 1) Résoudre la SOURCE en items concrets (file ou folder).
  const items = await resolveSource(intent.source, adapter);

  // 2) Pour chaque item, traduire la TARGET en path concret et produire
  //    une opération atomique.
  return items.map((item) => ({
    source: item,
    target: { path: resolveTargetPath(item, intent.target, appRoot) },
  }));
}

/**
 * Phase 2 du pipeline : exécute des opérations atomiques pré-planifiées
 * via l'adapter.
 *
 * Séquentiel et non parallèle : certains backends (Cloudinary
 * notamment) n'aiment pas les opérations concurrentes sur des prefixes
 * voisins.
 */
export async function executeMoveOperations(
  adapter: StorageAdapter,
  operations: readonly StorageMoveOperation[]
): Promise<void> {
  if (!adapter.move) {
    throw new Error(
      "Adapter does not support move(). " +
        "Cannot execute move operations on a read-only adapter."
    );
  }
  for (const operation of operations) {
    await adapter.move(operation);
  }
}

/* -------------------------------------------------------------------------- */
/*  Résolution de la source                                                   */
/* -------------------------------------------------------------------------- */

type ResolvedItem = StorageMoveOperation["source"];

/**
 * Expanse la source d'une intention en une liste d'items concrets.
 *
 * - `file` ou `folder` : un seul item, retourné tel quel.
 * - `selection`        : on liste sous chaque root et on filtre les excluded.
 *                        On préserve les types (file/folder) découverts pour
 *                        que `adapter.move()` puisse traiter chaque cas.
 */
async function resolveSource(
  source: StorageMoveSource,
  adapter: StorageAdapter
): Promise<ResolvedItem[]> {
  if (source.type === "file" || source.type === "folder") {
    return [{ type: source.type, path: source.path }];
  }

  // source.type === 'selection'
  const excluded = new Set(source.excluded ?? []);

  // Exclusion par préfixe : un asset `cours/12/draft/x.jpg` est exclu si
  // `cours/12/draft` est dans excluded. C'est la même règle que celle
  // appliquée par moveService Cloudinary actuellement.
  const isExcluded = (path: string): boolean => {
    if (excluded.has(path)) return true;
    for (const ex of excluded) {
      if (path.startsWith(`${ex}/`)) return true;
    }
    return false;
  };

  const out: ResolvedItem[] = [];
  const seen = new Set<string>();

  for (const rootPath of source.roots) {
    if (isExcluded(rootPath)) continue;

    // 1) Le root est-il un fichier ?
    //    Stratégie : tenter getNode pour discriminer file/folder.
    //    Si l'adapter n'a pas getNode, on assume folder et on liste.
    const rootNode = adapter.getNode
      ? await adapter.getNode(rootPath)
      : null;

    if (rootNode?.type === "file") {
      if (!seen.has(rootPath)) {
        out.push({ type: "file", path: rootPath });
        seen.add(rootPath);
      }
      continue;
    }

    // 2) Sinon, c'est un dossier : on liste son contenu récursif via getTree
    //    pour récupérer tous les descendants.
    if (!adapter.getTree) {
      throw new Error(
        "Adapter does not support getTree(). " +
          "Cannot resolve a 'selection' source without recursive listing."
      );
    }

    const subtree = await adapter.getTree({ path: rootPath, depth: Infinity });

    // Parcourir le sous-arbre en profondeur, ramasser tous les files non exclus.
    walkTree(subtree.root, (node) => {
      if (node.type === "file" && !isExcluded(node.path) && !seen.has(node.path)) {
        out.push({ type: "file", path: node.path });
        seen.add(node.path);
      }
    });
  }

  return out;
}

/**
 * Visite récursive d'un arbre de StorageNode.
 */
function walkTree(
  node: import("@contracts/storage").StorageNode,
  visit: (node: import("@contracts/storage").StorageNode) => void
): void {
  visit(node);
  if (node.type === "folder" && node.children) {
    for (const child of node.children) {
      walkTree(child, visit);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Résolution de la target                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Calcule le path concret d'arrivée pour un item donné.
 *
 * Pour une target de type `folder`, le path concret est `<targetFolder>/<sourceTail>`
 * où `sourceTail` est le dernier segment du path source (le nom du fichier
 * ou du dossier).
 *
 * Pour une target de type `status-folder`, on remplace le segment de statut
 * dans le path source. Convention : le statut est le SECOND segment du path
 * (juste après l'appRoot). Exemple : `AKFC/pending/cours/12/photo.jpg`
 *   → segment[0] = `AKFC` (appRoot)
 *   → segment[1] = `pending` (statut courant)
 *   → segments[2..] = `cours/12/photo.jpg` (suffixe à préserver)
 */
function resolveTargetPath(
  item: ResolvedItem,
  target: StorageMoveTarget,
  appRoot: string
): string {
  if (target.type === "folder") {
    const tail = lastSegment(item.path);
    return `${target.path}/${tail}`;
  }

  // target.type === 'status-folder'
  // On remplace le segment de statut dans le path source.
  const parts = item.path.split("/").filter(Boolean);

  // Invariant 1 : le path doit commencer par appRoot.
  // Toute source bien gérée par le système est sous appRoot.
  if (parts[0] !== appRoot) {
    throw new Error(
      `Cannot resolve status-folder target: source path does not start with appRoot. ` +
        `path="${item.path}" appRoot="${appRoot}"`
    );
  }

  // Invariant 2 : le segment de statut (parts[1]) doit être un statut connu.
  // Cet invariant traduit la règle applicative : un asset géré par le système
  // ne peut vivre que sous un status-folder ('pending' | 'published' | 'bin').
  // Si parts[1] est inconnu, c'est qu'on tente un move sur un asset qui
  // n'a pas été produit par le pipeline d'upload du système — bug en amont
  // qui mérite d'échouer fort plutôt que d'être bricolé silencieusement.
  const currentStatus = parts[1];
  if (
    currentStatus !== "pending" &&
    currentStatus !== "published" &&
    currentStatus !== "bin"
  ) {
    throw new Error(
      `Cannot resolve status-folder target: source path is not under a known ` +
        `lifecycle status segment. Expected segment[1] in {'pending', 'published', 'bin'}, ` +
        `got "${currentStatus ?? "<missing>"}". path="${item.path}"`
    );
  }

  // [appRoot, <oldStatus>, ...rest] → [appRoot, newStatus, ...rest]
  parts[1] = target.status;
  return parts.join("/");
}

function lastSegment(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
}
FILE_EOF

echo
pnpm --filter web typecheck