'use client';

import { JSX, useState } from 'react';
import { trpc } from '@trpc/trpcClient';
import { MediaItemsEditor } from '@features/admin/galleries/components/MediaItemsEditor';

/**
 * Gestion des items d'une galerie **existante** (page d'édition).
 * Délègue tout l'UI (picker, aperçus, drag-and-drop) au `MediaItemsEditor`
 * contrôlé, et ajoute la persistance via `gallery.setItems`.
 */
export function GalleryItemsManager({
  galleryId,
  initialMediaIds,
}: {
  galleryId: number;
  initialMediaIds: string[];
}): JSX.Element {
  const [mediaIds, setMediaIds] = useState<string[]>(initialMediaIds);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const setItemsMutation = trpc.gallery.setItems.useMutation();

  async function handleSave(): Promise<void> {
    setError(null);
    try {
      await setItemsMutation.mutateAsync({ galleryId, mediaAssetIds: mediaIds });
      setSaved(true);
      void utils.gallery.getById.invalidate({ id: galleryId });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="mb-4 text-lg font-semibold">Images de la galerie</h3>

      <MediaItemsEditor
        value={mediaIds}
        onChange={(ids) => {
          setMediaIds(ids);
          setSaved(false);
        }}
      />

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={setItemsMutation.isPending}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {setItemsMutation.isPending ? 'Enregistrement…' : "Enregistrer l'ordre"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Enregistré.</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}