'use client';

import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import type { RootNode, FolderNode } from '../../model/explorer/finder-ui.types';

import VirtualFolderNodeComponent from '@/features/cloudinary-finder/ui/tree/VirtualFolderNodeComponent';
import FolderNodeComponent from '@/features/cloudinary-finder/ui/tree/FolderNodeComponent';

import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import { useSelectionStore } from '@/features/cloudinary-finder/state/selection/useSelectionStore';

import { trpc } from '@/lib/trpcClient';

import {
  basenamePath,
  type TrashMap,
  type TrashEntryUi,
} from '@/features/cloudinary-finder/utils/binTrashUI';

import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/server/trpc';

type Props = {
  roots: RootNode[];
  currentPath: string;
  onOpen: (path: string) => void;
  onMove: (intent: MoveIntent) => void;
  appRoot: string;
};

function normalizePath(p: string) {
  return p.replace(/^\/+|\/+$/g, '');
}

function collectAllFolderPaths(roots: RootNode[]): string[] {
  const acc: string[] = [];

  function walkFolder(folder: FolderNode) {
    acc.push(folder.fullPath);
    for (const child of folder.children) {
      if (child.type === 'folder') walkFolder(child);
    }
  }

  for (const node of roots) {
    if (node.type === 'folder') walkFolder(node);
  }

  return acc;
}

function isInBinUi(currentPath: string) {
  const p = normalizePath(currentPath);
  return p.includes('/bin') && (p.endsWith('/bin') || p.includes('/bin/'));
}

type RouterOutputs = inferRouterOutputs<AppRouter>;
type ListBinOutput = RouterOutputs['trash']['listBin'];

type TrashItem =
  ListBinOutput extends { items: (infer T)[] }
    ? T
    : ListBinOutput extends { entries: (infer T)[] }
      ? T
      : never;

function extractTrashItems(data: ListBinOutput | undefined): TrashItem[] {
  if (!data) return [];

  if ('items' in data && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: TrashItem[] }).items;
  }

  if ('entries' in data && Array.isArray((data as { entries?: unknown }).entries)) {
    return (data as { entries: TrashItem[] }).entries;
  }

  return [];
}

export function TreeView({ roots, currentPath, onOpen, onMove, appRoot }: Props): JSX.Element {
  const multiSelectActive = useSelectionStore((s) => s.multiSelectActive);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  const [openFolders, setOpenFolders] = useState<Set<string>>(() => new Set());
  const openBackupRef = useRef<Set<string> | null>(null);

  const allFolderPaths = useMemo(() => collectAllFolderPaths(roots), [roots]);

  useEffect(() => {
    if (multiSelectActive) {
      if (!openBackupRef.current) openBackupRef.current = new Set(openFolders);
      setOpenFolders(new Set(allFolderPaths));
    } else {
      if (openBackupRef.current) {
        setOpenFolders(openBackupRef.current);
        openBackupRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiSelectActive, allFolderPaths]);

  function toggleFolder(path: string) {
    if (multiSelectActive) return;

    setOpenFolders((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }

  const inBin = useMemo(() => isInBinUi(currentPath), [currentPath]);

  /**
   * ✅ IMPORTANT:
   * - `limit` doit respecter le schema (max 100) sinon 400.
   * - ne PAS passer `search: undefined` pour éviter "undefined" sérialisé.
   */
  const listBin = trpc.trash.listBin.useQuery(
    {
      appRoot,
      limit: 100,
      cursor: null,
      // search: undefined, // ❌ ne pas envoyer
    },
    {
      staleTime: 20_000,
      refetchOnWindowFocus: false,
    }
  );

  const allTrashItems = useMemo<TrashItem[]>(() => {
    return extractTrashItems(listBin.data as ListBinOutput | undefined);
  }, [listBin.data]);

  /**
   * ✅ Map utilisée UNIQUEMENT en contexte bin (masques .trash + labels)
   */
  const trashMap: TrashMap | undefined = useMemo(() => {
    if (!inBin) return undefined;

    const map: TrashMap = new Map();

    for (const e of allTrashItems) {
      const ui: TrashEntryUi = {
        id: e.id,
        previousPath: e.previousPath,
        displayName: basenamePath(e.previousPath),
      };
      map.set(ui.id, ui);
    }

    return map;
  }, [inBin, allTrashItems]);

  /**
   * ✅ Bin pleine/vide : calcul basé sur listBin même hors bin
   */
  const binHasItems = allTrashItems.length > 0;

  // 🔎 Logs conservés pour valider le fix (tu peux les enlever ensuite)
  useEffect(() => {
    const binNode = roots.find((n) => n.fullPath === `${appRoot}/bin`);
    // eslint-disable-next-line no-console
    console.log('[TreeView][BIN DEBUG]', {
      appRoot,
      currentPath,
      inBin,
      listBinStatus: {
        isLoading: listBin.isLoading,
        isFetching: listBin.isFetching,
        isError: listBin.isError,
        hasData: Boolean(listBin.data),
      },
      trashCount: allTrashItems.length,
      binHasItems,
      binNodeType: binNode ? binNode.type : 'MISSING',
      binNodeFullPath: binNode?.fullPath ?? null,
      binNodeName: binNode?.name ?? null,
    });
  }, [
    appRoot,
    currentPath,
    inBin,
    roots,
    listBin.isLoading,
    listBin.isFetching,
    listBin.isError,
    listBin.data,
    allTrashItems.length,
    binHasItems,
  ]);

  return (
    <div
      className="space-y-1"
      onMouseDownCapture={(e) => {
        if (!multiSelectActive) return;

        const el = e.target as Element | null;
        if (!el) return;

        const insideTreeItem = el.closest('[data-tree-item="true"]');
        if (!insideTreeItem) clearSelection();
      }}
    >
      {roots.map((node) => {
        if (node.type === 'virtual-folder') {
          return (
            <VirtualFolderNodeComponent
              key={node.fullPath}
              node={node}
              currentPath={currentPath}
              onOpen={onOpen}
              onMove={onMove}
            />
          );
        }

        return (
          <FolderNodeComponent
            key={node.fullPath}
            folder={node}
            currentPath={currentPath}
            onOpen={onOpen}
            onMove={onMove}
            isOpen={openFolders.has(node.fullPath)}
            onToggleOpen={() => toggleFolder(node.fullPath)}
            multiSelectActive={multiSelectActive}
            openFolders={openFolders}
            setOpenFolders={setOpenFolders}
            trashMap={trashMap}
            binHasItems={binHasItems}
          />
        );
      })}
    </div>
  );
}