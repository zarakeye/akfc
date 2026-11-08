'use client';

import { JSX, useState } from 'react';
import type { inferRouterOutputs } from '@trpc/server';
import { X, Plus, GripVertical, Play } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { trpc, trpcClient } from '@trpc/trpcClient';
import { MediaPicker } from '@features/finder-core/components/MediaPicker';
import { finderStorageAdapter } from '@/features/finder-adapters/storage/finderStorage.adapter';
import { APP_ROOT } from '@config/app';
import type { ResolvedMedia } from '@contracts/page';
import type { AppRouter } from '@backend/modules';
import { IMAGE_USAGE_LABEL, IMAGE_USAGE_VALUES } from '@contracts/legal/imageConsent';
import { MediaTagsDialog } from '@features/admin/media-people/MediaTagsDialog';
import { USAGE_SHORT_LABEL, VerdictBadge } from '@features/admin/media-people/RightsBadges';

type MediaRights = inferRouterOutputs<AppRouter>['mediaPeople']['verdicts'][string];

const thumbOf = (m: ResolvedMedia): string =>
  m.kind === 'video' ? m.posterUrl ?? m.url : m.url;

/** Ligne triable du tableau (poignée isolée, croix de retrait, distance d'activation 5 px). */
function SortableRow({
  id,
  index,
  media,
  loading,
  rights,
  onTag,
  onRemove,
}: {
  id: string;
  index: number;
  media: ResolvedMedia | null;
  loading: boolean;
  rights: MediaRights | undefined;
  onTag: () => void;
  onRemove: () => void;
}): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = { transform: CSS.Translate.toString(transform), transition };
  const label = `Média n° ${index + 1}`;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 bg-white ${isDragging ? 'relative z-10 opacity-80 shadow-lg' : ''}`}
    >
      <td className="px-2 py-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Déplacer"
          className="cursor-grab rounded p-1 text-gray-500 hover:bg-gray-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-2 py-2 font-mono text-xs text-gray-500">{index + 1}</td>
      <td className="px-2 py-2">
        <button
          type="button"
          onClick={onTag}
          aria-label={`Taguer les personnes du ${label.toLowerCase()}`}
          className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-gray-50 ring-emerald-500 hover:ring-2"
        >
          {media ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbOf(media)} alt="" className="h-full w-full object-cover" />
              {media.kind === 'video' && (
                <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                  <span className="rounded-full bg-black/55 p-1.5 text-white">
                    <Play className="h-4 w-4" />
                  </span>
                </span>
              )}
            </>
          ) : (
            <span className="px-1 text-center text-[10px] text-gray-400">
              {loading ? 'Chargement…' : 'Indisponible'}
            </span>
          )}
        </button>
      </td>
      <td className="px-2 py-2">
        <button
          type="button"
          onClick={onTag}
          className="whitespace-nowrap rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
        >
          {!rights
            ? '…'
            : rights.noRecognizablePerson
              ? 'Personne de reconnaissable'
              : rights.count === 0
                ? 'Taguer'
                : `${rights.count} personne${rights.count > 1 ? 's' : ''}`}
        </button>
      </td>
      {IMAGE_USAGE_VALUES.map((u) => (
        <td key={u} className="px-2 py-2 text-center">
          {rights ? <VerdictBadge usage={u} verdict={rights.verdicts[u]} /> : null}
        </td>
      ))}
      <td className="px-2 py-2 text-right">
        <button
          type="button"
          onClick={onRemove}
          aria-label="Retirer"
          className="rounded p-1 text-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

/**
 * Éditeur d'items média **contrôlé** (sans persistance) : ajout via le finder
 * (MediaPicker → chemins → `media.resolveByPaths` → ids), aperçus via
 * `media.resolveByIds`, réordonnancement drag-and-drop (@dnd-kit), retrait.
 *
 * Tableau : une ligne par média (elle s'ajoute à chaque média ajouté), une
 * colonne par usage du droit à l'image (`mediaPeople.verdicts`). Un clic sur le
 * média ouvre la modale des tags. Les tags appartiennent au MÉDIA, pas à la
 * galerie : ils s'enregistrent tout de suite, sans attendre le formulaire.
 *
 * Réutilisé tel quel par la **création** (état local → input caché) et par
 * l'**édition** (état local → `gallery.setItems`). Il ne connaît rien de la
 * galerie : il ne manipule qu'une liste ordonnée d'ids média.
 */
export function MediaItemsEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
}): JSX.Element {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tagging, setTagging] = useState<number | null>(null);

  const resolveQuery = trpc.media.resolveByIds.useQuery(
    { mediaIds: value },
    { enabled: value.length > 0, staleTime: 0 },
  );
  const resolved: Record<string, ResolvedMedia | null> = resolveQuery.data ?? {};
  const rightsQuery = trpc.mediaPeople.verdicts.useQuery(
    { mediaAssetIds: value },
    { enabled: value.length > 0 },
  );
  const rights = rightsQuery.data ?? {};
  const taggingId = tagging !== null ? value[tagging] : undefined;
  const taggingMedia = taggingId ? resolved[taggingId] ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handlePickerSubmit(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    
    const byPath = await trpcClient.media.resolveByPaths.query({
      appRoot: APP_ROOT,
      paths,
    });

    const newIds = Object.values(byPath).filter(
      (mid): mid is string => mid !== null,
    );
    
    const seen = new Set(value);
    const toAdd = newIds.filter((mid) => !seen.has(mid));
    onChange([...value, ...toAdd]);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(String(active.id));
      const newIndex = value.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  }

  function removeAt(index: number): void {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">Images</span>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Ajouter des médias
        </button>
      </div>

      {value.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          Aucune image. Clique sur « Ajouter des médias » pour en piocher dans
          la bibliothèque.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th className="w-8 px-2 py-2"><span className="sr-only">Ordre</span></th>
                  <th className="w-8 px-2 py-2 text-left">N°</th>
                  <th className="px-2 py-2 text-left">Média</th>
                  <th className="px-2 py-2 text-left">Personnes</th>
                  {IMAGE_USAGE_VALUES.map((u) => (
                    <th key={u} scope="col" title={IMAGE_USAGE_LABEL[u]} className="px-2 py-2 text-center font-medium">
                      {USAGE_SHORT_LABEL[u]}
                    </th>
                  ))}
                  <th className="w-8 px-2 py-2"><span className="sr-only">Retirer</span></th>
                </tr>
              </thead>
              <SortableContext items={value} strategy={verticalListSortingStrategy}>
                <tbody>
                  {value.map((id, index) => (
                    <SortableRow
                      key={id}
                      id={id}
                      index={index}
                      media={resolved[id] ?? null}
                      loading={resolveQuery.isLoading}
                      rights={rights[id]}
                      onTag={() => setTagging(index)}
                      onRemove={() => removeAt(index)}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Droit à l&apos;image : ✓ accord · ✕ refus · ? pas encore d&apos;autorisation · – à taguer.
            Clique sur un média pour indiquer qui y apparaît.
          </p>
        </DndContext>
      )}

      {taggingId && (
        <MediaTagsDialog
          mediaAssetId={taggingId}
          previewUrl={taggingMedia ? thumbOf(taggingMedia) : null}
          title={`média n° ${(tagging ?? 0) + 1}`}
          onClose={() => setTagging(null)}
        />
      )}

      {pickerOpen && (
        <MediaPicker
          open
          adapter={finderStorageAdapter}
          rootPath={APP_ROOT}
          onClose={() => setPickerOpen(false)}
          onSubmit={(paths) => {
            void handlePickerSubmit(paths);
          }}
        />
      )}
    </div>
  );
}