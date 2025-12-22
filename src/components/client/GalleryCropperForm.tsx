// src/components/GalleryCropperForm.tsx
'use client';

import { JSX, useActionState, useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import GalleryDropCrop, { CroppedImage } from './GalleryDropCrop';
import { galleryCropperSchema, type GalleryCropperValues } from '@server/validation/galleryCropper.schema';
import { galleryCropperAction } from '@server/actions/galleryCropper.action';
import { GalleryCropperState } from '@server/actions/actionState.interfaces';
import { trpc } from '@lib/trpcClient';
import { useUserStore } from '@/lib/stores/useUserStore';
import Image from 'next/image';
import { useCategoryStore, type CategoryState } from '@lib/stores/useCategoryStore';
import { useCourseStore, type CourseStoreState } from '@lib/stores/useCourseStore';

type PictureEntry = {
  id: string;
  name: string;
  originalBase64: string;
  base64: string;
};

export default function GalleryCropperForm(): JSX.Element {
  const currentUser = useUserStore((state) => state.user);
  // const session = useUserStore((state) => state.setSession);
  const session = useUserStore((state) => state.session);
  console.log('🔑 USER SESSION:', session);
  const fetchCategories = useCategoryStore((state: CategoryState) => state.fetchCategories);
  const fetchCourses = useCourseStore((state: CourseStoreState) => state.fetchCourses);
  // adapte useActionState à ton hook réel
  const [state, formAction, isPending] = useActionState<GalleryCropperState, FormData>(galleryCropperAction, { success: false } as GalleryCropperState);
  const picturesByIdRef = useRef<Map<string, PictureEntry>>(new Map());
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const { categories } = useCategoryStore((state: CategoryState) => state);
  const { courses } = useCourseStore((state: CourseStoreState) => state);

  useEffect(() => {
    if (!session) return;
    fetchCategories();
    fetchCourses();
  }, [session]);

  const form = useForm<GalleryCropperValues>({
    resolver: zodResolver(galleryCropperSchema),
    defaultValues: {
      userId: session?.userId ?? '',
      categoryId: null,
      activityId: null,
      newActivityName: '',
      pictures: [],
    },
    mode: 'onBlur',
  });

  // const { data: activities, isLoading: isLoadingActivities } = trpc.activity.getAll.useQuery();
  // const { data: courses, isLoading: isCoursesLoading } = trpc.course.getAll.useQuery();
  // const { data: stages, isLoading: isStagesLoading } = trpc.stage.getAll.useQuery();
  // const { data: events, isLoading: isEventsLoading } = trpc.event.getAll.useQuery();

  // if (isCategoriesLoading) return <div>Catégories en cours de chargement...</div>;
  
  // if (isCoursesLoading) return <div>Cours en cours de chargement...</div>;

  const selectedCategoryId = form.watch('categoryId');
  const selectedCategory = categories?.find((category) => category.id === Number(selectedCategoryId));
  // handler appelé par le cropper quand une image a été croppée
  const handleOnCrop = (indexOrId: number | string, cropped: CroppedImage) => {
    // on récupère l'array actuel
    const current = form.getValues('pictures') ?? [];
    const next = [...current];

    // si indexOrId est un number, on remplace à cet index
    if (typeof indexOrId === 'number') {
      next[indexOrId] = { name: cropped.name, base64: cropped.base64 };
    } else {
      // si tu veux mapper par id, il faudrait que le cropper renvoie l'id et que form stocke id => ici on assume index
      // fallback : push si pas d'index
      next.push({ name: cropped.name, base64: cropped.base64 });
    }

    form.setValue('pictures', next, { shouldValidate: true });
  };

  const handleOnChangeAll = (images: { name: string; preview: string }[]) => {
    // si tu veux synchroniser les previews initiales dans le form (optionnel)
    // on ne met que les previews déjà croppées (base64) ou on laisse vide jusqu'au crop final
  };

  const handleOnClear = () => {
    picturesByIdRef.current.clear();
    setOrderedIds([]);
    form.setValue('pictures', [], { shouldValidate: false });
  };

  const handleReset = (id: string) => {
  const entry = picturesByIdRef.current.get(id);
  if (!entry) return;

  // Remet la version croppée à l'originale
  picturesByIdRef.current.set(id, {
    ...entry,
    base64: entry.originalBase64,
  });

  // Met à jour le champ "pictures" du formulaire
  const nextPictures = orderedIds.map((i) => {
    const p = picturesByIdRef.current.get(i)!;
    return { name: p.name, base64: p.base64 };
  });
  form.setValue('pictures', nextPictures, { shouldValidate: true });
};

  return (
    <form
      action={formAction}
      onSubmit={async (e) => {
        const ok = await form.trigger();
        if (!ok) e.preventDefault();
      }}
    >
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

      {/* {selectedCategory?.type === 'stage' && courses && (
        <select {...form.register('activityId')}>
          <option value="">Sélectionne un stage</option>
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.label}
            </option>
          ))}
        </select>
      )} */}

      {/* {selectedCategory?.type === 'stage' && courses && (
        <select {...form.register('activityId')}>
          <option value="">Sélectionne un évènement</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.label}
            </option>
          ))}
        </select>
      )} */}

      {selectedCategory?.type === 'course' && courses && (
        <input
          {...form.register('newActivityName')}
          placeholder={`Nom de l'activité (${selectedCategory.type})`}
        />
      )}

      <GalleryDropCrop 
        onCrop={handleOnCrop}
        onChangeAll={handleOnChangeAll}
        onClear={handleOnClear} />

      <div className="flex flex-wrap gap-4 mt-4">
        {orderedIds.map((id) => {
          const p = picturesByIdRef.current.get(id)!;

          return (
            <div key={id} className='relative w-32 h-32 border rounded-md overflow-hidden'>
              <Image src={p.base64} alt={p.name} className="w-full h-full object-contain bg-gray-100" />
              <button
                type="button"
                onClick={() => handleReset(id)}
                className="absolute bottom-1 right-1 bg-yellow-500 text-white py-1 px-2 text-xs rounded"
              >
                Reset
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex mt-6 gap-4">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
          {isPending ? 'Envoi...' : 'Soumettre'}
        </button>
        {state?.success && (
          <span className='text-green-600'>✔ Envoi réussi</span>
        )}
      </div>
    </form>
  );
}