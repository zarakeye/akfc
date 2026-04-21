'use client';

import { JSX, useMemo } from 'react';
import { trpc } from '@/core/trpc/trpcClient';
import { useSelectionStore } from '@/features/cloudinary-finder/state/selection/useSelectionStore';

import BinGridFolderItem from '@/features/cloudinary-finder/ui/trash/bin/BinGridFolderItem';
import BinGridFileItem from '@/features/cloudinary-finder/ui/trash/bin/BinGridFileItem';

type Props = {
  appRoot: string;
  onOpenTrashFolder: (params: { trashId: string; displayName: string }) => void;
  onSelectTrashFile: (params: { id: string; name: string; publicId: string; previousPath: string }) => void;
};

/**
 * BinRootView (GRID)
 *
 * ✅ rendu identique à GridFolderItem / GridFileItem (cards 32x32)
 * ✅ checkbox visible uniquement quand binMultiSelectActive=true
 * ✅ longpress => active binMultiSelect + sélectionne (géré dans BinGrid*Item)
 * ✅ click dans le vide => exit bin multiselect
 *
 * ✅ bouton toolbar:
 * - normal : 🧹 Vider la corbeille
 * - multiselect : ❌ Supprimer définitivement la sélection (N)
 */
export default function BinRootView({
  appRoot,
  onOpenTrashFolder,
  onSelectTrashFile,
}: Props): JSX.Element {
  const utils = trpc.useUtils();

  const binMultiSelectActive = useSelectionStore((s) => s.binMultiSelectActive);
  const binSelection = useSelectionStore((s) => s.binSelection);
  const clearBinSelection = useSelectionStore((s) => s.clearBinSelection);

  const selectedIds = useMemo(() => Array.from(binSelection), [binSelection]);
  const hasSelection = selectedIds.length > 0;

  const { data, isLoading, isError, error } = trpc.trash.listBin.useQuery({
    appRoot,
    limit: 100,
    cursor: null,
  });

  const items = data?.items ?? [];
  const isEmpty = useMemo(() => !isLoading && items.length === 0, [isLoading, items.length]);

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
    if (!hasSelection) return;

    const ok = confirm('⚠️ Supprimer définitivement la sélection ?\n\nCette action est irréversible.');
    if (!ok) return;

    deleteForever.mutate({ appRoot, ids: selectedIds });
  }

  const isBusy = deleteForever.isPending;

  if (isLoading) return <div className="text-gray-500">Chargement de la corbeille…</div>;
  if (isError) return <div className="text-red-600">Erreur : {error?.message ?? 'inconnue'}</div>;
  if (isEmpty) return <div className="text-gray-500 italic">Corbeille vide</div>;

  return (
    <div
      className="space-y-4 min-h-full"
      onMouseDownCapture={(e) => {
        if (!binMultiSelectActive) return;

        const el = e.target as Element | null;
        if (!el) return;

        if (el.closest('[data-no-clear-multiselect="true"]')) return;

        const insideItem = el.closest('[data-content-item="true"]');
        if (!insideItem) clearBinSelection();
      }}
    >
      <div className="flex gap-2" data-no-clear-multiselect="true">
        {binMultiSelectActive ? (
          <button
            onClick={handleDeleteSelection}
            disabled={!hasSelection || isBusy}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            title={!hasSelection ? 'Aucune sélection' : 'Supprimer définitivement la sélection'}
          >
            {isBusy ? 'Suppression…' : `❌ Supprimer définitivement (${selectedIds.length})`}
          </button>
        ) : (
          <button
            onClick={handleEmptyBin}
            disabled={isBusy}
            className="px-4 py-2 rounded bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
            title="Vider la corbeille"
          >
            🧹 Vider la corbeille
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {items.map((it) => {
          const title = it.previousPath;

          if (it.kind === 'folder') {
            return (
              <div key={it.id} title={title}>
                <BinGridFolderItem
                  trashId={it.id}
                  displayName={it.displayName}
                  canMultiSelect={true}
                  onOpen={(trashId) => onOpenTrashFolder({ trashId, displayName: it.displayName })}
                />
              </div>
            );
          }

          return (
            <div key={it.id} title={title}>
              <BinGridFileItem
                trashId={it.id}
                displayName={it.displayName}
                publicId={it.publicId ?? null}
                canMultiSelect={true}
                onOpen={(trashId) => {
                  if (!it.publicId) {
                    alert('Preview indisponible (publicId manquant).');
                    return;
                  }
                
                  onSelectTrashFile({
                    id: trashId,
                    name: it.displayName,
                    publicId: it.publicId,
                    previousPath: it.previousPath,
                  })
                }}
              />
            </div>
          );
        })}
      </div>

      {deleteForever.error && (
        <p className="text-sm text-red-600">{deleteForever.error.message || 'Erreur inconnue'}</p>
      )}
    </div>
  );
}