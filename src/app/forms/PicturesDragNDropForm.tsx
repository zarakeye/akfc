'use client';

import { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useActionState } from 'react';
import { picturesDragNDropFormAction, type PicturesDragNDropFormState } from '@/server/actions/picturesDragNDropForm.action';
import { useSessionStore } from '@/lib/stores/useSessionStore';
import { useCategoryStore } from '@/lib/stores/useCategoryStore';
import { useCourseStore } from '@/lib/stores/useCourseStore';
import type { PicturesDragNDropFormValuesType } from '@/types/picturesDragNDropForm.types';
import type { PictureItem } from '@/types/picture';
import Cropper from '@/app/gallery/ui/Cropper';
import { CropResult } from '@/types/cropper';

const initialState = { success: false };

export default function PicturesDragNDropForm() {
  const [state, formAction, isPending] = useActionState<PicturesDragNDropFormState, FormData>(
    picturesDragNDropFormAction,
    initialState
  );
  const user = useSessionStore(s => s.session?.user);
  const categories = useCategoryStore(s => s.categories);
  const courses = useCourseStore(s => s.courses);

  const [pictures, setPictures] = useState<PictureItem[]>([]);
  const [pictureToCrop, setPictureToCrop] = useState<PictureItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());


  const form = useForm<PicturesDragNDropFormValuesType>({
    defaultValues: {
      userId: '',
      categoryId: null,
      activityId: null,
      newActivityName: '',
      pictures: [],
    },
  });

  const { register } = form;
  const categoryId = form.watch('categoryId');

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
  useEffect(() => {
    if (!fileInputRef.current) return;

    const dt = new DataTransfer();

    pictures.forEach(p => {
      dt.items.add(p.file);
    });

    fileInputRef.current.files = dt.files;
  }, [pictures]);

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

  /**
   * Reset an image to its original state.
   *
   * @param {string} id - The ID of the image to reset.
   */
  const handleResetImage = (id: string) => {
    setPictures(prev => prev.map(p => p.id === id 
      ? {
        ...p,
        file: p.originalFile,
        previewUrl: URL.createObjectURL(p.originalFile),
      }
      : p
    ));
  };

  /**
   * Remove an image from the list of images to upload.
   *
   * @param {string} id - The ID of the image to remove.
   */
  const handleRemoveImage = (id: string) => {
    setPictures(prev => prev.filter(p => p.id !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  /**
   * Remove all images which are currently selected from the list of images to upload.
   * This function also resets the selection to an empty set.
   */
  const removeSelected = () => {
    setPictures(prev => prev.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  useEffect(() => {
    if (user?.id) {
      form.setValue('userId', user.id, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [user?.id, form]);

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <form
      action={formData => {
        // 🔒 Injection contrôlée des fichiers
        pictures.forEach(p => {
          formData.append('pictures', p.file);
        });
        // 🚀 Appel server action
        formAction(formData);
      }}
      onSubmit={async (e) => {
        const valid = await form.trigger();
        if (!valid) e.preventDefault();
      }}
      className="space-y-4 w-80"
    >
      {/* Hidden field pour le server action */}
      <input type="hidden" {...register('userId')} />

      {/* Select catégorie */}
      <label className="block font-semibold mb-1">Catégorie</label>
      <select
        {...register('categoryId')}
        onChange={(e) => {
          form.setValue('categoryId', e.target.value, {
            shouldDirty: true,
            shouldValidate: true
          });
          form.setValue('activityId', null);
          form.setValue('newActivityName', '');
        }}
        className="border rounded p-2 w-full"
      >
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
          <div>
            <label className="block font-semibold mt-4 mb-1">Cours</label>
            <select
              {...register('activityId')}
              onChange={(e) => {
                form.setValue('activityId', e.target.value, {
                  shouldDirty: true,
                  shouldValidate: true
                });
                // form.setValue('newActivityName', '');
              }}
              className="border rounded p-2 w-full"
            >
              <option value="">— Choisir un cours —</option>
              {courses.map(course => (
                <option key={course.id} value={String(course.id)}>
                  {course.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mt-4 mb-1">Entre l&apos;activité</label>
            <input
              {...register('newActivityName')}
              type="text"
              className="border rounded p-2 w-full" 
            />
          </div>
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
      <div className="grid grid-cols-3 gap-4 mt-4">
        {pictures.map(pic => (
          <div key={pic.id} className="relative w-32 h-32 border rounded overflow-hidden group">
          <img
            src={pic.previewUrl}
            alt=""
            className="w-full h-full object-contain cursor-pointer"
            onClick={() => setPictureToCrop(pic)} // <-- clic sur l'image seulement
          />

          <div className="absolute top-1 left-1 right-1 flex justify-between items-start z-10 pointer-events-auto">
            <input
              type="checkbox"
              className="scale-125 z-10"
              checked={selectedIds.has(pic.id)}
              onChange={(e) => { e.stopPropagation(); toggleSelect(pic.id); }}
            />
            <div className="flex flex-col gap-1 z-10">
              <button
                type="button"
                className="bg-red-500 text-white text-xs px-1 rounded"
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(pic.id); }}
              >
                🗑
              </button>
              <button
                type="button"
                className="bg-yellow-500 text-white text-xs px-1 rounded"
                onClick={(e) => { e.stopPropagation(); handleResetImage(pic.id); }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        ))}
      </div>

      {/* Bouton suppression en lot */}
      {selectedIds.size > 0 && (
        <button type="button" className="px-3 py-1 bg-red-600 text-white rounded mt-2" onClick={removeSelected}>
          Supprimer sélection
        </button>
      )}

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
