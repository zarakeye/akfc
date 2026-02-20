// src/components/cloudinary-finder/TreeView/TreeView.tsx
'use client';

import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import type { RootNode, FolderNode } from '../types';
import VirtualFolderNodeComponent from '@components/cloudinary-finder/TreeView/VirtualFolderNodeComponent';
import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import FolderNodeComponent from '@/components/cloudinary-finder/TreeView/FolderNodeComponent';
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

export function TreeView({
  roots,
  currentPath,
  onOpen,
  onMove,
}: Props): JSX.Element {
  const multiSelectActive = useSelectionStore((s) => s.multiSelectActive);

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
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }

  return (
    <div className="space-y-1">
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
               * ✅ Nouveau : TreeView informe les nodes du mode multi-select
               * pour qu’ils masquent leurs chevrons/affichages
               */
              multiSelectActive={multiSelectActive}
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
            /**
             * ✅ Nouveau : open contrôlé par TreeView
             */
            isOpen={openFolders.has(node.fullPath)}
            onToggleOpen={() => toggleFolder(node.fullPath)}
            /**
             * ✅ Nouveau : masque chevrons en multi-select
             */
            multiSelectActive={multiSelectActive}
            /**
             * ✅ Nouveau : openFolders partagé pour récursivité
             */
            openFolders={openFolders}
            setOpenFolders={setOpenFolders}
          />
        );
      })}
    </div>
  );
}
