'use client';

import { JSX, useMemo, useState } from 'react';

import { trpc } from '@/lib/trpcClient';
import { useSelectionStore } from '@/lib/stores/useSelectionStore';
import type { FolderStatus } from '@/core/cloudinary/folder.types';

type Props = {
  currentPath: string;

  /**
   * Bool calculé dans FinderLayout (legacy)
   * - utile uniquement pour l'ancien "empty bin" (désormais remplacé)
   */
  currentFolderHasContent: boolean;
};

function normalizePath(p: string): string {
  return p.replace(/^\/+|\/+$/g, '');
}

function isBinRoot(path: string, appRoot: string): boolean {
  return normalizePath(path) === `${appRoot}/bin`;
}

/**
 * MultiSelectSidebar
 *
 * ✅ Normal mode (pending/published):
 * - action = changer de statut (pending/published)
 * - bin n'est PLUS un move classique : il passe par `trash.trashToBin`
 *
 * ✅ Bin root (liste plate):
 * - sélection = trashIds (store.binSelection)
 * - actions = restore / delete forever
 */
export default function MultiSelectSidebar({ currentPath }: Props): JSX.Element {
  const utils = trpc.useUtils();

  const selection = useSelectionStore((s) => s.selection);
  const binSelection = useSelectionStore((s) => s.binSelection);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  const appRoot = useMemo(() => normalizePath(currentPath).split('/')[0] ?? '', [currentPath]);
  const inBinRoot = isBinRoot(currentPath, appRoot);

  // -----------------------------
  // BIN ROOT ACTIONS
  // -----------------------------
  const selectedTrashIds = useMemo(() => Array.from(binSelection), [binSelection]);
  const hasBinSelection = selectedTrashIds.length > 0;

  const restoreFromBin = trpc.trash.restoreFromBin.useMutation({
    onSuccess: async () => {
      await utils.trash.listBin.invalidate();
      await utils.cloudinary.getFolderTree.invalidate();
      clearSelection();
    },
    onError: (err) => console.error('[restoreFromBin] failed:', err),
  });

  const deleteForever = trpc.trash.deleteForever.useMutation({
    onSuccess: async () => {
      await utils.trash.listBin.invalidate();
      clearSelection();
    },
    onError: (err) => console.error('[deleteForever] failed:', err),
  });

  async function handleRestoreSelection() {
    if (!hasBinSelection) return;
    restoreFromBin.mutate({ appRoot, ids: selectedTrashIds });
  }

  async function handleDeleteSelection() {
    if (!hasBinSelection) return;
    const ok = confirm(
      '⚠️ Supprimer définitivement la sélection ?\n\nCette action est irréversible.'
    );
    if (!ok) return;
    deleteForever.mutate({ appRoot, ids: selectedTrashIds });
  }

  async function handleEmptyBin() {
    // "Vider la corbeille" = deleteForever de tous les ids
    const ok = confirm(
      '⚠️ Vider la corbeille ?\n\nTout le contenu sera supprimé définitivement.'
    );
    if (!ok) return;

    // On récupère tout via pagination (simple et robuste).
    const allIds: string[] = [];
    let cursor: string | null | undefined = null;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await utils.trash.listBin.fetch({ appRoot, limit: 100, cursor, search: undefined });
      const ids = res.items.map((i) => i.id);
      allIds.push(...ids);
      if (!res.nextCursor) break;
      cursor = res.nextCursor;
    }

    if (allIds.length === 0) {
      alert('La corbeille est déjà vide.');
      return;
    }

    deleteForever.mutate({ appRoot, ids: allIds });
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
      clearSelection();
    },
    onError: (err) => console.error('[move selection] failed:', err),
  });

  const trashToBin = trpc.trash.trashToBin.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      await utils.trash.listBin.invalidate();
      clearSelection();
    },
    onError: (err) => console.error('[trashToBin selection] failed:', err),
  });

  function handleValidateStatus() {
    if (!hasSelection) return;

    // ✅ Bin n'est plus un move "status": on passe par trash
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
          <button
            onClick={handleRestoreSelection}
            disabled={!hasBinSelection || isBusy}
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            {restoreFromBin.isPending ? 'Restauration…' : '♻️ Restaurer la sélection'}
          </button>

          <button
            onClick={handleDeleteSelection}
            disabled={!hasBinSelection || isBusy}
            className="w-full bg-red-600 text-white py-2 rounded disabled:opacity-50"
          >
            {deleteForever.isPending ? 'Suppression…' : '❌ Supprimer la sélection'}
          </button>

          <button
            onClick={handleEmptyBin}
            disabled={isBusy}
            className="w-full bg-gray-100 text-gray-900 py-2 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            🧹 Vider la corbeille
          </button>
        </div>

        <button
          onClick={clearSelection}
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
        disabled={!hasSelection || isBusy}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {move.isPending || trashToBin.isPending ? 'Déplacement…' : 'Valider'}
      </button>

      <button
        onClick={clearSelection}
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
