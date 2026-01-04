'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import Cropper from '../gallery/ui/Cropper';
import { useActionState } from 'react';
import type { CroppedImage } from '@/app/gallery/types/cropped-image';

import {
  picturesDragNDropFormSchema,
  type PicturesDragNDropFormValuesType,
} from '@/server/schemas/picturesDragNDropForm.schema';

import {
  picturesDragNDropFormAction,
  type PicturesDragNDropFormState,
} from '@/server/actions/picturesDragNDropForm.action';

import { useCategoryStore } from '@/lib/stores/useCategoryStore';
import { useCourseStore } from '@/lib/stores/useCourseStore';

type PictureEntry = {
  id: string;
  name: string;
  originalBase64: string;
  base64: string;
};

export default function PicturesDragNDropForm() {
  const picturesByIdRef = useRef<Map<string, PictureEntry>>(new Map());
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [picturesForRender, setPicturesForRender] = useState<PictureEntry[]>([]);
  const [activeCropId, setActiveCropId] = useState<string | null>(null);
  const [activePicture, setActivePicture] = useState<PictureEntry | null>(null);

  const { categories } = useCategoryStore();
  const { courses } = useCourseStore();

  const form = useForm<PicturesDragNDropFormValuesType>({
    resolver: zodResolver(picturesDragNDropFormSchema),
    defaultValues: {
      userId: '',
      categoryId: null,
      activityId: null,
      newActivityName: '',
      picturesJSON: '[]',
    },
  });

  const { register, setValue, watch } = form;

  const selectedCategoryId = watch('categoryId');

  const [state, formAction, isPending] = useActionState<
    PicturesDragNDropFormState,
    FormData
  >(picturesDragNDropFormAction, {} as PicturesDragNDropFormState);

  /* ------------------ Sync JSON ------------------ */

  const syncPicturesJSON = (ids = orderedIds) => {
    const pictures = ids
      .map((id) => picturesByIdRef.current.get(id))
      .filter(Boolean)
      .map((p) => ({
        name: p!.name,
        base64: p!.base64,
      }));

    setValue('picturesJSON', JSON.stringify(pictures), {
      shouldDirty: true,
    });
  };

  /* ------------------ Render sync ------------------ */

  useEffect(() => {
    const pics = orderedIds
      .map((id) => picturesByIdRef.current.get(id))
      .filter(Boolean) as PictureEntry[];

    setPicturesForRender(pics);
    setActivePicture(activeCropId ? pics.find(p => p.id === activeCropId) ?? null : null);
  }, [orderedIds, activeCropId]);

  /* ------------------ Dropzone ------------------ */

  const onDrop = (files: File[]) => {
    const ids: string[] = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const id = crypto.randomUUID();
        picturesByIdRef.current.set(id, {
          id,
          name: file.name,
          originalBase64: reader.result as string,
          base64: reader.result as string,
        });

        ids.push(id);

        if (ids.length === files.length) {
          setOrderedIds((prev) => [...prev, ...ids]);
          syncPicturesJSON([...orderedIds, ...ids]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  /* ------------------ Crop handlers ------------------ */

  const handleCrop = (id: string, cropped: CroppedImage) => {
    const p = picturesByIdRef.current.get(id);
    if (!p) return;

    picturesByIdRef.current.set(id, { ...p, base64: cropped.base64 });
    syncPicturesJSON();
  };

  const handleRemove = (id: string) => {
    picturesByIdRef.current.delete(id);
    const next = orderedIds.filter((i) => i !== id);
    setOrderedIds(next);
    syncPicturesJSON(next);
  };

  /* ------------------ UI ------------------ */

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" {...register('userId')} />
      <input type="hidden" {...register('picturesJSON')} />

      <select {...register('categoryId')}>
        <option value="">Catégorie</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.type}
          </option>
        ))}
      </select>

      {selectedCategoryId && (
        <select {...register('activityId')}>
          <option value="">Cours</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      )}

      <div {...getRootProps()} className="border p-4 cursor-pointer">
        <input {...getInputProps()} />
        Drop images
      </div>

      {activePicture && (
        <Cropper
          image={activePicture}
          onCrop={(c) => handleCrop(activePicture.id, c)}
          onClose={() => setActiveCropId(null)}
        />
      )}

      <div className="flex gap-4 flex-wrap">
        {picturesForRender.map((p) => (
          <div key={p.id} className="relative w-32 h-32 border">
            <img
              src={p.base64}
              className="w-full h-full object-contain"
              onClick={() => setActiveCropId(p.id)}
            />
            <button
              type="button"
              onClick={() => handleRemove(p.id)}
              className="absolute top-1 right-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Envoi…' : 'Soumettre'}
      </button>

      {state?.error && <p className="text-red-500">{state.error}</p>}
      {state?.success && <p className="text-green-500">OK</p>}
    </form>
  );
}
