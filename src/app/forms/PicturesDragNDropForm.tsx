'use client';

import { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useActionState } from 'react';
import { picturesDragNDropFormAction, type PicturesDragNDropFormState } from '@/server/actions/picturesDragNDropForm.action';
import { useUserStore } from '@/lib/stores/useUserStore';
import { useCategoryStore } from '@/lib/stores/useCategoryStore';
import { useCourseStore } from '@/lib/stores/useCourseStore';
import type { PicturesDragNDropFormValuesType } from '@/types/picturesDragNDropForm.types';
import type { PictureItem } from '@/types/picture';
import Cropper from '@/app/gallery/ui/Cropper';
import { CropResult } from '@/types/cropper';

// type LocalPicture = {
//   id: string;
//   file: File;           // version actuelle pour submit
//   originalFile: File;   // version originale pour reset
//   previewUrl: string;   // pour la preview
// };

const initialState = { success: false };

export default function PicturesDragNDropForm() {
  const [state, formAction, isPending] = useActionState<PicturesDragNDropFormState, FormData>(
    picturesDragNDropFormAction,
    initialState
  );

  const [pictures, setPictures] = useState<PictureItem[]>([]);
  const [pictureToCrop, setPictureToCrop] = useState<PictureItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<PicturesDragNDropFormValuesType>({
    defaultValues: {
      userId: '',
      categoryId: null,
      activityId: null,
      newActivityName: '',
      pictures: [],
    },
  });

  const { register, watch } = form;

  const { user } = useUserStore();
  const { categories } = useCategoryStore();
  const { courses } = useCourseStore();

  const categoryId = watch('categoryId');

  // -------------------------------
  // Dropzone
  // -------------------------------
  const onDrop = (acceptedFiles: File[]) => {
    const next = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPictures(prev => [...prev, ...next]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  // -------------------------------
  // Synchroniser input file réel
  // -------------------------------
  // useEffect(() => {
  //   if (!fileInputRef.current) return;

  //   const dt = new DataTransfer();

  //   pictures.forEach(p => {
  //     dt.items.add(p.file);
  //   });

  //   fileInputRef.current.files = dt.files;
  // }, [pictures]);

  // -------------------------------
  // Handlers Cropper (à brancher plus tard)
  // -------------------------------
  const handleCrop = ({ pictureId, croppedFile }: CropResult) => {
    setPictures(prev =>
      prev.map(pic => {
        if (pic.id !== pictureId) return pic;
        console.log('🟩 preview remplacée pour :', pictureId);

        return {
          ...pic,
          file: croppedFile,
          previewUrl: URL.createObjectURL(croppedFile),
        };
      })
    );

    setPictureToCrop(null);
  };

  const handleResetImage = (id: string) => {
    
  };

  const handleRemoveImage = (id: string) => {
    // setPictures(prev => prev.filter(p => p.id !== id));
  };

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <form action={formData => {
      // 🔒 Injection contrôlée des fichiers
      pictures.forEach(p => {
        formData.append('pictures', p.file);
      });

      // 🚀 Appel server action
      formAction(formData);
    }}>
      {/* Hidden fields pour le server action */}
      <input type="hidden" {...register('userId')} value={user?.id ?? ''} />
      <input type="hidden" {...register('categoryId')} value={form.getValues('categoryId') ?? ''} />
      <input type="hidden" {...register('activityId')} value={form.getValues('activityId') ?? ''} />
      <input type="hidden" {...register('newActivityName')} value={form.getValues('newActivityName') ?? ''} />
      {/* <input
        ref={fileInputRef}
        type="file"
        name='pictures'
        multiple
        hidden
      /> */}

      {/* Select catégorie */}
      <label className="block font-semibold mb-1">Catégorie</label>
      <select {...register('categoryId')} className="border rounded p-2 w-full">
        <option value="">— Choisir une catégorie —</option>
        {categories.map(cat => (
          <option key={cat.id} value={String(cat.id)}>
            {cat.type}
          </option>
        ))}
      </select>

      {/* Select cours si catégorie Cours */}
      {categoryId === '1' && (
        <>
          <label className="block font-semibold mt-4 mb-1">Cours</label>
          <select {...register('activityId')} className="border rounded p-2 w-full">
            <option value="">— Choisir un cours —</option>
            {courses.map(course => (
              <option key={course.id} value={String(course.id)}>
                {course.label}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 rounded-md text-center mt-4 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? 'Dépose ici' : 'Glisse des images ou clique'}
      </div>

      {/* Previews */}
      <div className="grid grid-cols-3 gap-4">
      {pictures.map((pic) => (
        <button
          key={pic.id}
          type="button"
          onClick={() => setPictureToCrop(pic)}
          className="relative w-30 h-30 border rounded overflow-hidden bg-gray-100"
        >
          <img
            src={pic.previewUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-contain cursor-pointer"
          />
        </button>
      ))}
      </div>

      {/* Cropper */}
      {pictureToCrop && (
        <Cropper
          picture={pictureToCrop}
          onCancel={() => setPictureToCrop(null)}
          onCrop={handleCrop}
        />
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isPending ? 'Envoi…' : 'Envoyer'}
      </button>

      {state?.error && <p className="text-red-600 mt-2">{state.error}</p>}
      {state?.success && <p className="text-green-600 mt-2">✔ OK</p>}
    </form>
  );
}
