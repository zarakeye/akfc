'use client';

import { JSX, useActionState, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Cropper, { type CroppedImage } from '../gallery/ui/Cropper';
import {
  picturesDragNDrogFormSchema,
  type PicturesDragNDrogFormValuesType,
} from '@/server/schemas/picturesDragNDropForm.schema';
import {
  picturesDragNDropFormAction,
  type PicturesDragNDrogFormState,
} from '@/server/actions/picturesDragNDrogForm.action';
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

export default function PicturesDragNDrogForm(): JSX.Element {
  const currentUser = useUserStore((s) => s.user);
  const picturesByIdRef = useRef<Map<string, PictureEntry>>(new Map());
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [currentCropId, setCurrentCropId] = useState<string | null>(null);
  const { categories } = useCategoryStore();
  const { courses } = useCourseStore();

  const [state, formAction, isPending] =
    useActionState<PicturesDragNDrogFormState, FormData>(
      picturesDragNDropFormAction,
      {} as PicturesDragNDrogFormState
    );

  // ------------------------
  // React Hook Form
  // ------------------------
  const form = useForm<PicturesDragNDrogFormValuesType>({
    resolver: zodResolver(picturesDragNDrogFormSchema),
    defaultValues: {
      userId: currentUser?.id ?? '',
      categoryId: null,
      activityId: null,
      newActivityName: '',
      pictures: [],
    },
    mode: 'onBlur',
  });

  const { control, register, setValue, watch } = form;

  // --- Synchronisation centralisée ---
  const syncFormPictures = () => {
    setValue(
      'pictures',
      Array.from(picturesByIdRef.current.values()).map((p) => ({
        name: p.name,
        base64: p.base64,
      })),
      { shouldValidate: true }
    );
  };

  // const {
  //   fields: pictureFields,
  //   append,
  //   remove,
  //   update,
  //   replace
  // } = useFieldArray({
  //   control,
  //   name: 'pictures',
  // });

  
  /**
   * Handles the cropping of an image.
   * Updates the corresponding image with the new base64 and sets the form state accordingly.
   * @param {string | number} indexOrId - The index or id of the image to crop.
   * @param {{ name: string; base64: string }} cropped - The cropped image.
   */
  const handleCrop = (indexOrId: string | number, cropped: CroppedImage) => {
    let entry: PictureEntry | undefined;

    if (typeof indexOrId === 'number') {
      const id = orderedIds[indexOrId];
      entry = picturesByIdRef.current.get(id);
    } else {
      entry = picturesByIdRef.current.get(indexOrId);
    }

    if (!entry) return;

    // mettre à jour l'image croppée
    picturesByIdRef.current.set(entry.id, {
      ...entry,
      base64: cropped.base64,
    });

    form.setValue(
      'pictures',
      Array.from(picturesByIdRef.current.values()).map((p) => ({
        name: p.name,
        base64: p.base64,
      })),
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );

    syncFormPictures();
    setCurrentCropId(null);
  };



  /**
   * Adds new images to the form state.
   * @param {Array<{ name: string; preview: string }>} images - The images to add.
   */
  const handleAddImages = (images: { name: string; preview: string }[]) => {
    const nextMap = new Map(picturesByIdRef.current); // clonage
    const nextIds = [...orderedIds]; // clonage

    // ajouter les nouvelles images
    images.forEach((img) => {
      const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // éviter les doublons par nom
      nextMap.set(id, {
        id,
        name: img.name,
        originalBase64: img.preview,
        base64: img.preview,
      });
      // ajouter l'id dans l'ordre
      nextIds.push(id);
    });

    // mettre à jour l'ordre et la map
    picturesByIdRef.current = nextMap;
    setOrderedIds(nextIds);
    syncFormPictures();
  };

  const handleRemoveImage = (id: string) => {
    picturesByIdRef.current.delete(id);
    setOrderedIds((ids) => ids.filter((i) => i !== id));
    syncFormPictures();
  };

  const handleToggleSelect = (id: string) => {
    const entry = picturesByIdRef.current.get(id);
    if (!entry) return;
    picturesByIdRef.current.set(id, { ...entry, selected: !entry.selected });
    setOrderedIds((ids) => [...ids]);
  };

  const handleRemoveSelected = () => {
    // const newMap = new Map(picturesByIdRef.current);
    // const newIds = orderedIds.filter((id) => {
    //   const keep = !newMap.get(id)?.selected;
    //   if (!keep) newMap.delete(id);
    //   return keep;
    // });
    const toRemove = orderedIds.filter((id) => picturesByIdRef.current.get(id)?.selected);
    toRemove.forEach((id) => {
      picturesByIdRef.current.delete(id);
    });

    const newIds = orderedIds.filter((id) => !toRemove.includes(id));
    setOrderedIds(newIds);
    syncFormPictures();
  };

  const handleResetImage = (id: string) => {
    const entry = picturesByIdRef.current.get(id);
    if (!entry) return;
    picturesByIdRef.current.set(id, { ...entry, base64: entry.originalBase64 });
    syncFormPictures();
  };

  const handleClearAll = () => {
    picturesByIdRef.current.clear();
    setOrderedIds([]);
    syncFormPictures();
  };

  // --- SUBMIT ---
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const ok = await form.trigger();
    if (!ok) {
      e.preventDefault();
      return;
    }
  };

  const selectedCategoryId = form.watch('categoryId');
  const selectedCategory = categories?.find(
    (c) => Number(c.id) === Number(selectedCategoryId)
  );

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <input type="hidden" {...form.register('userId')} value={form.getValues('userId')} />

      <select
        {...form.register('categoryId')}
      >
        <option value="">Sélectionne une catégorie d&apos;activités</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.type}
          </option>
        ))}
      </select>

      {selectedCategory?.type === 'Cours' && courses && (
        <select {...form.register('activityId')}>
          <option value="">Sélectionne un cours</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.label}
            </option>
          ))}
        </select>
      )}
      

      <h2 className="text-2xl font-bold mb-4">Ajouter des images</h2>
      <Cropper
        onCrop={handleCrop}
        onChangeAll={handleAddImages}
        onClear={handleClearAll}
      />

      <div className="flex flex-wrap gap-4 mt-4">
        {orderedIds.map((id) => {
          const p = picturesByIdRef.current.get(id)!;
          return (
            <div key={id} className="relative w-32 h-32 border rounded-md overflow-hidden">
              <Image
                src={p.base64}
                alt={p.name}
                fill
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setCurrentCropId(id)}
              />
              <button type="button" onClick={() => handleRemoveImage(id)} className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded">X</button>
              <button type="button" onClick={() => handleResetImage(id)} className="absolute bottom-1 right-1 bg-yellow-500 text-white text-xs px-1 rounded">Reset</button>
              <input type="checkbox" checked={p.selected ?? false} onChange={() => handleToggleSelect(id)} className="absolute bottom-1 left-1" />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleRemoveSelected}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
      >
        Supprimer les sélectionnées
      </button>

      {orderedIds.some((id) => picturesByIdRef.current.get(id)?.selected) && (
        <button
          type="button"
          onClick={handleRemoveSelected}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
        >
          Supprimer sélection
        </button>
      )}

      <input
        type="hidden"
        name="pictures"
        value={JSON.stringify(
          form.watch('pictures') ?? []
        )}
      />

      <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        {isPending ? 'Envoi...' : 'Soumettre'}
      </button>
      {state?.success && <span className="text-green-600 ml-2">✔ Envoi réussi</span>}
      {state?.error && <span className="text-red-600 ml-2">{state.error}</span>}
    </form>
  );
}
