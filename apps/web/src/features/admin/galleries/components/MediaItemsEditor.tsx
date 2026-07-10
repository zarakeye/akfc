'use client';

import { JSX, useState } from 'react';
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { trpc, trpcClient } from '@trpc/trpcClient';
import { MediaPicker } from '@features/finder-core/components/MediaPicker';
import { finderStorageAdapter } from '@/features/finder-adapters/cloudinary/finderStorage.adapter';
import { APP_ROOT } from '@config/app';
import type { ResolvedMedia } from '@contracts/page';

/** Tuile triable (handle isolé, croix retrait, distance d'activation 5 px). */
function SortableTile({
  id,
  index,
  media,
  loading,
  onRemove,
}: {
  id: string;
  index: number;
  media: ResolvedMedia | null;
  loading: boolean;
  onRemove: () => void;
}): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden rounded-lg border border-gray-200 bg-white ${
        isDragging ? 'z-10 opacity-80 shadow-lg' : ''
      }`}
    >
      <div className="relative flex aspect-square items-center justify-center bg-gray-50">
        {media ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.kind === 'video' ? media.posterUrl ?? media.url : media.url}
              alt=""
              className="h-full w-full object-cover"
            />
            {media.kind === 'video' && (
              <span
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <span className="rounded-full bg-black/55 p-2 text-white">
                  <Play className="h-5 w-5" />
                </span>
              </span>
            )}
          </>
        ) : (
          <span className="px-2 text-center text-xs text-gray-400">
            {loading ? 'Chargement…' : 'Média indisponible'}
          </span>
        )}
      </div>

      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">
        {index + 1}
      </span>

      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Déplacer"
        className="absolute right-1 top-1 cursor-grab rounded bg-black/40 p-1 text-white active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Retirer"
        className="absolute bottom-1 right-1 rounded bg-white/90 p-1 text-red-600 hover:bg-red-50"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}

/**
 * Éditeur d'items média **contrôlé** (sans persistance) : ajout via le finder
 * (MediaPicker → chemins → `media.resolveByPaths` → ids), aperçus via
 * `media.resolveByIds`, réordonnancement drag-and-drop (@dnd-kit), retrait.
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

  const resolveQuery = trpc.media.resolveByIds.useQuery(
    { mediaIds: value },
    { enabled: value.length > 0, staleTime: 0 },
  );
  const resolved: Record<string, ResolvedMedia | null> = resolveQuery.data ?? {};

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
          <SortableContext items={value} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {value.map((id, index) => (
                <SortableTile
                  key={id}
                  id={id}
                  index={index}
                  media={resolved[id] ?? null}
                  loading={resolveQuery.isLoading}
                  onRemove={() => removeAt(index)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
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