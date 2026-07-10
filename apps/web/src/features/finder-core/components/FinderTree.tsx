'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

import type { FinderNode } from '@contracts/finder';
import type { FileAdapter } from '@contracts/finder';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';

import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';

import FinderTreeFolder from './FinderTreeFolder';
import FinderTreeFile from './FinderTreeFile';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import {
  TrashMapProvider,
  type TrashMap,
} from '@features/finder-core/state/TrashMapContext';

/**
 * FinderTree — composant racine de la TreeView du finder.
 * (Doc de chargement progressif / high-water mark inchangée — cf. historique.)
 *
 * ─── Mode picker (panier) ─────────────────────────────────────────────────
 * Reçoit `pickMode`/`isInCart`/`onPickToggle` et les propage à toute la
 * récursion (FinderTreeFolder → FinderTreeFile). En pickMode, les fichiers de
 * l'arbre deviennent pickables, branchés sur le MÊME store que la grille via
 * MediaPicker → synchro grille↔arbre automatique.
 */

const INITIAL_TREE_DEPTH = 2;

function levelBelowRoot(path: string, rootPath: string): number {
  if (path === rootPath) return 0;
  const prefix = `${rootPath}/`;
  const rel = path.startsWith(prefix) ? path.slice(prefix.length) : path;
  return rel.split('/').filter(Boolean).length;
}

function pruneTreeFiles(
  node: FinderNode,
  predicate: (n: FinderNode) => boolean,
): FinderNode {
  if (node.type !== 'folder' || node.children === undefined) return node;
  const children = node.children
    .filter((c) => c.type === 'folder' || predicate(c))
    .map((c) => pruneTreeFiles(c, predicate));
  return { ...node, children };
}

type Props = {
  adapter: FileAdapter;
  rootPath: string;
  currentPath: string;
  onOpen: (path: string) => void;
  onItemDragStart?: (e: React.DragEvent, node: FinderNode) => void;
  onItemLongPress?: (node: FinderNode) => void;
  fileFilter?: (node: FinderNode) => boolean;
  /**
   * Mode picker (panier) — propagé aux items de l'arbre. En pickMode, un clic
   * sur un FICHIER l'épingle/retire du panier (au lieu de naviguer/sélectionner).
   * Branché sur le même store que la grille → synchro automatique. Optionnel.
   */
  pickMode?: boolean;
  /** En pickMode : ce path est-il dans le panier ? Propagé aux fichiers. */
  isInCart?: (path: string) => boolean;
  /** En pickMode : épingle/retire un fichier (délégué au store panier). */
  onPickToggle?: (node: FinderNode) => void;
};

export default function FinderTree({
  adapter,
  rootPath,
  currentPath,
  onOpen,
  onItemDragStart,
  onItemLongPress,
  fileFilter,
  pickMode = false,
  isInCart,
  onPickToggle,
}: Props) {
  const [rootNode, setRootNode] = useState<FinderNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [openPaths, setOpenPaths] = useState<Set<string>>(() => new Set());

  const [treeDepth, setTreeDepth] = useState(INITIAL_TREE_DEPTH);

  function toggleOpen(path: string) {
    setOpenPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  const { data: trashListData } = trpc.trash.listBin.useQuery(
    { appRoot: APP_ROOT, limit: 100 },
    { refetchOnWindowFocus: false, staleTime: 10_000 }
  );

  const reloadKey = useFinderStore((s) => s.reloadKey);

  const trashMap: TrashMap = useMemo(() => {
    const map = new Map() as TrashMap;
    const items: TrashEntryDTO[] = trashListData?.items ?? [];
    for (const entry of items) {
      map.set(entry.id, { displayName: entry.displayName, kind: entry.kind });
    }
    return map;
  }, [trashListData]);

  const supportsTree = typeof adapter.getTree === 'function';

  const [prevDeps, setPrevDeps] = useState({ rootPath, adapter });

  const rootChanged =
    prevDeps.rootPath !== rootPath || prevDeps.adapter !== adapter;

  if (rootChanged) {
    setPrevDeps({ rootPath, adapter });
    setIsLoading(true);
    setLoadError(null);
    setTreeDepth(INITIAL_TREE_DEPTH);
    setOpenPaths(new Set());
  }

  if (!rootChanged) {
    let deepest = 0;
    for (const p of openPaths) {
      const lvl = levelBelowRoot(p, rootPath);
      if (lvl > deepest) deepest = lvl;
    }
    const needed = deepest + 2;
    if (needed > treeDepth) {
      setTreeDepth(needed);
    }
  }

  useEffect(() => {
    let cancelled = false;

    if (!adapter.getTree) {
      return;
    }

    adapter
      .getTree({ path: rootPath, depth: treeDepth })
      .then(({ root }) => {
        if (cancelled) return;
        const visibleRoot = fileFilter ? pruneTreeFiles(root, fileFilter) : root;
        setRootNode(visibleRoot);

        const cacheChildrenAt = useFinderStore.getState().cacheChildrenAt;
        function walk(node: FinderNode) {
          if (node.type === 'folder' && node.children !== undefined) {
            cacheChildrenAt(node.path, node.children);
            for (const child of node.children) {
              walk(child);
            }
          }
        }
        walk(visibleRoot);
      })
      .catch((err) => {
        console.error('[FinderTree] getTree failed', err);
        if (cancelled) return;
        setLoadError('Erreur de chargement de l\'arborescence');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adapter, rootPath, reloadKey, treeDepth, fileFilter]);

  if (!supportsTree) {
    return (
      <div className="px-2 py-2 text-sm text-destructive" role="alert">
        Adapter sans getTree — la TreeView ne peut pas s&apos;afficher
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Chargement de l&apos;arborescence...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="px-2 py-2 text-sm text-destructive" role="alert">
        {loadError}
      </div>
    );
  }

  if (!rootNode || !rootNode.children || rootNode.children.length === 0) {
    return (
      <div className="px-2 py-2 text-sm text-muted-foreground italic">
        Aucun élément
      </div>
    );
  }

  const topLevelChildren = rootNode.children;

  return (
    <TrashMapProvider value={trashMap}>
      <div className="space-y-0.5">
        {topLevelChildren.map((child) =>
          child.type === 'folder' ? (
            <FinderTreeFolder
              key={child.path}
              node={child}
              adapter={adapter}
              currentPath={currentPath}
              onOpen={onOpen}
              openPaths={openPaths}
              onToggleOpen={toggleOpen}
              onDragStart={onItemDragStart}
              onLongPress={onItemLongPress}
              pickMode={pickMode}
              isInCart={isInCart}
              onPickToggle={onPickToggle}
            />
          ) : (
            <FinderTreeFile
              key={child.path}
              node={child}
              onDragStart={onItemDragStart}
              onLongPress={onItemLongPress}
              pickMode={pickMode}
              isInCart={isInCart}
              onPickToggle={onPickToggle}
            />
          ),
        )}
      </div>
    </TrashMapProvider>
  );
}