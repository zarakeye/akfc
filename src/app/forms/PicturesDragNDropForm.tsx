'use client';

import { JSX, useActionState, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Cropper, { type CroppedImage } from '../gallery/ui/Cropper';
import {
  picturesDragNDropFormSchema,
  type PicturesDragNDropFormValuesType,
} from '@/server/schemas/picturesDragNDropForm.schema';
import {
  picturesDragNDropFormAction,
  type PicturesDragNDropFormState,
} from '@/server/actions/picturesDragNDropForm.action';
import { useUserStore } from '@/lib/stores/useUserStore';
import { useCategoryStore } from '@/lib/stores/useCategoryStore';
import { useCourseStore } from '@/lib/stores/useCourseStore';
import Image from 'next/image';

type PictureEntry = {
  id: string;
  name: string;
  originalBase64: string;
  base64: string;
  selected?: boolean;
};

export default function PicturesDragNDropForm(): JSX.Element {
  const currentUser = useUserStore((s) => s.user);
  useCategoryStore();
  useCourseStore();

  /** source de vérité mutable */
  const picturesByIdRef = useRef<Map<string, PictureEntry>>(new Map());

  /** états React */
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [picturesForRender, setPicturesForRender] = useState<PictureEntry[]>([]);
  const [activeCropId, setActiveCropId] = useState<string | null>(null);
  const [activePicture, setActivePicture] = useState<{
    id: string;
    name: string;
    base64: string;
  } | null>(null);

  const [state, formAction, isPending] =
    useActionState<PicturesDragNDropFormState, FormData>(
      picturesDragNDropFormAction,
      {} as PicturesDragNDropFormState
    );

  const form = useForm<PicturesDragNDropFormValuesType>({
    resolver: zodResolver(picturesDragNDropFormSchema),
    defaultValues: {
      userId: currentUser?.id ?? '',
      categoryId: null,
      activityId: null,
      newActivityName: '',
      pictures: [],
    },
    mode: 'onBlur',
  });

  const { setValue } = form;

  /* ------------------ sync helpers ------------------ */

  const syncPicturesForRender = () => {
    setPicturesForRender(
      orderedIds
        .map((id) => picturesByIdRef.current.get(id))
        .filter(Boolean) as PictureEntry[]
    );
  };

  const syncFormPictures = () => {
    setValue(
      'pictures',
      Array.from(picturesByIdRef.current.values()).map((p) => ({
        name: p.name,
        base64: p.base64,
      })),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  /* ------------------ handlers ------------------ */

  const handleAddImages = (images: { name: string; preview: string }[]) => {
    const nextIds: string[] = [];

    images.forEach((img) => {
      const id = crypto.randomUUID();
      picturesByIdRef.current.set(id, {
        id,
        name: img.name,
        originalBase64: img.preview,
        base64: img.preview,
        selected: false,
      });
      nextIds.push(id);
    });

    setOrderedIds((ids) => [...ids, ...nextIds]);
  };

  const handleCrop = (id: string | number, cropped: CroppedImage) => {
    const realId = typeof id === 'number' ? orderedIds[id] : id;
    const entry = picturesByIdRef.current.get(realId);
    if (!entry) return;

    picturesByIdRef.current.set(realId, {
      ...entry,
      base64: cropped.base64,
    });

    syncFormPictures();
    syncPicturesForRender();
  };

  const handleResetImage = (id: string) => {
    const entry = picturesByIdRef.current.get(id);
    if (!entry) return;

    picturesByIdRef.current.set(id, {
      ...entry,
      base64: entry.originalBase64,
    });

    syncFormPictures();
    syncPicturesForRender();
  };

  const handleRemoveImage = (id: string) => {
    picturesByIdRef.current.delete(id);
    setOrderedIds((ids) => ids.filter((i) => i !== id));
  };

  const handleToggleSelect = (id: string) => {
    const entry = picturesByIdRef.current.get(id);
    if (!entry) return;

    picturesByIdRef.current.set(id, {
      ...entry,
      selected: !entry.selected,
    });

    syncPicturesForRender();
  };

  const handleRemoveSelected = () => {
    orderedIds.forEach((id) => {
      if (picturesByIdRef.current.get(id)?.selected) {
        picturesByIdRef.current.delete(id);
      }
    });

    setOrderedIds((ids) =>
      ids.filter((id) => picturesByIdRef.current.has(id))
    );
  };

  /* ------------------ effects ------------------ */

  useEffect(() => {
    syncPicturesForRender();
    syncFormPictures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedIds]);

  useEffect(() => {
    if (!activeCropId) {
      setActivePicture(null);
      return;
    }

    const entry = picturesByIdRef.current.get(activeCropId);
    if (!entry) return;

    setActivePicture({
      id: entry.id,
      name: entry.name,
      base64: entry.base64,
    });
  }, [activeCropId]);

  /* ------------------ render ------------------ */

  return (
    <form action={formAction}>
      <input type="hidden" {...form.register('userId')} />

      <h2 className="text-2xl font-bold mb-4">Ajouter des images</h2>

      <Cropper
        onAddImages={handleAddImages}
        onCrop={handleCrop}
        image={activePicture}
        onClose={() => setActiveCropId(null)}
      />

      <div className="flex flex-wrap gap-4 mt-4">
        {picturesForRender.map((p) => {
          const isCropped = p.base64 !== p.originalBase64;

          return (
            <div
              key={p.id}
              className="relative w-32 h-32 border rounded-md overflow-hidden"
            >
              <Image
                src={p.base64}
                alt={p.name}
                fill
                className="object-contain cursor-pointer"
                onClick={() => setActiveCropId(p.id)}
              />

              <button
                type="button"
                onClick={() => handleRemoveImage(p.id)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded"
              >
                ✕
              </button>

              {isCropped && (
                <button
                  type="button"
                  onClick={() => handleResetImage(p.id)}
                  className="absolute bottom-1 right-1 bg-yellow-500 text-white text-xs px-1 rounded"
                >
                  Reset
                </button>
              )}

              <input
                type="checkbox"
                checked={p.selected ?? false}
                onChange={() => handleToggleSelect(p.id)}
                className="absolute bottom-1 left-1"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleRemoveSelected}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Supprimer les sélectionnées
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {isPending ? 'Envoi…' : 'Soumettre'}
        </button>
      </div>

      {state?.success && (
        <span className="text-green-600 ml-2">✔ Envoi réussi</span>
      )}
      {state?.error && (
        <span className="text-red-600 ml-2">{state.error}</span>
      )}
    </form>
  );
}
