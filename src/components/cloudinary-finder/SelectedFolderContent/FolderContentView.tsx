'use client';

import React, { JSX, useEffect, useMemo } from 'react';
import { skipToken } from '@tanstack/react-query';

import { FolderNode, FileNode } from '@/components/cloudinary-finder/types';
import { isFileNode, isFolderNode } from '@components/cloudinary-finder/guards';

import type { DragSource } from '@/shared/cloudinary/move.types';
import type { MoveIntent } from '@/server/cloudinary/schemas/move.schema';

import GridFolderItem from '@/components/cloudinary-finder/SelectedFolderContent/GridFolderItem';
import GridFileItem from '@/components/cloudinary-finder/SelectedFolderContent/GridFileItem';

import { useSelectionStore } from '@/lib/stores/useSelectionStore';
import { trpc } from '@/lib/trpcClient';

import BinGridFolderItem from '@/components/cloudinary-finder/SelectedFolderContent/BinGridFolderItem';
import BinGridFileItem from '@/components/cloudinary-finder/SelectedFolderContent/BinGridFileItem';

type Props = {
  folder: FolderNode;
  onOpenFolder: (path: string) => void;
  onSelectFile?: (file: FileNode) => void;
  onMove: (intent: MoveIntent) => void;

  onOpenTrashEntry?: (trashId: string) => void;
};

function normalizePath(p: string): string {
  return p.replace(/^\/+|\/+$/g, '');
}

function isInBinTree(path: string): boolean {
  const p = normalizePath(path);
  return p.endsWith('/bin') || p.includes('/bin/');
}

function isBinRootPath(path: string): boolean {
  return normalizePath(path).endsWith('/bin');
}

function getAppRootFromPath(path: string): string {
  return normalizePath(path).split('/')[0] ?? '';
}

export default function FolderContentView({
  folder,
  onOpenFolder,
  onSelectFile,
  onMove,
  onOpenTrashEntry,
}: Props): JSX.Element {
  const subFolders = folder.children.filter(isFolderNode);
  const files = folder.children.filter(isFileNode);

  // NORMAL
  const multiSelectActive = useSelectionStore((s) => s.multiSelectActive);
  const clearNormalSelection = useSelectionStore((s) => s.clearNormalSelection);

  // BIN
  const binMultiSelectActive = useSelectionStore((s) => s.binMultiSelectActive);
  const binSelection = useSelectionStore((s) => s.binSelection);
  const clearBinSelection = useSelectionStore((s) => s.clearBinSelection);

  const utils = trpc.useUtils();

  const inBin = isInBinTree(folder.fullPath);
  const isBinRoot = isBinRootPath(folder.fullPath);
  const canBinMultiSelect = inBin && isBinRoot;

  const appRoot = useMemo(() => getAppRootFromPath(folder.fullPath), [folder.fullPath]);

  // Anti-états résiduels
  useEffect(() => {
    if (inBin && multiSelectActive) clearNormalSelection();
    if (!inBin && binMultiSelectActive) clearBinSelection();
  }, [inBin, multiSelectActive, binMultiSelectActive, clearNormalSelection, clearBinSelection]);

  // Bin: multiselect uniquement à la racine
  useEffect(() => {
    if (inBin && !isBinRoot && binMultiSelectActive) {
      clearBinSelection();
    }
  }, [inBin, isBinRoot, binMultiSelectActive, clearBinSelection]);

  const listBinQueryInput = useMemo(() => {
    if (!inBin) return skipToken;
    return {
      appRoot,
      limit: 100,
      cursor: null as string | null,
      search: undefined as string | undefined,
    };
  }, [inBin, appRoot]);

  const listBin = trpc.trash.listBin.useQuery(listBinQueryInput, {
    enabled: inBin,
    refetchOnWindowFocus: false,
    staleTime: 5_000,
  });

  const trashItems = useMemo(() => {
    if (!inBin) return [];
    return listBin.data?.items ?? [];
  }, [inBin, listBin.data]);

  // BIN actions
  const selectedTrashIds = useMemo(() => Array.from(binSelection), [binSelection]);
  const hasBinSelection = selectedTrashIds.length > 0;

  const deleteForever = trpc.trash.deleteForever.useMutation({
    onSuccess: async () => {
      await utils.trash.listBin.invalidate();
      await utils.cloudinary.getFolderTree.invalidate();
      clearBinSelection();
    },
    onError: (err) => console.error('[trash.deleteForever] failed:', err),
  });

  async function handleEmptyBin() {
    const ok = confirm('⚠️ Vider la corbeille ?\n\nTout le contenu sera supprimé définitivement.');
    if (!ok) return;

    const allIds: string[] = [];
    let cursor: string | null | undefined = null;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await utils.trash.listBin.fetch({
        appRoot,
        limit: 100,
        cursor,
        search: undefined,
      });

      allIds.push(...res.items.map((x) => x.id));
      if (!res.nextCursor) break;
      cursor = res.nextCursor;
    }

    if (allIds.length === 0) {
      alert('La corbeille est déjà vide.');
      return;
    }

    deleteForever.mutate({ appRoot, ids: allIds });
  }

  async function handleDeleteSelection() {
    if (!hasBinSelection) return;

    const ok = confirm('⚠️ Supprimer définitivement la sélection ?\n\nCette action est irréversible.');
    if (!ok) return;

    deleteForever.mutate({ appRoot, ids: selectedTrashIds });
  }

  // Normal (non-bin) drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (inBin) return;

    const raw = e.dataTransfer.getData('application/cloudinary');
    if (!raw) return;

    const source: DragSource = JSON.parse(raw);

    const intent: MoveIntent = {
      source,
      target: {
        type: 'folder',
        fullPath: folder.fullPath,
      },
    };

    onMove(intent);
  };

  const activeMultiSelect = inBin ? binMultiSelectActive : multiSelectActive;

  return (
    <div
      className="space-y-6 min-h-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onMouseDownCapture={(e) => {
        // ✅ sortir du multiselect en cliquant dans le vide
        if (!activeMultiSelect) return;

        const el = e.target as Element | null;
        if (!el) return;

        // ✅ ne pas clear quand on clique sur les contrôles (toolbar etc)
        if (el.closest('[data-no-clear-multiselect="true"]')) return;

        const insideItem = el.closest('[data-content-item="true"]');
        if (insideItem) return;

        if (inBin) clearBinSelection();
        else clearNormalSelection();
      }}
    >
      {inBin ? (
        <>
          {/* ✅ Toolbar (protégée du clear) */}
          <div className="mb-2 flex gap-2" data-no-clear-multiselect="true">
            <button
              onClick={handleEmptyBin}
              disabled={deleteForever.isPending}
              className="px-4 py-2 rounded bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
              title="Vider la corbeille"
            >
              🧹 Vider la corbeille
            </button>

            {canBinMultiSelect && binMultiSelectActive && (
              <button
                onClick={handleDeleteSelection}
                disabled={!hasBinSelection || deleteForever.isPending}
                className="px-4 py-2 rounded bg-red-600/20 border border-red-600 hover:bg-red-600/20 disabled:opacity-50 cursor-pointer"
                title="Supprimer la sélection"
              >
                {deleteForever.isPending
                  ? 'Suppression…'
                  : `🗑️ Supprimer la sélection (${selectedTrashIds.length})`}
              </button>
            )}
          </div>

          <section>
            <h3 className="font-medium mb-2">Corbeille</h3>

            {listBin.isLoading ? (
              <div className="text-gray-500 italic">Chargement…</div>
            ) : trashItems.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {trashItems.map((it) => {
                  if (it.kind === 'folder') {
                    return (
                      <BinGridFolderItem
                        key={it.id}
                        trashId={it.id}
                        displayName={it.displayName}
                        canMultiSelect={canBinMultiSelect}
                        onOpen={(trashId) => onOpenTrashEntry?.(trashId)}
                      />
                    );
                  }

                  return (
                    <BinGridFileItem
                      key={it.id}
                      trashId={it.id}
                      displayName={it.displayName}
                      previewUrl={it.previewUrl ?? null}
                      canMultiSelect={canBinMultiSelect}
                      onOpen={(trashId) => onOpenTrashEntry?.(trashId)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 italic">Corbeille vide</div>
            )}
          </section>

          {deleteForever.error && (
            <p className="text-sm text-red-600">{deleteForever.error.message || 'Erreur inconnue'}</p>
          )}
        </>
      ) : (
        <>
          {subFolders.length > 0 && (
            <section>
              <h3 className="font-medium mb-2">Dossiers</h3>
              <div className="grid grid-cols-3 gap-4">
                {subFolders.map((subFolder) => (
                  <GridFolderItem
                    key={subFolder.fullPath}
                    folder={subFolder}
                    onOpenFolder={onOpenFolder}
                    visibleNodes={folder.children}
                  />
                ))}
              </div>
            </section>
          )}

          {files.length > 0 && (
            <section>
              <h3 className="font-medium mb-2">Images</h3>
              <div className="grid grid-cols-3 gap-4">
                {files.map((file) => (
                  <GridFileItem
                    key={file.fullPath}
                    file={file}
                    onSelect={onSelectFile}
                    visibleNodes={folder.children}
                  />
                ))}
              </div>
            </section>
          )}

          {subFolders.length === 0 && files.length === 0 && (
            <div className="text-gray-500 italic">Dossier vide</div>
          )}
        </>
      )}
    </div>
  );
}