#!/bin/bash
# Fix move v3 : (1) drop sur racine de statut -> cible status-folder
# (sous-arbre PRESERVE, seul le segment de statut change) ; (2) synchro
# MediaAsset : chemins d'operation utilises tels quels (deja prefixes
# appRoot) et statut lu au segment [1].
# À lancer depuis la RACINE du monorepo : bash fix_move_v3.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

echo "-> apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
cat > 'apps/web/src/features/finder-core/components/FinderTreeFolder.tsx' << 'FILE_EOF'
'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Loader2 } from 'lucide-react';
import clsx from 'clsx';

import type { FinderNode } from '@contracts/finder';
import type { FileAdapter } from '@contracts/finder';

import { APP_ROOT } from '@config/app';
import { trpc } from '@trpc/trpcClient';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';
import { useTrashMap } from '@features/finder-core/state/TrashMapContext';
import { isStatusFolder } from '@features/finder-core/utils/statusFolders';
import ContextMenu, {
  type ContextMenuItem,
} from '@features/finder-core/components/ContextMenu';
import {
  FINDER_DRAG_MIME,
  tryParsePayload,
  isDropAllowed,
  isDropEffective,
} from '@features/finder-core/dnd/payload';
import FinderTreeFile from '@features/finder-core/components/FinderTreeFile';

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

  const inTrashStorage = node.path.includes('/.trash/') || node.path.endsWith('/.trash');
  const isTrashRootSkipNode = node.name === '.trash';

  const isTrashWrapperNode = Boolean(
    node.path.match(/\/bin\/\.trash\/[^/]+$/),
  );

  const trashEntryForName = trashMap.get(node.name);

  const [loadedChildren, setLoadedChildren] = useState<FinderNode[] | null>(null);
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
        console.error('[FinderTreeFolder] auto-load skip-node failed', err);
        setLoadError('Erreur chargement contenu corbeille');
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
    e.dataTransfer.dropEffect = 'move';
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
            kind: it.type === 'folder' ? ('folder' as const) : ('file' as const),
            fullPath: it.path,
          })),
        });
        reloadFolderContent();
        exitMultiSelect();
      } catch (err) {
        console.error('[FinderTreeFolder] trashToBin failed', err);
      }
      return;
    }

    if (!adapter.moveItems) {
      console.warn('[FinderTreeFolder] adapter.moveItems unavailable, drop ignoré');
      return;
    }

    try {
      // Un drop sur une RACINE de statut est un changement de cycle de
      // vie, pas un déplacement vers un dossier concret : la cible
      // `status-folder` fait substituer le SEUL segment de statut, le
      // sous-arbre est préservé (cf. resolveTargetPath). Une cible
      // `folder` classique ne concatène que la queue — c'était le bug
      // « cours/ perdu » du 2026-07-03. (`bin` a sa branche trashToBin
      // plus haut.)
      const statusRoot = (['pending', 'published'] as const).find(
        (s) => targetPath === `${APP_ROOT}/${s}`,
      );

      await adapter.moveItems({
        items,
        target: statusRoot
          ? { type: 'status-folder', status: statusRoot }
          : { type: 'folder', path: targetPath },
      });
      reloadFolderContent();
      exitMultiSelect();
    } catch (err) {
      console.error('[FinderTreeFolder] drop failed', err);
    }
  }

  const showChevron = hasChildren;

  // ─── Skip visuel du `.trash` ET des wrappers uuid ────────────────────────
  if (isTrashRootSkipNode || isTrashWrapperNode) {
    return (
      <>
        {effectiveChildren?.map((child) =>
          child.type === 'folder' ? (
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
  } else if (inTrashStorage && !trashEntryForName && node.path.match(/\/bin\/\.trash\/[^/]+$/)) {
    displayLabel = 'Élément supprimé';
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
          'flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm',
          isActive && !isDragOver && 'bg-accent text-accent-foreground font-medium',
          !isActive && !isDragOver && 'hover:bg-accent/40',
          isDragOver && 'bg-blue-100 ring-1 ring-blue-300',
        )}
        title={node.path}
      >
        {showChevron ? (
          <button
            type="button"
            onClick={handleToggleOpen}
            className="flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={isOpen ? 'Replier' : 'Déplier'}
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
            child.type === 'folder' ? (
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

echo "-> packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts"
cat > 'packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts' << 'FILE_EOF'
import type { PrismaClient } from "@prisma/client";

import type {
  StorageAdapter,
  UploadCapableAdapter,
  ListOptions,
  ListResult,
  GetTreeOptions,
  GetTreeResult,
  StorageNode,
  StorageFolderNode,
  StorageFileNode,
  StorageMetadata,
  StorageMoveOperation,
  StoragePath,
} from "@contracts/storage";

import type { UploadDestination, UploadAssetRequest } from "@contracts/cloudinary/upload.types";
import type { MoveIntent as CloudinaryMoveIntent } from "@contracts/cloudinary/move.schema";

import { getCloudinaryFolderTree } from "@backend/modules/cloudinary/services/getCloudinaryFolderTree.service";
import { getAssetInfo } from "@backend/modules/cloudinary/services/cloudinary.service";
import { moveService } from "@backend/modules/cloudinary/services/move.service";
import { createUploadSignatures } from "@backend/modules/cloudinary/services/createUploadSignatures.service";
import { registerUploadedAssets } from "@backend/modules/cloudinary/services/registerUploadedAssets.service";
import { pruneEmptyFolders } from "@backend/modules/cloudinary/services/pruneEmptyFolders.service";

import { mapClientFolderTreeToStorageNode } from "@backend/modules/storage/adapters/cloudinary/mappers";

/**
 * cloudinaryStorageAdapter
 *
 * Implémentation du contrat agnostique `StorageAdapter` + `UploadCapableAdapter`
 * pour Cloudinary. Construit par factory parce que les méthodes ont besoin
 * d'un `prisma` et d'un `appRoot` issus du contexte tRPC.
 *
 * ─── Stratégie de wrapping ─────────────────────────────────────────────────
 *
 * Cet adapter ne réécrit AUCUN service Cloudinary. Il se contente de :
 *   1) traduire les inputs du contrat agnostique vers les inputs Cloudinary
 *      (ex: StorageMoveOperation → MoveIntent Cloudinary "pauvre")
 *   2) appeler le service Cloudinary correspondant
 *   3) traduire son output vers la forme du contrat agnostique
 *      (ex: FolderNode Cloudinary → StorageFolderNode agnostique)
 *
 * Cette discipline préserve les services existants (testés, stables) et
 * concentre toute la "double traduction" dans ce fichier — qui devient
 * le seul endroit à connaître à la fois le vocabulaire Cloudinary et le
 * vocabulaire agnostique.
 *
 * ─── Méthodes non implémentées à ce chantier ───────────────────────────────
 *
 * `delete` n'est pas implémenté pour l'instant. Le soft-delete dans la
 * convention AKFC passe par `trashRouter.trashToBin` qui mêle des concepts
 * de la corbeille (TrashEntry en DB) à des opérations Cloudinary. Le
 * câblage propre via `StorageAdapter.delete` viendra avec le chantier
 * "corbeille agnostique" qui décidera des responsabilités.
 *
 * Le contrat autorise `delete?` à être absent — pas de violation d'interface.
 */

export type CloudinaryStorageAdapterDeps = {
  prisma: PrismaClient;
  appRoot: string;
};

/* -------------------------------------------------------------------------- */
/*  Types des inputs/outputs Upload                                           */
/* -------------------------------------------------------------------------- */

/**
 * Input pour `createUploadAuthorization` côté Cloudinary.
 *
 * Note : `appRoot` n'est PAS dans l'input parce qu'il est fixé par la
 * factory au moment de la création de l'adapter (constant pour une
 * requête tRPC donnée).
 */
export type CloudinaryCreateUploadAuthorizationInput = {
  destination: UploadDestination;
  assets: UploadAssetRequest[];
  allowOverwrite?: boolean; // Si absent/false : signe `overwrite:false` → Cloudinary refuse d'écraser.
};

export type CloudinaryCreateUploadAuthorizationOutput = Awaited<
  ReturnType<typeof createUploadSignatures>
>;

/**
 * Input pour `registerUploadedAsset` côté Cloudinary.
 *
 * `userId` EST dans l'input (et non dans la factory) parce qu'il varie
 * par requête — l'identité du déposant est une donnée de l'opération,
 * pas une propriété de l'adapter.
 */
export type CloudinaryRegisterUploadedAssetInput = {
  destination: UploadDestination;
  assets: Parameters<typeof registerUploadedAssets>[0]["assets"];
  userId: string;
  eventDate?: Date;
};

export type CloudinaryRegisterUploadedAssetOutput = Awaited<
  ReturnType<typeof registerUploadedAssets>
>;

/* -------------------------------------------------------------------------- */
/*  La factory                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Type complet de l'adapter, avec les génériques d'upload concrétisés.
 *
 * Exposé pour que les consommateurs (router storage par exemple) puissent
 * typer fortement leurs callsites quand ils savent qu'ils manipulent
 * spécifiquement un adapter Cloudinary.
 */
export type CloudinaryStorageAdapter = StorageAdapter &
  UploadCapableAdapter<
    CloudinaryCreateUploadAuthorizationInput,
    CloudinaryCreateUploadAuthorizationOutput,
    CloudinaryRegisterUploadedAssetInput,
    CloudinaryRegisterUploadedAssetOutput
  >;

export function createCloudinaryStorageAdapter(
  deps: CloudinaryStorageAdapterDeps
): CloudinaryStorageAdapter {
  const { prisma, appRoot } = deps;

  return {
    /* ====================================================================== */
    /*  list — enfants directs d'un dossier                                   */
    /* ====================================================================== */

    async list(options: ListOptions): Promise<ListResult> {
      // On s'appuie sur getCloudinaryFolderTree (qui retourne le tree complet
      // sous le préfixe) puis on extrait uniquement les enfants directs.
      // C'est sous-optimal si le tree est gros, mais ça réutilise la logique
      // canonique sans réécriture. Une optimisation cursor-based viendra
      // si nécessaire plus tard.
      const tree = await getCloudinaryFolderTree({
        prisma,
        appRoot,
        normalizedPath: options.path,
      });

      const node = mapClientFolderTreeToStorageNode(tree, /* depth */ 1);

      // Si jamais le path résolvait un fichier, pas de children — retour vide.
      if (node.type !== "folder") {
        return { folders: [], files: [], nextCursor: null };
      }

      const folders: StorageFolderNode[] = [];
      const files: StorageFileNode[] = [];

      for (const child of node.children ?? []) {
        if (child.type === "folder") {
          folders.push(child);
        } else {
          files.push(child);
        }
      }

      return {
        folders,
        files,
        // Cloudinary `getFolderTree` ne paginé pas par cursor à ce niveau —
        // la pagination se fait dans listAuthenticatedResources, mais elle
        // est consommée intégralement avant retour. Pas de page suivante.
        nextCursor: null,
      };
    },

    /* ====================================================================== */
    /*  getTree — sous-arbre jusqu'à `depth` niveaux                          */
    /* ====================================================================== */

    async getTree(options: GetTreeOptions): Promise<GetTreeResult> {
      const depth = options.depth ?? 1;

      const tree = await getCloudinaryFolderTree({
        prisma,
        appRoot,
        normalizedPath: options.path,
      });

      const root = mapClientFolderTreeToStorageNode(tree, depth);

      console.log(
        "[tree:truncated]", options.path, "depth=", depth,
        "taolu?", JSON.stringify(root).includes("taolu-multi-styles"),
        "tchoy?", JSON.stringify(root).includes("tchoy-lee-fut"),
      );

      // Si le path résolvait un fichier (cas marginal), on enveloppe dans un
      // folder vide pour respecter le contrat (`root: StorageFolderNode`).
      // Le caller pourra détecter ça via root.children === [] et root.path === options.path.
      if (root.type !== "folder") {
        return {
          root: {
            type: "folder",
            name: root.name,
            path: options.path,
            children: [],
            hasChildren: false,
          },
        };
      }

      return { root };
    },

    /* ====================================================================== */
    /*  getNode — lit un node précis                                          */
    /* ====================================================================== */

    async getNode(path: StoragePath): Promise<StorageNode | null> {
      // Stratégie : tenter d'abord comme fichier, puis comme dossier.
      // 1) Si Cloudinary connaît un asset à ce path → c'est un fichier.
      try {
        const info = await getAssetInfo(path);
        const name = path.split("/").pop() ?? path;
        return {
          type: "file",
          name,
          path,
          metadata: cloudinaryAssetInfoToStorageMetadata(info),
        };
      } catch {
        // continuer
      }

      // 2) Sinon, on regarde si des enfants existent sous le préfixe.
      //    On utilise getCloudinaryFolderTree qui combine assets + registre DB.
      try {
        const tree = await getCloudinaryFolderTree({
          prisma,
          appRoot,
          normalizedPath: path,
        });
        const node = mapClientFolderTreeToStorageNode(tree, /* depth */ 0);
        if (node.type === "folder") return node;
      } catch {
        // ignore
      }

      return null;
    },

    /* ====================================================================== */
    /*  getMetadata — lit les métadonnées brutes                              */
    /* ====================================================================== */

    async getMetadata(path: StoragePath): Promise<StorageMetadata | null> {
      try {
        const info = await getAssetInfo(path);
        return cloudinaryAssetInfoToStorageMetadata(info);
      } catch {
        return null;
      }
    },

    /* ====================================================================== */
    /*  move — déplace un file ou un folder atomique                          */
    /* ====================================================================== */

    async move(operation: StorageMoveOperation): Promise<void> {
      // ─── Bug fix critique : double tail ─────────────────────────────────
      //
      // `operation.target.path` est le path **FINAL** attendu pour l'item
      // après move (avec le nom du fichier/dossier concaténé par
      // `resolveTargetPath` dans `resolveMoveIntent.service.ts`). C'est le
      // contrat agnostique du module storage.
      //
      // Or le service Cloudinary `moveService` legacy attend
      // `target.fullPath` = path du **DOSSIER PARENT** dans lequel placer
      // l'item — il rajoute lui-même le nom dérivé du source via
      // `moveFileIntoFolder` (pour les fichiers) ou un concat similaire
      // (pour les folders).
      //
      // Sans cette correction, le rename Cloudinary final aboutit à un
      // path dupliqué :
      //   - source: `bin/.trash/<uuid>/trotinette`
      //   - target.path attendu: `pending/cours/X/trotinette`
      //   - target.fullPath envoyé à moveService: `pending/cours/X/trotinette`
      //   - moveService rajoute `/trotinette` → `pending/cours/X/trotinette/trotinette`
      //   - Cloudinary interprète comme un asset dans un "dossier" du même nom
      //     → effet visuel "dossier wrapper qui contient le fichier".
      //
      // Le R2 adapter, lui, attend directement le path final (cf. son `move`
      // qui passe `operation.target.path` à `moveFile` sans transformation).
      // Cette divergence est purement Cloudinary-specific et héritée du
      // moveService legacy qu'on n'a pas refactoré.
      //
      // Fix : on extrait le parent path AVANT de passer à moveService.
      const targetParentPath = operation.target.path
        .split("/")
        .slice(0, -1)
        .join("/");

      // On traduit l'opération atomique vers un MoveIntent Cloudinary
      // "pauvre" (pas de selection, pas de virtual-folder), puis on délègue
      // à moveService. Cette traduction est triviale parce que le contrat
      // agnostique a précisément été pensé comme un sous-ensemble qui
      // tient dans Cloudinary sans gymnastique.
      const intent: CloudinaryMoveIntent = {
        source:
          operation.source.type === "file"
            ? { type: "file", fullPath: operation.source.path }
            : { type: "folder", fullPath: operation.source.path },
        target: { type: "folder", fullPath: targetParentPath },
      };

      await moveService(intent);

      // ─── Synchro MediaAsset (fullPath + status) ──────────────────────────
      //
      // moveService renomme dans Cloudinary mais ne touche JAMAIS la table
      // MediaAsset : sans cette synchro, les `fullPath` deviennent périmés
      // (résolutions par chemin cassées — bug picker taolu, 2026-07-03) et
      // le `status` reste figé (assets publiés invisibles du public).
      //
      // Deltas vs le pattern R2 :
      //   - préfixe : les fullPath Cloudinary incluent l'appRoot
      //     (`AKFC/pending/…`), les paths d'opération non ;
      //   - extension : fullPath = `publicId.format` — le SQL préserve le
      //     suffixe par SUBSTRING (un updateMany à valeur fixe le perdrait) ;
      //   - status : dérivé du premier segment du chemin CIBLE
      //     (`pending`/`published` uniquement — la corbeille a son propre
      //     mécanisme TrashEntry) ;
      //   - LIKE : `%` et `_` sont des jokers SQL — les noms de fichiers
      //     regorgent d'underscores, on échappe (ESCAPE '\').
      // Les chemins d'opération INCLUENT l'appRoot (invariant de
      // resolveTargetPath : parts[0] === appRoot) — on les utilise
      // tels quels ; les préfixer une seconde fois faisait chercher
      // `AKFC/AKFC/…` (zéro match silencieux, 2026-07-03).
      const escLike = (s: string) => s.replace(/([\\%_])/g, "\\$1");
      const srcDb = operation.source.path;
      const dstDb = operation.target.path;
      // Statut = segment APRÈS l'appRoot ([1], pas [0] qui est l'appRoot).
      const topSegment = operation.target.path.split("/")[1];
      const nextStatus =
        topSegment === "pending" || topSegment === "published"
          ? topSegment
          : null;

      if (operation.source.type === "file") {
        // Exact (fullPath sans extension, improbable) OU `préfixe.` + ext.
        await prisma.$executeRaw`
          UPDATE "MediaAsset"
          SET "fullPath" = ${dstDb} || SUBSTRING("fullPath" FROM ${srcDb.length + 1}::int),
              "status" = COALESCE(${nextStatus}, "status")
          WHERE "appRoot" = ${appRoot}
            AND ("fullPath" = ${srcDb}
              OR "fullPath" LIKE ${escLike(srcDb) + ".%"} ESCAPE '\\');
        `;
      } else {
        const oldPrefix = `${srcDb}/`;
        const newPrefix = `${dstDb}/`;
        await prisma.$executeRaw`
          UPDATE "MediaAsset"
          SET "fullPath" = ${newPrefix} || SUBSTRING("fullPath" FROM ${oldPrefix.length + 1}::int),
              "status" = COALESCE(${nextStatus}, "status")
          WHERE "appRoot" = ${appRoot}
            AND "fullPath" LIKE ${escLike(oldPrefix) + "%"} ESCAPE '\\';
        `;
      }

      // ─── Nettoyage du dossier source vidé ───────────────────────────────
      //
      // moveService renomme les assets mais ne touche pas la table `Folder`
      // (registre qui sert à afficher les dossiers vides). Quand un move vide
      // un dossier source, sa ligne `Folder` survit → dossier fantôme dans la
      // vue source. On prune ces lignes orphelines ici.
      //
      // Rappel : `resolveMoveIntent` expanse les selections en moves de
      // FICHIERS atomiques. C'est donc le move du dernier fichier d'un dossier
      // qui le vide réellement — `folderHasAssets` renverra false uniquement à
      // ce moment-là, les précédents s'arrêtant immédiatement (dossier encore
      // peuplé). Pour une source `folder`, on part du dossier lui-même.
      const startFolderPath =
        operation.source.type === "file"
          ? operation.source.path.split("/").slice(0, -1).join("/")
          : operation.source.path;

      await pruneEmptyFolders({ prisma, appRoot, startFolderPath });
    },

    // delete: NON IMPLÉMENTÉ (cf. doc en tête de fichier). Le contrat
    // autorise l'absence — la propriété restera `undefined` sur l'objet.

    /* ====================================================================== */
    /*  createUploadAuthorization — délivre des signatures Cloudinary         */
    /* ====================================================================== */

    async createUploadAuthorization(
      input: CloudinaryCreateUploadAuthorizationInput
    ): Promise<CloudinaryCreateUploadAuthorizationOutput> {
      return createUploadSignatures({
        prisma,
        appRoot,
        destination: input.destination,
        assets: input.assets,
        allowOverwrite: input.allowOverwrite,
      });
    },

    /* ====================================================================== */
    /*  registerUploadedAsset — persiste après revérification                 */
    /* ====================================================================== */

    async registerUploadedAsset(
      input: CloudinaryRegisterUploadedAssetInput
    ): Promise<CloudinaryRegisterUploadedAssetOutput> {
      return registerUploadedAssets({
        prisma,
        appRoot,
        userId: input.userId,
        destination: input.destination,
        assets: input.assets,
        eventDate: input.eventDate,
      });
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Helpers privés au fichier                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Mappe la sortie de `cloudinary.api.resource()` (via `getAssetInfo`) vers
 * un `StorageMetadata` agnostique.
 *
 * Le typage de `getAssetInfo` est faible (l'API Cloudinary retourne du `any`
 * en pratique). On lit défensivement, en laissant les champs absents devenir
 * `undefined` plutôt que de propager des `null` ou des chaînes vides.
 */
function cloudinaryAssetInfoToStorageMetadata(info: {
  bytes?: number;
  format?: string;
  resource_type?: string;
  created_at?: string;
}): StorageMetadata {
  return {
    bytes: typeof info.bytes === "number" ? info.bytes : undefined,
    format: info.format,
    createdAt: info.created_at,
    // Cloudinary ne renvoie pas de mimeType complet sur cette API — on
    // pourrait le reconstituer depuis (resource_type, format) mais on
    // s'abstient pour rester strictement informatif. Si un consommateur
    // a besoin du mime, il appellera readUploadedAssetMetadata qui le
    // reconstitue déjà.
  };
}
FILE_EOF

echo "-> packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"
cat > 'packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts' << 'FILE_EOF'
import {
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  type S3Client,
  type _Object as S3Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { PrismaClient } from "@prisma/client";

import type {
  StorageAdapter,
  UploadCapableAdapter,
  ListOptions,
  ListResult,
  GetTreeOptions,
  GetTreeResult,
  StorageNode,
  StorageFolderNode,
  StorageFileNode,
  StorageMetadata,
  StorageMoveOperation,
  StoragePath,
} from "@contracts/storage";

import type { UploadDestination } from "@contracts/cloudinary/upload.types";

import { getR2Client, getR2Bucket } from "@backend/modules/storage/adapters/r2/client";
import { parsePathToDestination } from "@backend/modules/media/services/parsePathToDestination";

/**
 * r2StorageAdapter — implémentation Cloudflare R2 complète
 *
 * Phase 2 (tracking R2) : `registerUploadedAsset` crée maintenant une row
 * `MediaAsset` après le HeadObject de validation. Cela permet au finder, à
 * la searchbar et au tri par Date/Expéditeur de voir les fichiers R2 au
 * même titre que les Cloudinary.
 *
 * (Le reste de la doc d'architecture est inchangée par rapport à la v1 —
 * voir l'historique git pour les notes sur le modèle R2 sans dossiers,
 * la pagination, le presigned PUT etc.)
 */

/* -------------------------------------------------------------------------- */
/*  Types upload                                                              */
/* -------------------------------------------------------------------------- */

export type R2CreateUploadAuthorizationInput = {
  path: StoragePath;
  mimeType: string;
  maxBytes: number;
};

export type R2CreateUploadAuthorizationOutput = {
  uploadUrl: string;
  fields: Record<string, string>;
  expiresAt: string;
};

/**
 * Phase 2 : enrichi avec `destination` (categoryId + disciplineId|proposed)
 * et `originalFileName`. La destination est nécessaire pour créer la row
 * MediaAsset avec les bonnes FK. L'originalFileName aussi (sinon on devrait
 * deviner depuis le path, qui peut être slugifié et donc divergent).
 */
export type R2RegisterUploadedAssetInput = {
  path: StoragePath;
  userId: string;
  expectedBytes: number;
  expectedMimeType: string;
  destination: UploadDestination;
  originalFileName: string;
};

export type R2RegisterUploadedAssetOutput = {
  ok: true;
  path: StoragePath;
  bytes: number;
  mimeType: string;
  mediaAssetId: string;
};

/* -------------------------------------------------------------------------- */
/*  Type complet de l'adapter                                                 */
/* -------------------------------------------------------------------------- */

export type R2StorageAdapter = StorageAdapter &
  UploadCapableAdapter<
    R2CreateUploadAuthorizationInput,
    R2CreateUploadAuthorizationOutput,
    R2RegisterUploadedAssetInput,
    R2RegisterUploadedAssetOutput
  >;

export type R2StorageAdapterDeps = {
  prisma: PrismaClient;
  appRoot: string;
};

/* -------------------------------------------------------------------------- */
/*  Factory                                                                   */
/* -------------------------------------------------------------------------- */

export function createR2StorageAdapter(
  deps: R2StorageAdapterDeps
): R2StorageAdapter {
  const { prisma, appRoot } = deps;

  return {
    /* ====================================================================== */
    /*  Lecture                                                               */
    /* ====================================================================== */

    async list(options: ListOptions): Promise<ListResult> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();
      const Prefix = ensureTrailingSlash(options.path);

      const response = await s3.send(
        new ListObjectsV2Command({
          Bucket,
          Prefix,
          Delimiter: "/",
          MaxKeys: options.limit ?? 1000,
          ContinuationToken: options.cursor,
        })
      );

      const folders: StorageFolderNode[] = (response.CommonPrefixes ?? [])
        .map((cp) => cp.Prefix)
        .filter((p): p is string => Boolean(p))
        .map((fullPath) => {
          const normalizedPath = stripTrailingSlash(fullPath);
          return {
            type: "folder" as const,
            name: lastSegment(normalizedPath),
            path: normalizedPath,
            hasChildren: true,
          };
        });

      const files: StorageFileNode[] = (response.Contents ?? [])
        .filter(
          (obj): obj is S3Object & { Key: string } =>
            Boolean(obj.Key) && obj.Key !== Prefix
        )
        .map((obj) => objectToFileNode(obj));

      return {
        folders,
        files,
        nextCursor: response.NextContinuationToken ?? null,
      };
    },

    async getTree(options: GetTreeOptions): Promise<GetTreeResult> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();
      const depth = options.depth ?? 1;

      const root = await buildSubTree(s3, Bucket, options.path, depth);
      return { root };
    },

    async getNode(path: StoragePath): Promise<StorageNode | null> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();

      try {
        const head = await s3.send(
          new HeadObjectCommand({ Bucket, Key: path })
        );
        return {
          type: "file" as const,
          name: lastSegment(path),
          path,
          metadata: {
            bytes: head.ContentLength,
            updatedAt: head.LastModified?.toISOString(),
            mimeType: head.ContentType ?? inferMimeFromPath(path),
            format: extensionOf(path),
          },
        };
      } catch (err) {
        if (!isNotFoundError(err)) throw err;
      }

      const Prefix = ensureTrailingSlash(path);
      const list = await s3.send(
        new ListObjectsV2Command({
          Bucket,
          Prefix,
          Delimiter: "/",
          MaxKeys: 1,
        })
      );
      const hasAny =
        (list.Contents?.length ?? 0) > 0 ||
        (list.CommonPrefixes?.length ?? 0) > 0;

      if (!hasAny) return null;

      return {
        type: "folder" as const,
        name: lastSegment(path),
        path,
        hasChildren: true,
      };
    },

    async getMetadata(path: StoragePath): Promise<StorageMetadata | null> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();

      try {
        const head = await s3.send(
          new HeadObjectCommand({ Bucket, Key: path })
        );
        return {
          bytes: head.ContentLength,
          updatedAt: head.LastModified?.toISOString(),
          mimeType: head.ContentType ?? inferMimeFromPath(path),
          format: extensionOf(path),
        };
      } catch (err) {
        if (isNotFoundError(err)) return null;
        throw err;
      }
    },

    /* ====================================================================== */
    /*  Écriture                                                              */
    /* ====================================================================== */

    async move(operation: StorageMoveOperation): Promise<void> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();

      // Statut dérivé du premier segment du chemin cible (même logique
      // que l'adapter Cloudinary — le trou était identique ici).
      // Statut = segment APRÈS l'appRoot ([1] — les paths incluent l'appRoot).
      const topSegment = operation.target.path.split("/")[1];
      const nextStatus =
        topSegment === "pending" || topSegment === "published"
          ? topSegment
          : null;

      if (operation.source.type === "file") {
        await moveFile(s3, Bucket, operation.source.path, operation.target.path);

        // Phase 2 : on update aussi la row MediaAsset pour refléter le nouveau path
        await prisma.mediaAsset.updateMany({
          where: { appRoot, fullPath: operation.source.path },
          data: {
            fullPath: operation.target.path,
            ...(nextStatus ? { status: nextStatus } : {}),
          },
        });
        return;
      }

      await moveFolder(s3, Bucket, operation.source.path, operation.target.path);

      // Pour les folders : update tous les MediaAssets sous le préfixe.
      // On fait ça en SQL raw pour profiter du UPDATE...SET en une passe
      // (Prisma ne supporte pas REPLACE/SUBSTRING dans updateMany).
      const oldPrefix = `${operation.source.path}/`;
      const newPrefix = `${operation.target.path}/`;
      await prisma.$executeRaw`
        UPDATE "MediaAsset"
        SET "fullPath" = ${newPrefix} || SUBSTRING("fullPath" FROM ${oldPrefix.length + 1}::int),
            "status" = COALESCE(${nextStatus}, "status")
        WHERE "appRoot" = ${appRoot} AND "fullPath" LIKE ${oldPrefix + "%"};
      `;
    },

    async delete(path: StoragePath): Promise<void> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();

      await s3.send(new DeleteObjectCommand({ Bucket, Key: path }));
      await deleteAllUnderPrefix(s3, Bucket, path);

      // Phase 2 : nettoyer les MediaAssets DB correspondantes
      await prisma.mediaAsset.deleteMany({
        where: {
          appRoot,
          OR: [
            { fullPath: path },
            { fullPath: { startsWith: `${path}/` } },
          ],
        },
      });
    },

    /* ====================================================================== */
    /*  Upload                                                                */
    /* ====================================================================== */

    async createUploadAuthorization(
      input: R2CreateUploadAuthorizationInput
    ): Promise<R2CreateUploadAuthorizationOutput> {
      assertUploadPathSafe(input.path, appRoot);
      assertUploadConstraints(input);

      const s3 = getR2Client();
      const Bucket = getR2Bucket();
      const expiresInSeconds = 5 * 60;
      const expiresAtMs = Date.now() + expiresInSeconds * 1000;

      const command = new PutObjectCommand({
        Bucket,
        Key: input.path,
        ContentType: input.mimeType,
      });

      const uploadUrl = await getSignedUrl(s3, command, {
        expiresIn: expiresInSeconds,
      });

      return {
        uploadUrl,
        fields: {},
        expiresAt: new Date(expiresAtMs).toISOString(),
      };
    },

    /**
     * Phase 2 — créer la row MediaAsset après validation HeadObject.
     *
     * Pipeline :
     *   1. HeadObject pour confirmer l'existence + valider taille/mime
     *   2. Résoudre categoryId/disciplineId depuis input.destination
     *   3. Créer la row MediaAsset avec :
     *      - fullPath = input.path (clé universelle)
     *      - publicId/secureUrl/resourceType = null (concepts Cloudinary-only)
     *      - originalFileName = input.originalFileName
     *      - mimeType, bytes = depuis HeadObject (source de vérité serveur)
     *      - categoryId/disciplineId/proposedDisciplineName = depuis destination
     *      - uploaderUserId = input.userId (depuis ctx.user.id côté router)
     *      - status = 'pending' (les uploads atterrissent toujours en pending)
     */
    async registerUploadedAsset(
      input: R2RegisterUploadedAssetInput
    ): Promise<R2RegisterUploadedAssetOutput> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();

      // 1. HeadObject — confirme existence + sert de source de vérité
      const head = await s3
        .send(new HeadObjectCommand({ Bucket, Key: input.path }))
        .catch((err) => {
          if (isNotFoundError(err)) {
            throw new Error(
              `Upload introuvable sur R2 : ${input.path}. ` +
                `Le client a peut-être abandonné avant de finir l'upload.`
            );
          }
          throw err;
        });

      const actualBytes = head.ContentLength ?? 0;
      const actualMime = head.ContentType ?? "";

      if (actualBytes !== input.expectedBytes) {
        throw new Error(
          `Taille incohérente sur ${input.path} : ` +
            `attendu ${input.expectedBytes}, reçu ${actualBytes}.`
        );
      }
      if (actualMime !== input.expectedMimeType) {
        throw new Error(
          `MIME type incohérent sur ${input.path} : ` +
            `attendu "${input.expectedMimeType}", reçu "${actualMime}".`
        );
      }

      // 2. Résoudre destination → categoryId + disciplineId
      //
      // Cas existing-discipline : on a directement les FK.
      // Cas new-discipline : on garde proposedDisciplineName, disciplineId = null.
      let categoryId: number;
      let disciplineId: number | null = null;
      let proposedDisciplineName: string | null = null;

      if (input.destination.kind === "existing-discipline") {
        categoryId = input.destination.categoryId;
        disciplineId = input.destination.disciplineId;
      } else {
        // 'new-discipline'
        categoryId = input.destination.categoryId;
        proposedDisciplineName = input.destination.proposedDisciplineName;
      }

      // 3. Création de la MediaAsset.
      //
      // Idempotence : si l'user re-soumet le même fichier (même path),
      // la contrainte @unique sur fullPath bloque le create. On utilise
      // upsert pour faire évoluer la row existante plutôt que d'échouer.
      // C'est cohérent avec le comportement Cloudinary (re-upload écrase).
      const asset = await prisma.mediaAsset.upsert({
        where: { fullPath: input.path },
        create: {
          fullPath: input.path,
          publicId: null,
          secureUrl: null,
          resourceType: null,
          mimeType: actualMime,
          format: extensionOf(input.path),
          originalFileName: input.originalFileName,
          bytes: actualBytes,
          appRoot,
          status: "pending",
          categoryId,
          disciplineId,
          proposedDisciplineName,
          uploaderUserId: input.userId,
        },
        update: {
          mimeType: actualMime,
          bytes: actualBytes,
          originalFileName: input.originalFileName,
          // Pas de changement de catégorie/discipline sur re-upload (ce qui
          // serait peu intuitif — l'user qui re-soumet veut juste écraser).
          uploaderUserId: input.userId,
        },
      });

      return {
        ok: true as const,
        path: input.path,
        bytes: actualBytes,
        mimeType: actualMime,
        mediaAssetId: asset.id,
      };
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Helpers — listing récursif                                                */
/* -------------------------------------------------------------------------- */

async function buildSubTree(
  s3: S3Client,
  Bucket: string,
  path: string,
  depth: number
): Promise<StorageFolderNode> {
  const Prefix = ensureTrailingSlash(path);
  const normalizedPath = stripTrailingSlash(path);

  const response = await s3.send(
    new ListObjectsV2Command({
      Bucket,
      Prefix,
      Delimiter: "/",
      MaxKeys: 1000,
    })
  );

  const subPrefixes = (response.CommonPrefixes ?? [])
    .map((cp) => cp.Prefix)
    .filter((p): p is string => Boolean(p))
    .map(stripTrailingSlash);

  let subFolders: StorageFolderNode[];
  if (depth > 0) {
    subFolders = await Promise.all(
      subPrefixes.map((p) => buildSubTree(s3, Bucket, p, depth - 1))
    );
  } else {
    subFolders = subPrefixes.map((p) => ({
      type: "folder" as const,
      name: lastSegment(p),
      path: p,
      hasChildren: true,
    }));
  }

  const files: StorageFileNode[] = (response.Contents ?? [])
    .filter(
      (obj): obj is S3Object & { Key: string } =>
        Boolean(obj.Key) && obj.Key !== Prefix
    )
    .map((obj) => objectToFileNode(obj));

  const children: StorageNode[] = [...subFolders, ...files];

  return {
    type: "folder" as const,
    name: lastSegment(normalizedPath),
    path: normalizedPath,
    children,
    hasChildren: children.length > 0,
  };
}

function objectToFileNode(obj: S3Object & { Key: string }): StorageFileNode {
  return {
    type: "file" as const,
    name: lastSegment(obj.Key),
    path: obj.Key,
    metadata: {
      bytes: obj.Size,
      updatedAt: obj.LastModified?.toISOString(),
      mimeType: inferMimeFromPath(obj.Key),
      format: extensionOf(obj.Key),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Helpers — validation upload                                               */
/* -------------------------------------------------------------------------- */

const HARD_MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

function assertUploadPathSafe(path: string, appRoot: string): void {
  if (!path) throw new Error("createUploadAuthorization: path vide");
  if (path.startsWith("/")) throw new Error(`createUploadAuthorization: path ne doit pas commencer par "/" (reçu: "${path}")`);
  if (path.endsWith("/")) throw new Error(`createUploadAuthorization: path ne doit pas se terminer par "/" (reçu: "${path}")`);
  if (path.includes("..")) throw new Error(`createUploadAuthorization: segment ".." interdit (path traversal) dans "${path}"`);
  if (path.includes("//")) throw new Error(`createUploadAuthorization: "//" consécutifs interdits dans "${path}"`);
  if (!path.startsWith(`${appRoot}/`)) {
    throw new Error(
      `createUploadAuthorization: path doit commencer par "${appRoot}/" ` +
        `(reçu: "${path}"). Aucun upload hors de la racine applicative n'est autorisé.`
    );
  }
}

function assertUploadConstraints(input: R2CreateUploadAuthorizationInput): void {
  if (!input.mimeType || input.mimeType.length === 0) {
    throw new Error("createUploadAuthorization: mimeType requis");
  }
  if (input.maxBytes <= 0) {
    throw new Error(`createUploadAuthorization: maxBytes doit être > 0 (reçu: ${input.maxBytes})`);
  }
  if (input.maxBytes > HARD_MAX_UPLOAD_BYTES) {
    throw new Error(
      `createUploadAuthorization: maxBytes ${input.maxBytes} dépasse la limite ` +
        `dure de ${HARD_MAX_UPLOAD_BYTES} octets.`
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  Helpers — écriture                                                        */
/* -------------------------------------------------------------------------- */

async function moveFile(
  s3: S3Client,
  Bucket: string,
  srcKey: string,
  dstKey: string
): Promise<void> {
  await s3.send(
    new CopyObjectCommand({
      Bucket,
      Key: dstKey,
      CopySource: buildCopySource(Bucket, srcKey),
    })
  );
  await s3.send(new DeleteObjectCommand({ Bucket, Key: srcKey }));
}

async function moveFolder(
  s3: S3Client,
  Bucket: string,
  srcPath: string,
  dstPath: string
): Promise<void> {
  const srcPrefix = ensureTrailingSlash(srcPath);
  const dstPrefix = ensureTrailingSlash(dstPath);

  let continuationToken: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket,
        Prefix: srcPrefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      })
    );

    const objects = (response.Contents ?? []).filter(
      (o): o is S3Object & { Key: string } => Boolean(o.Key)
    );

    if (objects.length > 0) {
      await Promise.all(
        objects.map((obj) => {
          const relativeKey = obj.Key.slice(srcPrefix.length);
          const newKey = dstPrefix + relativeKey;
          return s3.send(
            new CopyObjectCommand({
              Bucket,
              Key: newKey,
              CopySource: buildCopySource(Bucket, obj.Key),
            })
          );
        })
      );

      await s3.send(
        new DeleteObjectsCommand({
          Bucket,
          Delete: {
            Objects: objects.map((o) => ({ Key: o.Key })),
            Quiet: true,
          },
        })
      );
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
}

async function deleteAllUnderPrefix(
  s3: S3Client,
  Bucket: string,
  path: string
): Promise<void> {
  const Prefix = ensureTrailingSlash(path);
  let continuationToken: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket,
        Prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      })
    );

    const objects = (response.Contents ?? []).filter(
      (o): o is S3Object & { Key: string } => Boolean(o.Key)
    );

    if (objects.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket,
          Delete: {
            Objects: objects.map((o) => ({ Key: o.Key })),
            Quiet: true,
          },
        })
      );
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
}

function buildCopySource(Bucket: string, srcKey: string): string {
  const encodedKey = srcKey.split("/").map(encodeURIComponent).join("/");
  return `${Bucket}/${encodedKey}`;
}

/* -------------------------------------------------------------------------- */
/*  Helpers — paths                                                           */
/* -------------------------------------------------------------------------- */

function lastSegment(path: string): string {
  const trimmed = stripTrailingSlash(path);
  const i = trimmed.lastIndexOf("/");
  return i === -1 ? trimmed : trimmed.slice(i + 1);
}

function stripTrailingSlash(path: string): string {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function ensureTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

function extensionOf(path: string): string | undefined {
  const name = lastSegment(path);
  const i = name.lastIndexOf(".");
  if (i === -1 || i === name.length - 1) return undefined;
  return name.slice(i + 1).toLowerCase();
}

/* -------------------------------------------------------------------------- */
/*  Helpers — MIME inference & error detection                                */
/* -------------------------------------------------------------------------- */

function inferMimeFromPath(path: string): string {
  const ext = extensionOf(path);
  if (!ext) return "application/octet-stream";

  switch (ext) {
    case "mp3": return "audio/mpeg";
    case "wav": return "audio/wav";
    case "ogg": return "audio/ogg";
    case "m4a": return "audio/mp4";
    case "flac": return "audio/flac";
    case "aac": return "audio/aac";
    case "opus": return "audio/opus";
    case "pdf": return "application/pdf";
    case "txt": return "text/plain";
    case "md":
    case "markdown": return "text/markdown";
    case "json": return "application/json";
    case "csv": return "text/csv";
    case "xml": return "application/xml";
    case "html": return "text/html";
    case "doc": return "application/msword";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls": return "application/vnd.ms-excel";
    case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt": return "application/vnd.ms-powerpoint";
    case "pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "zip": return "application/zip";
    case "tar": return "application/x-tar";
    case "gz": return "application/gzip";
    case "rar": return "application/vnd.rar";
    case "7z": return "application/x-7z-compressed";
    default: return "application/octet-stream";
  }
}

function isNotFoundError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
  if (e.name === "NotFound" || e.name === "NoSuchKey") return true;
  if (e.$metadata?.httpStatusCode === 404) return true;
  return false;
}
FILE_EOF

echo
pnpm --filter backend typecheck && pnpm --filter web typecheck