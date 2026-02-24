// src/components/cloudinary-finder/TreeView/TreeView.tsx
'use client';

import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import type { RootNode, FolderNode } from '../types';

import VirtualFolderNodeComponent from '@components/cloudinary-finder/TreeView/VirtualFolderNodeComponent';
import FolderNodeComponent from '@/components/cloudinary-finder/TreeView/FolderNodeComponent';

import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import { useSelectionStore } from '@/lib/stores/useSelectionStore';

type Props = {
  roots: RootNode[];
  currentPath: string;
  onOpen: (path: string) => void;
  onMove: (intent: MoveIntent) => void;
};

/**
 * ✅ Collecte toutes les clés de folders du tree (fullPath).
 * Utilisé pour "tout ouvrir" en multi-select.
 */
function collectAllFolderPaths(roots: RootNode[]): string[] {
  const acc: string[] = [];

  function walkFolder(folder: FolderNode) {
    acc.push(folder.fullPath);

    for (const child of folder.children) {
      if (child.type === 'folder') {
        walkFolder(child);
      }
    }
  }

  for (const node of roots) {
    if (node.type === 'folder') {
      walkFolder(node);
    }
  }

  return acc;
}

export function TreeView({ roots, currentPath, onOpen, onMove }: Props): JSX.Element {
  const multiSelectActive = useSelectionStore((s) => s.multiSelectActive);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  /**
   * ✅ State centralisé pour l’ouverture des folders du Tree.
   * On stocke les fullPath ouverts.
   */
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => new Set());

  /**
   * ✅ Backup/restauration : on mémorise l’état "normal"
   * avant d’entrer en multi-select, puis on le restaure à la sortie.
   */
  const openBackupRef = useRef<Set<string> | null>(null);

  const allFolderPaths = useMemo(() => collectAllFolderPaths(roots), [roots]);

  useEffect(() => {
    if (multiSelectActive) {
      // Backup une seule fois à l'entrée
      if (!openBackupRef.current) {
        openBackupRef.current = new Set(openFolders);
      }

      // ✅ Tout ouvrir
      setOpenFolders(new Set(allFolderPaths));
    } else {
      // ✅ Restaurer si on avait un backup
      if (openBackupRef.current) {
        setOpenFolders(openBackupRef.current);
        openBackupRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiSelectActive, allFolderPaths]);

  function toggleFolder(path: string) {
    // En multi-select : pas de toggle
    if (multiSelectActive) return;

    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  return (
    <div
      className="space-y-1"
      /**
       * ✅ UX : sortir du multiselect UNIQUEMENT si clic "dans le vide" du panneau Tree.
       * On considère comme "pas le vide" tout élément qui est dans un item marqué data-tree-item="true".
       *
       * Pourquoi capture ?
       * - pour attraper le clic tôt, mais
       * - comme tes checkboxes stopPropagation + closest() protège, ça ne sort pas du multiselect
       *   quand tu cliques un item.
       */
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
              /**
               * Si ton VirtualFolderNodeComponent rend une ligne clickable,
               * assure-toi qu'il met data-tree-item="true" dessus.
               */
              // multiSelectActive={multiSelectActive}
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
          />
        );
      })}
    </div>
  );
}