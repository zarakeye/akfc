"use client";

import { useFinderReadOnly } from "#features/finder-core/state/FinderReadOnlyContext.ts";
import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Users,
  User,
  CircleUserRound,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

import type { FinderNode } from "@akfc/contracts/finder/index.ts";
import type { FileAdapter } from "@akfc/contracts/finder/index.ts";

import { APP_ROOT } from "@akfc/config/app.ts";
import { trpc } from "#core/trpc/trpcClient.ts";

import { useFinderStore } from "#features/finder-core/state/useFinderStore.ts";
import { friendlySpaceFolderLabel } from "#features/finder-core/utils/spaceFolderLabel.ts";
import { useLongPress } from "#features/finder-core/hooks/useLongPress.ts";
import { useNodeActions } from "#features/finder-core/hooks/useNodeActions.ts";
import { isStatusFolder } from "#features/finder-core/utils/statusFolders.ts";
import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, isPersosContainer, isAvatarsContainer, isProtectedEntityFolder } from "#features/finder-core/utils/spaceFolderKind.ts";
import { BinIcon } from "#features/finder-core/components/BinIcon.tsx";
import ContextMenu, {
  type ContextMenuItem,
} from "#features/finder-core/components/ContextMenu.tsx";
import { RenameInput } from "#features/finder-core/components/RenameInput.tsx";
import { useFolderDropTarget } from "#features/finder-core/hooks/useFolderDropTarget.ts";
import FinderTreeFile from "#features/finder-core/components/FinderTreeFile.tsx";
import { getTriState } from "#features/finder-core/utils/triState.ts";

/**
 * FinderTreeFolder
 *
 * Composant récursif d'un dossier dans la TreeView. Il ne charge rien : ses enfants arrivent
 * avec le palier que FinderTree demande à l'adaptateur. Il affiche, déplie, accepte un dépôt,
 * et réarrange visuellement les espaces de groupe selon leur hiérarchie.
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
  // La corbeille (bin) est un dossier protégé, mais on autorise l'édition de
  // son LABEL d'affichage (renameNode route bin → setFolderLabel ; le path
  // physique `bin` reste). Drag/select/suppression restent interdits.
  const isRenamableRoot = node.path === `${APP_ROOT}/bin`;
  // La corbeille a sa PROPRE vue plate (FinderBinRootView) dans la grille.
  // Dans l'arbre, elle reste une FEUILLE : pas de chevron, pas de descente
  // dans `.trash/<uuid>/…` (ce qui produisait une 2e arborescence de la
  // corbeille). Le clic navigue vers la vue plate (handleRowClick → onOpen).
  const isBinRoot = node.path === `${APP_ROOT}/bin`;

  const longPress = useLongPress(() => {
    if (isStatus) return;
    if (onLongPress) onLongPress(node);
  });

  // Lecture seule (« Mes espaces ») : ni menu contextuel, ni glisser.
  const readOnly = useFinderReadOnly();
  const isDraggable = Boolean(onDragStart) && !isStatus && !readOnly;

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const { effectiveNodesFor, deleteLabel, renameNode } =
    useNodeActions();

  function buildMenuItems(): ContextMenuItem[] {
    const targetNodes = effectiveNodesFor(node);
    if (isRenamableRoot) {
      return [
        {
          label: "Renommer",
          onClick: () => {
            setRenameError(null);
            setIsRenamingFolder(true);
          },
        },
      ];
    }
    return [
      {
        label: "Renommer",
        onClick: () => {
          setRenameError(null);
          setIsRenamingFolder(true);
        },
      },
      ...(targetNodes.some(
        (n) => n.type === "folder" && isProtectedEntityFolder(n.path),
      )
        ? []
        : [
            {
              label: deleteLabel(targetNodes.length, targetNodes),
              destructive: true,
              onClick: () => {
                useFinderStore.getState().askDelete(targetNodes);
              },
            } as ContextMenuItem,
          ]),
    ];
  }

  const { data: groupSpaceHierarchy } = trpc.storage.groupSpaceHierarchy.useQuery();



  const toggleSelect = useFinderStore((s) => s.toggleSelect);
  const multiSelectActive = useFinderStore((s) => s.multiSelectActive);
  const selection = useFinderStore((s) => s.selection);

  // Les enfants viennent tous du palier chargé par FinderTree : un dossier ne charge rien lui-même.
  const effectiveChildren: FinderNode[] | undefined = node.children;

  // ─── Option B : imbrication VISUELLE des espaces de groupe ──────────────
  // Au niveau de `groups/`, on ré-arrange les nœuds RÉELS des espaces selon
  // la hiérarchie logique (parentGroupId). Chaque espace garde SON nœud —
  // donc ses enfants déjà chargés par l'arbre profond — d'où aucun nœud
  // synthétique et aucun spinner. Les chemins physiques restent intacts.
  const groupsContainerPath = `${APP_ROOT}/collaborative-group-spaces`;
  const spacePathByGroupId = new Map<string, string>();
  for (const sp of groupSpaceHierarchy ?? []) {
    spacePathByGroupId.set(sp.groupId, sp.path);
  }
  const parentPathBySpacePath = new Map<string, string | null>();
  for (const sp of groupSpaceHierarchy ?? []) {
    parentPathBySpacePath.set(
      sp.path,
      sp.parentGroupId
        ? (spacePathByGroupId.get(sp.parentGroupId) ?? null)
        : null,
    );
  }

  let displayChildren: FinderNode[] | undefined = effectiveChildren;
  if (node.path === groupsContainerPath && effectiveChildren) {
    const spaceNodes = effectiveChildren.filter((c) =>
      parentPathBySpacePath.has(c.path),
    );
    const others = effectiveChildren.filter(
      (c) => !parentPathBySpacePath.has(c.path),
    );
    const childrenByParentPath = new Map<string, FinderNode[]>();
    for (const n of spaceNodes) {
      const pp = parentPathBySpacePath.get(n.path) ?? null;
      if (pp && parentPathBySpacePath.has(pp)) {
        const arr = childrenByParentPath.get(pp) ?? [];
        arr.push(n);
        childrenByParentPath.set(pp, arr);
      }
    }
    const augment = (n: FinderNode): FinderNode => {
      const childSpaces = childrenByParentPath.get(n.path) ?? [];
      if (childSpaces.length === 0) return n;
      return {
        ...n,
        hasChildren: true,
        children: [...(n.children ?? []), ...childSpaces.map(augment)],
      };
    };
    const roots = spaceNodes.filter((n) => {
      const pp = parentPathBySpacePath.get(n.path) ?? null;
      return !pp || !parentPathBySpacePath.has(pp);
    });
    displayChildren = [...others, ...roots.map(augment)];
  }

  const hasChildren = node.hasChildren ?? (displayChildren?.length ?? 0) > 0;

  // Ouvert, annoncé non vide, mais au-delà du palier chargé : le palier suivant arrive.
  const isMaterializing = isOpen && hasChildren && node.children === undefined;

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

  // Le dossier est une cible de dépôt (sauf en lecture seule) : même règle et
  // même dépôt que la grille et le fil d'Ariane.
  const { isDragOver, handlers: dropHandlers } = useFolderDropTarget(node.path, {
    enabled: !readOnly,
    adapter,
  });

  const showChevron = hasChildren && !isBinRoot;

  const displayLabel =
    friendlySpaceFolderLabel(node.name, node.path) ?? node.name;

  return (
    <div
      className="select-none"
      {...dropHandlers}
    >
      <div
        onClick={handleRowClick}
        onContextMenu={
          readOnly || (isStatus && !isRenamableRoot)
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
        // Cible du tuto « Restaurer un élément de la corbeille ».
        data-tour={isBinRoot ? "finder.bin" : undefined}
        className={clsx(
          "flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm",
          isActive &&
            !isDragOver &&
            "bg-accent text-accent-foreground font-medium",
          !isActive && !isDragOver && "hover:bg-accent/40",
          isDragOver && "bg-info-muted ring-1 ring-ring",
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
            {isMaterializing ? (
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
            // Coché aussi quand un dossier au-dessus l'est ; à moitié quand
            // quelque chose dessous est dans l'autre état.
            checked={getTriState(node.path, selection) === 'checked'}
            ref={(el) => {
              if (el) el.indeterminate = getTriState(node.path, selection) === 'indeterminate';
            }}
            readOnly
            className="shrink-0"
          />
        )}

        {isBinRoot ? (
          <BinIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : isGroupSpaceFolder(node.path) || isGroupsContainer(node.path) ? (
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : isPersoSpaceFolder(node.path) || isPersosContainer(node.path) ? (
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : isAvatarsContainer(node.path) ? (
          <CircleUserRound className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : isOpen ? (
          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        {isRenamingFolder ? (
          <span className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
            <RenameInput
              initial={displayLabel}
              error={renameError}
              onCancel={() => {
                setIsRenamingFolder(false);
                setRenameError(null);
              }}
              onCommit={async (value) => {
                const message = await renameNode(node, value);
                if (message) {
                  setRenameError(message);
                  return;
                }
                setIsRenamingFolder(false);
                setRenameError(null);
              }}
            />
          </span>
        ) : (
          <span
            className="truncate"
            onDoubleClick={(e) => {
              // Double-clic sur le NOM : renommer. Le clic simple sur la
              // ligne garde son rôle d'ouverture / de repli.
              e.stopPropagation();
              if (!isStatus || isRenamableRoot) {
                setRenameError(null);
                setIsRenamingFolder(true);
              }
            }}
          >
            {displayLabel}
          </span>
        )}
      </div>


      {isOpen && isMaterializing && (
        <div className="ml-3 pl-3 border-l border-border">
          <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Chargement…</span>
          </div>
        </div>
      )}

      {!isBinRoot && isOpen && displayChildren && displayChildren.length > 0 && (
        <div className="ml-3 pl-3 border-l border-border">
          {displayChildren.map((child) =>
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
