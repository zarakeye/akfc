'use client';

import { JSX, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { trpc } from '@trpc/trpcClient';
import { useSessionStore } from '@lib/stores/useSessionStore';
import { useCategoryStore } from '@lib/stores/useCategoryStore';

import type { PictureItem } from '@features/gallery-crop/types/picture.types';
import type { CropResult } from '@features/gallery-crop/types/cropper.types';
import Cropper from '@features/gallery-crop/components/Cropper';

/**
 * PicturesDragNDropForm
 *
 * Formulaire d'upload d'images / vidéos vers Cloudinary, branché sur le
 * pipeline tRPC moderne (modèle 2-niveaux Category → Discipline).
 *
 * Pipeline (par lot d'assets) :
 *   1. createUploadSignatures → reçoit N signatures pré-signées par le serveur
 *   2. POST direct client → Cloudinary, en parallèle (Promise.all)
 *   3. registerUploadedAssets → enregistre en DB SEULEMENT les uploads réussis
 *
 * Validation :
 *   - Champs métier (catégorie, discipline / nom proposé) : `react-hook-form`
 *     + Zod resolver (mode `onTouched`).
 *   - Fichiers : useState séparé (hors RHF, plus naturel pour des blobs).
 *     Validations explicites au drop et au submit (nombre, taille).
 *
 * Stratégie d'erreurs : on persiste les succès même en cas d'échec partiel.
 * Les fichiers en erreur restent dans la liste avec leur statut "error" pour
 * que l'utilisateur puisse les retry indépendamment.
 */

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const MAX_FILES_PER_BATCH = 20; // cohérent avec la limite du contrat Zod backend
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/* -------------------------------------------------------------------------- */
/*                              SCHÉMA DE FORM                                */
/* -------------------------------------------------------------------------- */

/**
 * Schéma client en français, calqué sémantiquement sur `uploadDestinationSchema`
 * du contrat backend mais avec des messages utilisateur localisés.
 */
const formSchema = z.discriminatedUnion('destinationKind', [
  z.object({
    destinationKind: z.literal('existing-discipline'),
    categoryId: z
      .number({ message: 'Choisis une catégorie' })
      .int()
      .positive({ message: 'Choisis une catégorie' }),
    disciplineId: z
      .number({ message: 'Choisis une discipline' })
      .int()
      .positive({ message: 'Choisis une discipline' }),
  }),
  z.object({
    destinationKind: z.literal('new-discipline'),
    categoryId: z
      .number({ message: 'Choisis une catégorie' })
      .int()
      .positive({ message: 'Choisis une catégorie' }),
    proposedDisciplineName: z
      .string()
      .trim()
      .min(1, { message: 'Nom requis' })
      .max(120, { message: 'Maximum 120 caractères' })
      .refine((v) => /[a-zA-Z0-9]/.test(v), {
        message: 'Le nom doit contenir au moins une lettre ou un chiffre',
      }),
  }),
]);

type FormValues = z.infer<typeof formSchema>;

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type UploadStatus =
  | 'pending'    // dans la liste, pas encore tenté
  | 'uploading'  // en cours d'upload Cloudinary
  | 'done'       // uploadé + enregistré en DB
  | 'error';     // l'upload OU l'enregistrement DB a échoué

type EnrichedPicture = PictureItem & {
  status: UploadStatus;
  errorMessage?: string;
};

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export default function PicturesDragNDropForm(): JSX.Element {
  const user = useSessionStore((s) => s.session?.user);
  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  useEffect(() => {
    if (categories.length === 0) {
      void fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // -------------------------------
  // Formulaire react-hook-form
  // -------------------------------
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      destinationKind: 'existing-discipline',
      // categoryId / disciplineId délibérément non set → forceront l'erreur
      // "Choisis une catégorie/discipline" si soumis vides.
    } as Partial<FormValues> as FormValues,
  });

  const destinationKind = watch('destinationKind');
  const categoryId = watch('categoryId');

  // Quand la catégorie change, on reset la sélection de discipline.
  useEffect(() => {
    setValue('disciplineId', undefined as unknown as number);
  }, [categoryId, setValue]);

  // -------------------------------
  // Disciplines de la catégorie sélectionnée
  // -------------------------------
  const disciplinesQuery = trpc.discipline.getAllByCategory.useQuery(
    { categoryId: categoryId ?? 0 },
    { enabled: typeof categoryId === 'number' && categoryId > 0 }
  );
  const disciplines = disciplinesQuery.data ?? [];

  // -------------------------------
  // Mutations tRPC
  // -------------------------------
  const createSignaturesMutation =
    trpc.cloudinary.createUploadSignatures.useMutation();
  const registerAssetsMutation =
    trpc.cloudinary.registerUploadedAssets.useMutation();

  // -------------------------------
  // État fichiers (hors form RHF)
  // -------------------------------
  const [pictures, setPictures] = useState<EnrichedPicture[]>([]);
  const [pictureToCrop, setPictureToCrop] = useState<PictureItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [filesError, setFilesError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // -------------------------------
  // Dropzone
  // -------------------------------
  const onDrop = (acceptedFiles: File[]) => {
    setFilesError(null);

    const oversized = acceptedFiles.filter(
      (f) => f.size > MAX_FILE_SIZE_BYTES
    );
    if (oversized.length > 0) {
      setFilesError(
        `Les fichiers suivants dépassent ${MAX_FILE_SIZE_MB} Mo : ${oversized.map((f) => f.name).join(', ')}`
      );
      return;
    }

    const validNew = acceptedFiles.filter(
      (f) => f.size <= MAX_FILE_SIZE_BYTES
    );
    setPictures((prev) => {
      const total = prev.length + validNew.length;
      if (total > MAX_FILES_PER_BATCH) {
        setFilesError(
          `Maximum ${MAX_FILES_PER_BATCH} fichiers par envoi (tu en aurais ${total}).`
        );
        return prev;
      }
      const next: EnrichedPicture[] = validNew.map((file) => ({
        id: crypto.randomUUID(),
        file,
        originalFile: file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
      }));
      return [...prev, ...next];
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
  });

  useEffect(() => {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    pictures.forEach((p) => dt.items.add(p.file));
    fileInputRef.current.files = dt.files;
  }, [pictures]);

  // -------------------------------
  // Cropper
  // -------------------------------
  const handleCrop = ({ pictureId, croppedFile }: CropResult) => {
    setPictures((prev) =>
      prev.map((pic) => {
        if (pic.id !== pictureId) return pic;
        return {
          ...pic,
          file: croppedFile,
          previewUrl: URL.createObjectURL(croppedFile),
          // Un crop "rouvre" l'image pour upload : on remet à pending.
          status: 'pending',
          errorMessage: undefined,
        };
      })
    );
    setPictureToCrop(null);
  };

  const handleResetImage = (id: string) => {
    setPictures((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              file: p.originalFile,
              previewUrl: URL.createObjectURL(p.originalFile),
              status: 'pending',
              errorMessage: undefined,
            }
          : p
      )
    );
  };

  const handleRemoveImage = (id: string) => {
    setPictures((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeSelected = () => {
    setPictures((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  // -------------------------------
  // Soumission
  // -------------------------------
  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setFilesError(null);

    if (!user?.id) {
      setSubmitError('Tu dois être connecté pour envoyer des fichiers.');
      return;
    }

    const toUpload = pictures.filter(
      (p) => p.status === 'pending' || p.status === 'error'
    );
    if (toUpload.length === 0) {
      setFilesError('Ajoute au moins une image ou vidéo à envoyer.');
      return;
    }

    setIsSubmitting(true);

    setPictures((prev) =>
      prev.map((p) =>
        toUpload.find((t) => t.id === p.id)
          ? { ...p, status: 'uploading', errorMessage: undefined }
          : p
      )
    );

    const destination =
      values.destinationKind === 'existing-discipline'
        ? {
            kind: 'existing-discipline' as const,
            categoryId: values.categoryId,
            disciplineId: values.disciplineId,
          }
        : {
            kind: 'new-discipline' as const,
            categoryId: values.categoryId,
            proposedDisciplineName: values.proposedDisciplineName.trim(),
          };

    try {
      const signatures = await createSignaturesMutation.mutateAsync({
        destination,
        assets: toUpload.map((p) => ({
          fileName: p.file.name,
          mimeType: p.file.type,
          mediaType: p.file.type.startsWith('video/') ? 'video' : 'image',
        })),
      });

      type UploadOutcome =
        | {
            ok: true;
            pictureId: string;
            cloudinaryAsset: {
              publicId: string;
              secureUrl: string;
              resourceType: 'image' | 'video';
              format?: string;
              bytes: number;
              width?: number;
              height?: number;
              duration?: number;
            };
          }
        | { ok: false; pictureId: string; error: string };

      const results = await Promise.all(
        toUpload.map(async (picture, idx): Promise<UploadOutcome> => {
          const sig = signatures[idx];
          try {
            const formData = new FormData();
            formData.append('file', picture.file);
            formData.append('api_key', sig.apiKey);
            formData.append('timestamp', String(sig.timestamp));
            formData.append('signature', sig.signature);
            formData.append('folder', sig.folder);
            formData.append('public_id', sig.publicId);
            formData.append('type', sig.type);

            const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`;
            const res = await fetch(url, { method: 'POST', body: formData });

            if (!res.ok) {
              const text = await res.text();
              throw new Error(`Cloudinary HTTP ${res.status}: ${text}`);
            }

            const data = await res.json();

            return {
              ok: true,
              pictureId: picture.id,
              cloudinaryAsset: {
                publicId: data.public_id,
                secureUrl: data.secure_url,
                resourceType: sig.resourceType,
                format: data.format,
                bytes: data.bytes,
                width: data.width,
                height: data.height,
                duration: data.duration,
              },
            };
          } catch (err) {
            return {
              ok: false,
              pictureId: picture.id,
              error: err instanceof Error ? err.message : 'Upload failed',
            };
          }
        })
      );

      const successes = results.filter(
        (r): r is UploadOutcome & { ok: true } => r.ok
      );
      const failures = results.filter(
        (r): r is UploadOutcome & { ok: false } => !r.ok
      );

      if (successes.length > 0) {
        const pictureById = new Map(toUpload.map((p) => [p.id, p]));

        const registered = await registerAssetsMutation.mutateAsync({
          destination,
          assets: successes.map((s) => {
            const pic = pictureById.get(s.pictureId)!;
            const sig = signatures[
              toUpload.findIndex((p) => p.id === s.pictureId)
            ];
            return {
              ...s.cloudinaryAsset,
              originalFileName: pic.file.name,
              mimeType: pic.file.type,
              folder: sig.folder,
            };
          }),
        });

        setPictures((prev) =>
          prev.map((p) =>
            successes.find((s) => s.pictureId === p.id)
              ? { ...p, status: 'done' as UploadStatus }
              : p
          )
        );

        setSubmitSuccess(registered.assets.length);
      }

      if (failures.length > 0) {
        setPictures((prev) =>
          prev.map((p) => {
            const fail = failures.find((f) => f.pictureId === p.id);
            return fail
              ? {
                  ...p,
                  status: 'error' as UploadStatus,
                  errorMessage: fail.error,
                }
              : p;
          })
        );

        setSubmitError(
          `${failures.length} fichier(s) en erreur — voir détail sur chaque image. Tu peux re-soumettre pour réessayer.`
        );
      }
    } catch (err) {
      setPictures((prev) =>
        prev.map((p) =>
          p.status === 'uploading'
            ? {
                ...p,
                status: 'error' as UploadStatus,
                errorMessage: 'Submission failed',
              }
            : p
        )
      );
      setSubmitError(
        err instanceof Error ? err.message : 'Une erreur est survenue.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-80">
      <input ref={fileInputRef} type="file" multiple hidden />

      {/* Catégorie */}
      <div>
        <label className="block font-semibold mb-1">Catégorie</label>
        <select
          {...register('categoryId', { valueAsNumber: true })}
          className="border rounded p-2 w-full"
        >
          <option value="">— Choisir une catégorie —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.type}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-sm text-red-600 mt-1">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Choix kind */}
      {typeof categoryId === 'number' && categoryId > 0 && (
        <>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="existing-discipline"
                {...register('destinationKind')}
              />
              Discipline existante
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="new-discipline"
                {...register('destinationKind')}
              />
              Nouvelle (à valider)
            </label>
          </div>

          {destinationKind === 'existing-discipline' && (
            <div>
              <label className="block font-semibold mb-1">Discipline</label>
              <Controller
                name="disciplineId"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )
                    }
                    onBlur={field.onBlur}
                    className="border rounded p-2 w-full"
                    disabled={disciplinesQuery.isLoading}
                  >
                    <option value="">— Choisir une discipline —</option>
                    {disciplines.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {disciplinesQuery.isLoading && (
                <p className="text-sm text-gray-500 mt-1">Chargement…</p>
              )}
              {'disciplineId' in errors && errors.disciplineId && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.disciplineId.message}
                </p>
              )}
            </div>
          )}

          {destinationKind === 'new-discipline' && (
            <div>
              <label className="block font-semibold mb-1">
                Nom de la nouvelle discipline
              </label>
              <input
                type="text"
                {...register('proposedDisciplineName')}
                className="border rounded p-2 w-full"
                placeholder="Ex : Stage été 2026 — Kali"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cette discipline sera proposée à un admin pour validation.
              </p>
              {'proposedDisciplineName' in errors &&
                errors.proposedDisciplineName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.proposedDisciplineName.message}
                  </p>
                )}
            </div>
          )}
        </>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 rounded-md text-center mt-4 ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive
          ? 'Dépose ici'
          : `Glisse des images/vidéos ou clique (max ${MAX_FILES_PER_BATCH}, ${MAX_FILE_SIZE_MB} Mo / fichier)`}
      </div>

      {filesError && (
        <p className="text-sm text-red-600">{filesError}</p>
      )}

      {/* Previews + statuts */}
      {pictures.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {pictures.map((pic) => (
            <div
              key={pic.id}
              className="relative w-32 h-32 border rounded overflow-hidden group"
            >
              <img
                src={pic.previewUrl}
                alt=""
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setPictureToCrop(pic)}
              />

              {pic.status !== 'pending' && (
                <div
                  className={`absolute bottom-0 left-0 right-0 text-xs text-white text-center py-0.5 ${
                    pic.status === 'uploading'
                      ? 'bg-blue-600/80'
                      : pic.status === 'done'
                      ? 'bg-green-600/80'
                      : 'bg-red-600/80'
                  }`}
                  title={pic.errorMessage}
                >
                  {pic.status === 'uploading' && '⏳ Upload…'}
                  {pic.status === 'done' && '✅ OK'}
                  {pic.status === 'error' && '⚠️ Erreur'}
                </div>
              )}

              <div className="absolute top-1 left-1 right-1 flex justify-between items-start z-10 pointer-events-auto">
                <input
                  type="checkbox"
                  className="scale-125 z-10"
                  checked={selectedIds.has(pic.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelect(pic.id);
                  }}
                />
                <div className="flex flex-col gap-1 z-10">
                  <button
                    type="button"
                    className="bg-red-500 text-white text-xs px-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(pic.id);
                    }}
                  >
                    🗑
                  </button>
                  <button
                    type="button"
                    className="bg-yellow-500 text-white text-xs px-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetImage(pic.id);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedIds.size > 0 && (
        <button
          type="button"
          className="px-3 py-1 bg-red-600 text-white rounded mt-2"
          onClick={removeSelected}
        >
          Supprimer sélection ({selectedIds.size})
        </button>
      )}

      {pictureToCrop && (
        <Cropper
          picture={pictureToCrop}
          onCancel={() => setPictureToCrop(null)}
          onCrop={handleCrop}
        />
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed w-full mt-4"
      >
        {isSubmitting ? 'Envoi…' : 'Envoyer'}
      </button>

      {submitSuccess !== null && (
        <p className="text-sm text-green-700">
          ✅ {submitSuccess} fichier(s) enregistré(s) avec succès.
        </p>
      )}
      {submitError && (
        <p className="text-sm text-red-700">⚠️ {submitError}</p>
      )}
    </form>
  );
}