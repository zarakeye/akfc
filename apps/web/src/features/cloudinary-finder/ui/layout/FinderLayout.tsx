'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { trpc } from '@trpc/trpcClient';

import { TreeView } from '@features/cloudinary-finder/ui/tree/TreeView';
import FolderContentView from '@features/cloudinary-finder/ui/content/FolderContentView';
import { FilePreviewSidebar } from '@features/cloudinary-finder/ui/preview/FilePreviewSidebar';
import BinRootView from '@features/cloudinary-finder/ui/trash/bin/BinRootView';
import TrashFolderView from '@features/cloudinary-finder/ui/trash/navigator/TrashFolderView';
import { injectStatusRoots } from '@features/cloudinary-finder/utils/mapping/injectStatusRoots';

import type { FolderNode, FileNode } from '@contracts/cloudinary/finder.types';
import { BreadCrumb } from '@features/cloudinary-finder/ui/breadcrumb/BreadCrumb';
import type { MoveIntent } from '@contracts/cloudinary/move.schema';

import AppTreeWrapper from '../tree/AppTreeWrapper';
import { canMove } from '@backend/modules/cloudinary/move.guards';
import { useSelectionStore } from '@features/cloudinary-finder/state/selection/useSelectionStore';
import MultiSelectSidebar from '@features/cloudinary-finder/ui/multiSelect/MultiSelectSidebar';

import LoadingOverlay from '@components/ui/LoadingOverlay';

const APP_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME || 'my-app';
const INITIAL_PATH = `${APP_SHORT_NAME}`;

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

function isEditableTarget(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (el.isContentEditable) return true;
  return false;
}

export default function FinderLayout() {
  const [currentPath, setCurrentPath] = useState(INITIAL_PATH);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  const [trashCtx, setTrashCtx] = useState<{
    trashId: string;
    displayName: string;
    relativePath: string;
  } | null>(null);

  const [trashPreviewMeta, setTrashPreviewMeta] = useState<{ previousPath: string } | null>(null);

  const multiSelectActive = useSelectionStore((s) => s.multiSelectActive);
  const clearNormalSelection = useSelectionStore((s) => s.clearNormalSelection);

  const binMultiSelectActive = useSelectionStore((s) => s.binMultiSelectActive);
  const clearBinSelection = useSelectionStore((s) => s.clearBinSelection);

  const treeRef = useRef<HTMLDivElement>(null);
  const explorerRef = useRef<HTMLDivElement>(null);
  const multiSelectSidebarRef = useRef<HTMLDivElement>(null);

  const { data: tree, isLoading, isError } =
    trpc.cloudinary.getFolderTree.useQuery({ path: APP_SHORT_NAME });

  const utils = trpc.useUtils();

  const move = trpc.cloudinary.move.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      clearNormalSelection();
      clearBinSelection();
    },
    onError: (err) => {
      console.error('[move] failed:', err);
    },
  });

  const trashToBin = trpc.trash.trashToBin.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      await utils.trash.listBin.invalidate();
      clearNormalSelection();
      clearBinSelection();
    },
    onError: (err) => console.error('[trashToBin] failed:', err),
  });

  const showGlobalSpinner = move.isPending || trashToBin.isPending;

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

  const currentFolderHasContent = !!currentFolder && currentFolder.children.length > 0;

  useEffect(() => {
    const active = multiSelectActive || binMultiSelectActive;
    if (!active) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;

      const inTree = !!treeRef.current?.contains(target);
      const inExplorer = !!explorerRef.current?.contains(target);
      const inSidebar = !!multiSelectSidebarRef.current?.contains(target);

      if (!inTree && !inExplorer && !inSidebar) {
        clearNormalSelection();
        clearBinSelection();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [multiSelectActive, binMultiSelectActive, clearNormalSelection, clearBinSelection]);

  useEffect(() => {
    const active = multiSelectActive || binMultiSelectActive;
    if (!active) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (isEditableTarget(e.target)) return;

      e.preventDefault();
      clearNormalSelection();
      clearBinSelection();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [multiSelectActive, binMultiSelectActive, clearNormalSelection, clearBinSelection]);

  if (isLoading) return <div>Chargement…</div>;
  if (isError || !tree) return <div>Erreur</div>;

  function handleOpen(path: string) {
    setCurrentPath(path);
    setSelectedFile(null);
    setTrashPreviewMeta(null);
    setTrashCtx(null);

    clearNormalSelection();
    clearBinSelection();
  }

  function handleMove(intent: MoveIntent) {
    if (!canMove(intent.source, intent.target)) {
      console.warn('[DnD] Move not allowed', intent);
      return;
    }

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
              if (!(multiSelectActive || binMultiSelectActive)) return;
              if (e.target === e.currentTarget) {
                clearNormalSelection();
                clearBinSelection();
              }
            }}
          >
            <AppTreeWrapper appName={APP_SHORT_NAME}>
              <TreeView
                roots={statusRoots}
                currentPath={currentPath}
                onOpen={handleOpen}
                onMove={handleMove}
                appRoot={APP_SHORT_NAME}
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

              clearNormalSelection();
              clearBinSelection();
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
                clearNormalSelection();
                clearBinSelection();
              }}
              onSelectTrashFile={({ name, publicId, previousPath }) => {
                if (!publicId) {
                  alert('Preview indisponible (publicId manquant).');
                  return;
                }

                setSelectedFile({
                  type: 'file',
                  name,
                  fullPath: `${APP_SHORT_NAME}/bin/${name}`,
                  publicId,
                });

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
                clearNormalSelection();
                clearBinSelection();
              }}
              onSelectTrashFile={(file) => {
                setSelectedFile({
                  type: 'file',
                  name: file.name,
                  fullPath: `${APP_SHORT_NAME}/bin/${trashCtx.displayName}/${trashCtx.relativePath}/${file.name}`,
                  publicId: file.publicId,
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

        {selectedFile && !multiSelectActive && !binMultiSelectActive && (
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

        {(multiSelectActive || binMultiSelectActive) && (
          <aside ref={multiSelectSidebarRef} className="w-80 border-l bg-white">
            <MultiSelectSidebar
              currentPath={currentPath}
              currentFolderHasContent={currentFolderHasContent}
            />
          </aside>
        )}
      </div>
    </>
  );
}