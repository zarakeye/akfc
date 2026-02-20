'use client';

import { JSX, useMemo, useState } from 'react';
import { useSelectionStore } from '@/lib/stores/useSelectionStore';
import { trpc } from '@/lib/trpcClient';
import type { FolderStatus } from '@/core/cloudinary/folder.types';

type Props = {
  currentPath: string;

  /**
   * ✅ Bool calculé dans FinderLayout:
   * - true si current folder réel a des children
   * - false si dossier vide OU virtual path OU null
   */
  currentFolderHasContent: boolean;
};

function isInBinTree(path: string): boolean {
  return path.endsWith('/bin') || path.includes('/bin/');
}

export default function MultiSelectSidebar({
  currentPath,
  currentFolderHasContent,
}: Props): JSX.Element {
  const selection = useSelectionStore((state) => state.selection);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  const utils = trpc.useUtils();

  const statuses: FolderStatus[] = ['pending', 'published', 'bin'];
  const [targetStatus, setTargetStatus] = useState<FolderStatus>('pending');

  const payload = useMemo(() => {
    const roots = Array.from(selection.roots);
    const excluded = Array.from(selection.excluded);
    return {
      roots,
      excluded: excluded.length ? excluded : undefined,
    };
  }, [selection]);

  const hasSelection = payload.roots.length > 0;

  /**
   * ✅ Nouvelle règle UX:
   * bouton purge visible seulement si:
   * - le current folder est bin ou descendant
   * - ET le folder courant (réel) contient quelque chose
   */
  const showKillButton = isInBinTree(currentPath) && currentFolderHasContent;

  const move = trpc.cloudinary.move.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      clearSelection();
    },
    onError: (err) => console.error('[move selection] failed:', err),
  });

  const emptyBin = trpc.cloudinary.emptyBin.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      clearSelection();
    },
    onError: (err) => console.error('[emptyBin] failed:', err),
  });

  function handleValidate() {
    if (!hasSelection) return;

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

  const isBusy = move.isPending || emptyBin.isPending;

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
        onClick={handleValidate}
        disabled={!hasSelection || isBusy}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {move.isPending ? 'Déplacement…' : 'Valider'}
      </button>

      {showKillButton && (
        <button
          onClick={() => {
            const ok = confirm(
              '⚠️ Supprimer définitivement TOUT le contenu de la corbeille ?\n\nCette action est irréversible.'
            );
            if (!ok) return;
            emptyBin.mutate();
          }}
          disabled={isBusy}
          className="w-full bg-red-600 text-white py-2 rounded disabled:opacity-50"
        >
          {emptyBin.isPending ? 'Suppression…' : '❌ Supprimer définitivement'}
        </button>
      )}

      <button
        onClick={clearSelection}
        disabled={isBusy}
        className="w-full bg-gray-200 text-gray-800 py-2 rounded disabled:opacity-50"
      >
        Annuler
      </button>

      {(move.error || emptyBin.error) && (
        <p className="text-sm text-red-600">
          {(move.error?.message ?? emptyBin.error?.message) || 'Erreur inconnue'}
        </p>
      )}
    </div>
  );
}