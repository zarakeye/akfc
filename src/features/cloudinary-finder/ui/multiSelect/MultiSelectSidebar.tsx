'use client';

import { JSX, useMemo, useState } from 'react';

import { trpc } from '@/lib/trpcClient';
import { useSelectionStore } from '@/features/cloudinary-finder/state/selection/useSelectionStore';
import type { FolderStatus } from '@/shared/cloudinary/folder.types';

type Props = {
  currentPath: string;

  /**
   * Legacy / UX guard (encore utile côté normal)
   */
  currentFolderHasContent: boolean;
};

function normalizePath(p: string): string {
  return p.replace(/^\/+|\/+$/g, '');
}

function isBinRoot(path: string, appRoot: string): boolean {
  return normalizePath(path) === `${appRoot}/bin`;
}

type BinAction = 'restore' | 'deleteForever';

export default function MultiSelectSidebar({
  currentPath,
  currentFolderHasContent,
}: Props): JSX.Element {
  const utils = trpc.useUtils();

  const selection = useSelectionStore((s) => s.selection);
  const binSelection = useSelectionStore((s) => s.binSelection);

  const clearNormalSelection = useSelectionStore((s) => s.clearNormalSelection);
  const clearBinSelection = useSelectionStore((s) => s.clearBinSelection);

  const appRoot = useMemo(() => normalizePath(currentPath).split('/')[0] ?? '', [currentPath]);
  const inBinRoot = isBinRoot(currentPath, appRoot);

  // -----------------------------
  // BIN ROOT ACTIONS (2 radios)
  // -----------------------------
  const selectedTrashIds = useMemo(() => Array.from(binSelection), [binSelection]);
  const hasBinSelection = selectedTrashIds.length > 0;

  const [binAction, setBinAction] = useState<BinAction>('restore');

  const restoreFromBin = trpc.trash.restoreFromBin.useMutation({
    onSuccess: async () => {
      await utils.trash.listBin.invalidate();
      await utils.cloudinary.getFolderTree.invalidate();
      clearBinSelection();
    },
    onError: (err) => console.error('[restoreFromBin] failed:', err),
  });

  const deleteForever = trpc.trash.deleteForever.useMutation({
    onSuccess: async () => {
      await utils.trash.listBin.invalidate();
      await utils.cloudinary.getFolderTree.invalidate();
      clearBinSelection();
    },
    onError: (err) => console.error('[deleteForever] failed:', err),
  });

  async function applyBinAction() {
    if (!hasBinSelection) return;

    if (binAction === 'restore') {
      restoreFromBin.mutate({ appRoot, ids: selectedTrashIds });
      return;
    }

    const ok = confirm('⚠️ Supprimer définitivement la sélection ?\n\nCette action est irréversible.');
    if (!ok) return;
    deleteForever.mutate({ appRoot, ids: selectedTrashIds });
  }

  // -----------------------------
  // NORMAL STATUS ACTIONS
  // -----------------------------
  const payload = useMemo(() => {
    const roots = Array.from(selection.roots);
    const excluded = Array.from(selection.excluded);
    return { roots, excluded: excluded.length ? excluded : undefined };
  }, [selection]);

  const hasSelection = payload.roots.length > 0;

  const [targetStatus, setTargetStatus] = useState<FolderStatus>('pending');
  const statuses: FolderStatus[] = ['pending', 'published', 'bin'];

  const move = trpc.cloudinary.move.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      clearNormalSelection();
    },
    onError: (err) => console.error('[move selection] failed:', err),
  });

  const trashToBin = trpc.trash.trashToBin.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      await utils.trash.listBin.invalidate();
      clearNormalSelection();
    },
    onError: (err) => console.error('[trashToBin selection] failed:', err),
  });

  function handleValidateStatus() {
    if (!hasSelection) return;

    if (targetStatus === 'bin') {
      trashToBin.mutate({
        appRoot,
        sources: [
          {
            kind: 'selection',
            roots: payload.roots,
          },
        ],
      });
      return;
    }

    move.mutate({
      source: {
        type: 'selection',
        roots: payload.roots,
        excluded: payload.excluded,
      },
      target: {
        type: 'virtual-folder',
        status: targetStatus,
      },
    });
  }

  const isBusy =
    move.isPending ||
    trashToBin.isPending ||
    restoreFromBin.isPending ||
    deleteForever.isPending;

  // -----------------------------
  // RENDER
  // -----------------------------
  if (inBinRoot) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="font-semibold text-lg">Corbeille</h2>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="bin-action"
              checked={binAction === 'restore'}
              disabled={isBusy}
              onChange={() => setBinAction('restore')}
            />
            <span className={isBusy ? 'opacity-60' : ''}>♻️ Restaurer</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="bin-action"
              checked={binAction === 'deleteForever'}
              disabled={isBusy}
              onChange={() => setBinAction('deleteForever')}
            />
            <span className={isBusy ? 'opacity-60' : ''}>❌ Supprimer définitivement</span>
          </label>
        </div>

        <button
          onClick={applyBinAction}
          disabled={!hasBinSelection || isBusy}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          title={!hasBinSelection ? 'Sélectionne au moins 1 élément' : ''}
        >
          {isBusy ? '…' : 'Appliquer'}
        </button>

        <button
          onClick={clearBinSelection}
          disabled={isBusy}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded disabled:opacity-50"
        >
          Annuler
        </button>

        {(restoreFromBin.error || deleteForever.error) && (
          <p className="text-sm text-red-600">
            {(restoreFromBin.error?.message ?? deleteForever.error?.message) || 'Erreur inconnue'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-semibold text-lg">Modifier le statut</h2>

      <div className="space-y-2">
        {statuses.map((s) => (
          <label key={s} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="status"
              checked={targetStatus === s}
              disabled={isBusy}
              onChange={() => setTargetStatus(s)}
            />
            <span className={isBusy ? 'opacity-60' : ''}>{s}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleValidateStatus}
        disabled={!hasSelection || isBusy || (!currentFolderHasContent && hasSelection)}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {move.isPending || trashToBin.isPending ? 'Déplacement…' : 'Valider'}
      </button>

      <button
        onClick={clearNormalSelection}
        disabled={isBusy}
        className="w-full bg-gray-200 text-gray-800 py-2 rounded disabled:opacity-50"
      >
        Annuler
      </button>

      {(move.error || trashToBin.error) && (
        <p className="text-sm text-red-600">
          {(move.error?.message ?? trashToBin.error?.message) || 'Erreur inconnue'}
        </p>
      )}
    </div>
  );
}