'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { trpc } from '@lib/trpcClient';
import { useIsMutating } from '@tanstack/react-query';

import { TreeView } from '@components/cloudinary-finder/TreeView/TreeView';
import FolderContentView from '@/components/cloudinary-finder/SelectedFolderContent/FolderContentView';
import { FilePreviewSidebar } from '@/components/cloudinary-finder/SelectedFolderContent/FilePreviewSidebar';
import BinRootView from '@/components/cloudinary-finder/SelectedFolderContent/BinRootView';
import TrashFolderView from '@/components/cloudinary-finder/SelectedFolderContent/TrashFolderView';
import { injectStatusRoots } from '@/components/cloudinary-finder/TreeView/injectStatusRoots';
import { FolderNode, FileNode } from '@/components/cloudinary-finder/types';

import { BreadCrumb } from '@/components/cloudinary-finder/SelectedFolderContent/BreadCrumb';
import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import AppTreeWrapper from '../TreeView/AppTreeWrapper';
import { canMove } from '@/server/cloudinary/move.guards';
import { useSelectionStore } from '@/lib/stores/useSelectionStore';
import MultiSelectSidebar from '../MultiSelect/MultiSelectSidebar';

import LoadingOverlay from '@/components/ui/LoadingOverlay';

const APP_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME || 'my-app';
const INITIAL_PATH = `${APP_SHORT_NAME}/pending`;

function normalizePath(p: string): string {
  return p.replace(/^\/+|\/+$/g, '');
}

function findFolderByPath(node: FolderNode, path: string): FolderNode | null {
  if (!node) return null;
  if (node.fullPath === path) return node;

  for (const child of node.children) {
    if (child.type === 'folder') {
      const found = findFolderByPath(child, path);
      if (found) return found;
    }
  }

  return null;
}

export default function FinderLayout() {
  const [currentPath, setCurrentPath] = useState(INITIAL_PATH);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  /**
   * Contexte de navigation dans un root trash (folder).
   * - null => navigation normale (tree)
   * - non null => on est dans `AKFC/bin/<displayName>/...` mais le backend navigue via trashId+relativePath.
   */
  const [trashCtx, setTrashCtx] = useState<{
    trashId: string;
    displayName: string;
    relativePath: string;
  } | null>(null);

  /**
   * Preview read-only pour les contenus issus de la corbeille.
   * Dans la preview, le tooltip doit afficher la provenance (previousPath).
   */
  const [trashPreviewMeta, setTrashPreviewMeta] = useState<{ previousPath: string } | null>(null);

  const multiSelectActive = useSelectionStore((state) => state.multiSelectActive);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  const treeRef = useRef<HTMLDivElement>(null);
  const explorerRef = useRef<HTMLDivElement>(null);
  const multiSelectSidebarRef = useRef<HTMLDivElement>(null);

  const { data: tree, isLoading, isError } =
    trpc.cloudinary.getFolderTree.useQuery({ path: APP_SHORT_NAME });

  const utils = trpc.useUtils();

  const move = trpc.cloudinary.move.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      clearSelection();
    },
    onError: (err) => {
      console.error('[move] failed:', err);
    },
  });

  const trashToBin = trpc.trash.trashToBin.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      await utils.trash.listBin.invalidate();
      clearSelection();
    },
    onError: (err) => console.error('[trashToBin] failed:', err),
  });

  const mutatingCount = useIsMutating();
  const showGlobalSpinner = mutatingCount > 0;

  const statusRoots = useMemo(() => {
    if (!tree) return [];
    return injectStatusRoots(tree);
  }, [tree]);

  const isVirtualPath = currentPath.startsWith('__virtual__/');

  const isBinRootPath = normalizePath(currentPath) === `${APP_SHORT_NAME}/bin`;

  const currentFolder = useMemo<FolderNode | null>(() => {
    if (!tree || isVirtualPath || trashCtx) return null;
    return findFolderByPath(tree, currentPath);
  }, [currentPath, isVirtualPath, tree, trashCtx]);

  /**
   * ✅ Bool UX: est-ce que le dossier courant (réel) a du contenu ?
   * - Si virtual path => false
   * - Si currentFolder null => false
   * - Sinon => children.length > 0
   */
  const currentFolderHasContent = !!currentFolder && currentFolder.children.length > 0;

  useEffect(() => {
    if (!multiSelectActive) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;

      const inTree = !!treeRef.current?.contains(target);
      const inExplorer = !!explorerRef.current?.contains(target);
      const inSidebar = !!multiSelectSidebarRef.current?.contains(target);

      if (!inTree && !inExplorer && !inSidebar) {
        clearSelection();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [multiSelectActive, clearSelection]);

  if (isLoading) return <div>Chargement…</div>;
  if (isError || !tree) return <div>Erreur</div>;

  function handleOpen(path: string) {
    setCurrentPath(path);
    setSelectedFile(null);
    setTrashPreviewMeta(null);
    setTrashCtx(null);
    clearSelection();
  }

  function handleMove(intent: MoveIntent) {
    if (!canMove(intent.source, intent.target)) {
      console.warn('[DnD] Move not allowed', intent);
      return;
    }

    // ✅ Drop vers bin => corbeille (trashToBin), pas un move status.
    if (intent.target.type === 'virtual-folder' && intent.target.status === 'bin') {
      const sources: Array<
        | { kind: 'file'; fullPath: string }
        | { kind: 'folder'; fullPath: string }
        | { kind: 'selection'; roots: string[] }
      > = [];

      if (intent.source.type === 'file') sources.push({ kind: 'file', fullPath: intent.source.fullPath });
      if (intent.source.type === 'folder') sources.push({ kind: 'folder', fullPath: intent.source.fullPath });
      if (intent.source.type === 'selection') sources.push({ kind: 'selection', roots: intent.source.roots });

      trashToBin.mutate({ appRoot: APP_SHORT_NAME, sources });
      setSelectedFile(null);
      setTrashPreviewMeta(null);
      return;
    }

    move.mutate(intent);
    setSelectedFile(null);
    setTrashPreviewMeta(null);
  }

  return (
    <>
      <LoadingOverlay show={showGlobalSpinner} label="Opération en cours…" />

      <div className="flex h-full border rounded-lg overflow-hidden">
        <aside ref={treeRef} className="w-72 border-r overflow-auto flex flex-col">
          <div
            className="flex-1"
            onMouseDown={(e) => {
              if (!multiSelectActive) return;
              if (e.target === e.currentTarget) clearSelection();
            }}
          >
            <AppTreeWrapper appName={APP_SHORT_NAME}>
              <TreeView
                roots={statusRoots}
                currentPath={currentPath}
                onOpen={handleOpen}
                onMove={handleMove}
              />
            </AppTreeWrapper>
          </div>
        </aside>

        <section ref={explorerRef} className="flex-1 overflow-auto p-4 relative">
          <BreadCrumb
            path={currentPath}
            onNavigate={(path) => {
              setCurrentPath(path);
              setSelectedFile(null);
              setTrashPreviewMeta(null);

              // Navigation breadcrumb :
              // - Si on clique sur `AKFC/bin` => on sort du trashCtx et on affiche la liste plate.
              // - Si on clique sur `AKFC/bin/<displayName>/...` => on ajuste relativePath.
              const normalized = normalizePath(path);
              const binRoot = `${APP_SHORT_NAME}/bin`;
              if (trashCtx) {
                if (normalized === binRoot) {
                  setTrashCtx(null);
                } else {
                  const base = `${binRoot}/${trashCtx.displayName}`;
                  if (normalized === base) {
                    setTrashCtx({ ...trashCtx, relativePath: '' });
                  } else if (normalized.startsWith(`${base}/`)) {
                    const rel = normalized.slice(base.length + 1);
                    setTrashCtx({ ...trashCtx, relativePath: rel });
                  }
                }
              }

              clearSelection();
            }}
          />

          {isVirtualPath ? (
            <div className="text-gray-500 italic">Vide</div>
          ) : isBinRootPath ? (
            <BinRootView
              appRoot={APP_SHORT_NAME}
              onOpenTrashFolder={({ trashId, displayName }) => {
                setTrashCtx({ trashId, displayName, relativePath: '' });
                setCurrentPath(`${APP_SHORT_NAME}/bin/${displayName}`);
                setSelectedFile(null);
                setTrashPreviewMeta(null);
                clearSelection();
              }}
              onSelectTrashFile={({ name, url, previousPath }) => {
                if (!url) {
                  alert('Preview indisponible (URL manquante).');
                  return;
                }
                // On réutilise FileNode pour la preview (read-only).
                setSelectedFile({ type: 'file', name, fullPath: `${APP_SHORT_NAME}/bin/${name}`, url });
                setTrashPreviewMeta({ previousPath });
              }}
            />
          ) : trashCtx ? (
            <TrashFolderView
              appRoot={APP_SHORT_NAME}
              trashId={trashCtx.trashId}
              relativePath={trashCtx.relativePath}
              onOpenRelativeFolder={(nextRel) => {
                setTrashCtx({ ...trashCtx, relativePath: nextRel });
                setCurrentPath(`${APP_SHORT_NAME}/bin/${trashCtx.displayName}/${nextRel}`);
                setSelectedFile(null);
                setTrashPreviewMeta(null);
                clearSelection();
              }}
              onSelectTrashFile={(file) => {
                setSelectedFile({
                  type: 'file',
                  name: file.name,
                  fullPath: `${APP_SHORT_NAME}/bin/${trashCtx.displayName}/${trashCtx.relativePath}/${file.name}`,
                  url: file.url,
                });
                setTrashPreviewMeta({ previousPath: file.previousPath });
              }}
            />
          ) : currentFolder ? (
            <FolderContentView
              folder={currentFolder}
              onOpenFolder={(path) => {
                if (multiSelectActive) return;
                setCurrentPath(path);
                setSelectedFile(null);
                setTrashPreviewMeta(null);
              }}
              onSelectFile={(file) => {
                if (multiSelectActive) return;
                setSelectedFile(file);
                setTrashPreviewMeta(null);
              }}
              onMove={handleMove}
            />
          ) : (
            <div className="text-gray-500">Dossier vide</div>
          )}
        </section>

        {selectedFile && !multiSelectActive && (
          <aside className="w-96 border-l bg-white">
            <FilePreviewSidebar
              file={selectedFile}
              readOnly={!!trashPreviewMeta}
              onClose={() => {
                setSelectedFile(null);
                setTrashPreviewMeta(null);
              }}
            />

            {trashPreviewMeta && (
              <div className="px-4 pb-4 text-xs text-gray-500">
                <div className="font-medium text-gray-700">Provenance</div>
                <div className="truncate" title={trashPreviewMeta.previousPath}>
                  {trashPreviewMeta.previousPath}
                </div>
              </div>
            )}
          </aside>
        )}

        {multiSelectActive && (
          <aside ref={multiSelectSidebarRef} className="w-80 border-l bg-white">
            <MultiSelectSidebar
              currentPath={currentPath}
              /**
               * ✅ Nouvelle sécurité UX:
               * le bouton "Supprimer définitivement" n'apparaît
               * que si le dossier courant réel a du contenu.
               */
              currentFolderHasContent={currentFolderHasContent}
            />
          </aside>
        )}
      </div>
    </>
  );
}