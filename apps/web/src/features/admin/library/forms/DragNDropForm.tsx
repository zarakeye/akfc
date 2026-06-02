'use client';

import { JSX, useState, useRef, useEffect } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { trpc } from '@trpc/trpcClient';
import { useSessionStore } from '@lib/stores/useSessionStore';
import { useCategoryStore } from '@lib/stores/useCategoryStore';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { APP_ROOT } from '@config/app';
import { pickBackend, type StorageProvider } from '@contracts/storage';

import type { PictureItem } from '@features/gallery-crop/types/picture.types';
import type { CropResult } from '@features/gallery-crop/types/cropper.types';
import Cropper from '@features/gallery-crop/components/Cropper';

/**
 * DragNDropForm — multi-backend (Cloudinary + R2)
 *
 * Formulaire d'upload pour la bibliothèque AKFC. Accepte plusieurs types de
 * fichiers (images, vidéos, audios, docs, archives) et **dispatche
 * automatiquement** sur le bon backend de stockage :
 *
 *   - image/*, video/*   → Cloudinary (transformations à la volée)
 *   - audio, docs, zip   → R2 (zero egress, stockage froid)
 *
 * Le dispatch repose sur `pickBackend(mimeType)` (`@contracts/storage`) —
 * même règle que côté finder pour la cohérence.
 *
 * ─── Pipeline d'upload (par lot dropé) ──────────────────────────────────
 *
 *   1. Split par backend (cloudinaryItems vs r2Items via `pickBackend`)
 *   2. Cloudinary, en batch (une seule signature pour N assets) :
 *      - `storage.createUploadAuthorization({ provider: 'cloudinary', ... })`
 *      - `POST` direct vers Cloudinary en parallèle (Promise.all)
 *      - `storage.registerUploadedAsset` une fois pour les succès
 *   3. R2, par fichier (presigned POST = 1 signature = 1 fichier) :
 *      - `storage.createR2Upload({ path, mimeType, maxBytes })`
 *      - `POST` multipart vers l'URL presigned R2 avec les fields
 *      - `storage.registerR2Upload` pour confirmer côté backend
 *   4. Merge des résultats, update des statuts UI
 *
 * ─── Path R2 ──────────────────────────────────────────────────────────────
 *
 * Le path R2 est calculé côté UI à partir de la destination métier sélectionnée
 * (catégorie + discipline). Slugification simple (lowercase, accents strippés,
 * espaces en `-`). Format : `${APP_ROOT}/pending/${categorySlug}/${disciplineSlug}/${fileName}`.
 *
 * ─── Convertisseurs côté UI ──────────────────────────────────────────────
 *
 * NON implémentés dans cette livraison. Hook potentiel : juste avant l'upload
 * dans `uploadR2Single` / `uploadCloudinarySingle`, on peut intercepter le
 * fichier et lui appliquer une transformation (`browser-image-compression`
 * pour les images, `ffmpeg.wasm` pour audio/vidéo). Coût bundle élevé donc
 * différé jusqu'à un cas d'usage concret. Cloudinary fait déjà la conversion
 * `auto` à la livraison (URLs `f_auto`), donc seul R2 mériterait des
 * convertisseurs côté UI à terme.
 */

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const MAX_FILES_PER_BATCH = 20;

/**
 * Tailles max différenciées par backend :
 *   - Cloudinary : 50 Mo (cohérent avec ses transformations on-the-fly)
 *   - R2 : 500 Mo (cohérent avec HARD_MAX_UPLOAD_BYTES côté adapter,
 *                  utile pour audios de cours longs ou archives)
 */
const MAX_FILE_SIZE_CLOUDINARY_MB = 50;
const MAX_FILE_SIZE_R2_MB = 500;
const MAX_FILE_SIZE_CLOUDINARY_BYTES = MAX_FILE_SIZE_CLOUDINARY_MB * 1024 * 1024;
const MAX_FILE_SIZE_R2_BYTES = MAX_FILE_SIZE_R2_MB * 1024 * 1024;

/**
 * Liste explicite des types MIME acceptés. Refuse les formats exotiques
 * (RAR, 7z, BMP, TIFF, FLAC, AAC...) volontairement — réduit la surface
 * d'attaque et garantit que tout ce qui rentre est servable / lisible
 * dans les outils standards.
 *
 * Pour étendre, ajouter ici (et vérifier que `pickBackend` couvre le MIME).
 */
const ACCEPTED_MIME_TYPES: Accept = {
  // Images (Cloudinary)
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
  'image/gif': ['.gif'],
  // Vidéos (Cloudinary)
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
  // Audios (R2)
  'audio/mpeg': ['.mp3'],
  'audio/mp4': ['.m4a'],
  'audio/ogg': ['.ogg', '.oga'],
  'audio/wav': ['.wav'],
  // Docs (R2)
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md', '.markdown'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  // Archives (R2)
  'application/zip': ['.zip'],
};

/* -------------------------------------------------------------------------- */
/*                              SCHÉMA DE FORM                                */
/* -------------------------------------------------------------------------- */

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

type Destination =
  | {
      kind: 'existing-discipline';
      categoryId: number;
      disciplineId: number;
    }
  | {
      kind: 'new-discipline';
      categoryId: number;
      proposedDisciplineName: string;
    };

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type UploadStatus =
  | 'pending'    // dans la liste, pas encore tenté
  | 'uploading'  // en cours d'upload (Cloudinary OU R2)
  | 'done'       // uploadé + enregistré en DB
  | 'error';     // l'upload OU l'enregistrement a échoué

/**
 * Item de la file d'upload. Étend `PictureItem` (qui apporte
 * `id/file/originalFile/previewUrl`) avec des champs internes du formulaire
 * (statut, message d'erreur, backend cible).
 *
 * Le nom de type `PictureItem` est conservé en upstream (`@features/gallery-crop`)
 * pour rester compatible avec le `Cropper` ; côté UI on parle d'`items` plus
 * généralement pour refléter qu'on n'a plus seulement des images.
 */
type EnrichedItem = PictureItem & {
  status: UploadStatus;
  errorMessage?: string;
  backend: StorageProvider;
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

/**
 * Map extension → MIME pour les types qu'on accepte. Sert de fallback quand
 * le navigateur n'a pas attribué de MIME au fichier (cas typique : `.md`,
 * `.markdown` sur certaines combinaisons OS+browser où le mapping système
 * est absent, ce qui donne `file.type === ''`).
 *
 * IMPORTANT : ce mapping doit être cohérent avec `ACCEPTED_MIME_TYPES`
 * ci-dessus. Si on ajoute un type ici, vérifier qu'il est aussi dans la
 * liste d'acceptation du dropzone.
 */
const EXT_TO_MIME: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  // Vidéos
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  // Audios
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  wav: 'audio/wav',
  // Docs
  pdf: 'application/pdf',
  txt: 'text/plain',
  md: 'text/markdown',
  markdown: 'text/markdown',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Archives
  zip: 'application/zip',
};

function resolveMimeFromExtension(filename: string): string | null {
  const dotIdx = filename.lastIndexOf('.');
  if (dotIdx === -1 || dotIdx === filename.length - 1) return null;
  const ext = filename.slice(dotIdx + 1).toLowerCase();
  return EXT_TO_MIME[ext] ?? null;
}

/**
 * Si le navigateur n'a pas attribué de MIME au fichier (ex: `.md` sur Firefox),
 * on en déduit un depuis l'extension. Comme `File.type` est read-only, on
 * recrée un `File` avec le MIME correct.
 *
 * Cette étape est CRITIQUE pour les uploads R2 car le `Content-Type` envoyé
 * par le navigateur lors du POST multipart est dérivé de `file.type`. Le
 * presigned POST policy R2 verrouille ce header en `eq` strict — si on envoie
 * vide ou différent, R2 refuse le upload.
 */
function ensureMimeType(file: File): File {
  if (file.type && file.type.length > 0) return file;
  const resolved = resolveMimeFromExtension(file.name);
  if (!resolved) return file; // pas pu résoudre — sera filtré ailleurs si problématique
  return new File([file], file.name, {
    type: resolved,
    lastModified: file.lastModified,
  });
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Renvoie la taille max autorisée pour ce fichier selon son backend cible.
 * Le `pickBackend` est la même règle que celle qui décidera de la route
 * d'upload au submit, donc cette validation est cohérente avec ce qui
 * sera réellement permis côté backend.
 */
function getMaxBytesForFile(file: File): number {
  return pickBackend(file.type) === 'cloudinary'
    ? MAX_FILE_SIZE_CLOUDINARY_BYTES
    : MAX_FILE_SIZE_R2_BYTES;
}

function isImageOrVideo(file: File): boolean {
  return file.type.startsWith('image/') || file.type.startsWith('video/');
}

/**
 * Icône typée pour la preview UI quand on n'a pas de vignette image.
 * Couvre les grands groupes : audio, doc, archive. Le `pickIcon` du finder
 * fait la même chose côté UI mais on en a une version locale dégradée ici
 * pour ne pas créer de dépendance UI inter-modules.
 */
function iconForMime(mime: string): string {
  if (mime.startsWith('audio/')) return '🎵';
  if (mime.startsWith('video/')) return '🎬';
  if (mime.startsWith('image/')) return '🖼️';
  if (mime === 'application/pdf') return '📕';
  if (mime === 'application/zip') return '🗜️';
  if (mime.startsWith('text/')) return '📝';
  if (mime.includes('word')) return '📘';
  return '📄';
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export default function DragNDropForm(): JSX.Element {
  const user = useSessionStore((s) => s.session?.user);
  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  // Trigger d'invalidation du cache finder, appelé après upload réussi
  // pour que la prochaine visite de /admin/dashboard/library affiche
  // immédiatement les nouveaux fichiers sans nécessiter un reload manuel.
  // Le store Zustand est global, donc cet appel impacte le finder même
  // s'il est démonté actuellement (autre page).
  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);

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
    } as Partial<FormValues> as FormValues,
  });

  const destinationKind = watch('destinationKind');
  const categoryId = watch('categoryId');

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
  //
  // - Cloudinary : procédures unifiées (provider explicite dans le payload)
  // - R2 : procédures dédiées (modèle d'upload trop différent pour mutualiser)
  // -------------------------------
  const createUploadAuthMutation =
    trpc.storage.createUploadAuthorization.useMutation();
  const registerUploadedAssetMutation =
    trpc.storage.registerUploadedAsset.useMutation();
  const createR2UploadMutation = trpc.storage.createR2Upload.useMutation();
  const registerR2UploadMutation = trpc.storage.registerR2Upload.useMutation();

  // -------------------------------
  // État items (hors form RHF)
  // -------------------------------
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [itemToCrop, setItemToCrop] = useState<PictureItem | null>(null);
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

    // Étape 1 : résoudre les MIME manquants (cas `.md` sur Firefox/Safari etc.)
    // Cette résolution est obligatoire avant les validations qui suivent
    // pour que pickBackend(file.type) raisonne sur un MIME correct.
    const normalizedFiles = acceptedFiles.map(ensureMimeType);

    // Étape 2 : validation taille — différenciée par backend cible
    const oversized = normalizedFiles.filter(
      (f) => f.size > getMaxBytesForFile(f)
    );
    if (oversized.length > 0) {
      setFilesError(
        `Fichiers trop volumineux : ${oversized
          .map((f) => {
            const max = getMaxBytesForFile(f) / 1024 / 1024;
            return `${f.name} (max ${max} Mo pour ce type)`;
          })
          .join(', ')}`
      );
      return;
    }

    const validNew = normalizedFiles.filter(
      (f) => f.size <= getMaxBytesForFile(f)
    );

    setItems((prev) => {
      const total = prev.length + validNew.length;
      if (total > MAX_FILES_PER_BATCH) {
        setFilesError(
          `Maximum ${MAX_FILES_PER_BATCH} fichiers par envoi (tu en aurais ${total}).`
        );
        return prev;
      }
      const next: EnrichedItem[] = validNew.map((file) => ({
        id: crypto.randomUUID(),
        file,
        originalFile: file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
        backend: pickBackend(file.type),
      }));
      return [...prev, ...next];
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_MIME_TYPES,
  });

  useEffect(() => {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    items.forEach((it) => dt.items.add(it.file));
    fileInputRef.current.files = dt.files;
  }, [items]);

  // -------------------------------
  // Cropper (images uniquement)
  // -------------------------------
  const handleCrop = ({ pictureId, croppedFile }: CropResult) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== pictureId) return it;
        return {
          ...it,
          file: croppedFile,
          previewUrl: URL.createObjectURL(croppedFile),
          // Le crop ne change pas le backend (toujours image/* → Cloudinary)
          status: 'pending',
          errorMessage: undefined,
        };
      })
    );
    setItemToCrop(null);
  };

  const handleResetItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              file: it.originalFile,
              previewUrl: URL.createObjectURL(it.originalFile),
              status: 'pending',
              errorMessage: undefined,
            }
          : it
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
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
    setItems((prev) => prev.filter((it) => !selectedIds.has(it.id)));
    setSelectedIds(new Set());
  };

  // -------------------------------
  // Helpers — path R2
  // -------------------------------

  /**
   * Construit le path R2 pour un fichier à partir de la destination métier.
   * Reconstruit ce que le backend Cloudinary fait en interne, mais côté UI
   * car le path R2 doit être fourni à `createR2Upload`.
   *
   * Pour `existing-discipline` : utilise les noms de catégorie/discipline
   * récupérés des stores. Pour `new-discipline` : utilise le nom proposé.
   */
  const buildR2Path = (destination: Destination, fileName: string): string => {
    const category = categories.find((c) => c.id === destination.categoryId);
    const categorySlug = slugify(category?.type ?? `cat-${destination.categoryId}`);

    let disciplineSlug: string;
    if (destination.kind === 'existing-discipline') {
      const discipline = disciplines.find(
        (d) => d.id === destination.disciplineId
      );
      disciplineSlug = slugify(
        discipline?.name ?? `disc-${destination.disciplineId}`
      );
    } else {
      disciplineSlug = slugify(destination.proposedDisciplineName);
    }

    // Slugifier aussi le filename pour éviter les caractères problématiques
    // dans une key S3/R2 (accents, espaces, etc.). On préserve l'extension.
    const dotIdx = fileName.lastIndexOf('.');
    const baseName = dotIdx === -1 ? fileName : fileName.slice(0, dotIdx);
    const ext = dotIdx === -1 ? '' : fileName.slice(dotIdx);
    const safeFileName = `${slugify(baseName)}${ext.toLowerCase()}`;

    return `${APP_ROOT}/pending/${categorySlug}/${disciplineSlug}/${safeFileName}`;
  };

  // -------------------------------
  // Upload — Cloudinary (batch)
  // -------------------------------
  type CloudinaryUploadOutcome =
    | {
        ok: true;
        itemId: string;
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
    | { ok: false; itemId: string; error: string };

  async function uploadCloudinaryBatch(
    cloudinaryItems: EnrichedItem[],
    destination: Destination
  ): Promise<{
    outcomes: CloudinaryUploadOutcome[];
    registeredCount: number;
  }> {
    if (cloudinaryItems.length === 0) {
      return { outcomes: [], registeredCount: 0 };
    }

    // Phase 1 : récupérer les signatures (1 appel pour N assets)
    const signatures = await createUploadAuthMutation.mutateAsync({
      provider: 'cloudinary',
      destination,
      assets: cloudinaryItems.map((it) => ({
        fileName: it.file.name,
        mimeType: it.file.type,
        mediaType: it.file.type.startsWith('video/') ? 'video' : 'image',
      })),
    });

    // Phase 2 : POST en parallèle vers Cloudinary
    const outcomes: CloudinaryUploadOutcome[] = await Promise.all(
      cloudinaryItems.map(async (item, idx): Promise<CloudinaryUploadOutcome> => {
        const sig = signatures[idx];
        try {
          const formData = new FormData();
          formData.append('file', item.file);
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
            itemId: item.id,
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
            itemId: item.id,
            error: err instanceof Error ? err.message : 'Upload failed',
          };
        }
      })
    );

    // Phase 3 : enregistrer en DB les succès
    const successes = outcomes.filter(
      (r): r is CloudinaryUploadOutcome & { ok: true } => r.ok
    );

    let registeredCount = 0;
    if (successes.length > 0) {
      const itemById = new Map(cloudinaryItems.map((it) => [it.id, it]));
      const registered = await registerUploadedAssetMutation.mutateAsync({
        provider: 'cloudinary',
        destination,
        assets: successes.map((s) => {
          const it = itemById.get(s.itemId)!;
          const sig =
            signatures[cloudinaryItems.findIndex((i) => i.id === s.itemId)];
          return {
            ...s.cloudinaryAsset,
            originalFileName: it.file.name,
            mimeType: it.file.type,
            folder: sig.folder,
          };
        }),
      });
      // Cloudinary register procedure returns { assets: [...] }
      registeredCount = registered.assets.length;
    }

    return { outcomes, registeredCount };
  }

  // -------------------------------
  // Upload — R2 (par fichier)
  // -------------------------------
  type R2UploadOutcome =
    | { ok: true; itemId: string; path: string; bytes: number }
    | { ok: false; itemId: string; error: string };

  async function uploadR2Single(
    item: EnrichedItem,
    destination: Destination
  ): Promise<R2UploadOutcome> {
    const path = buildR2Path(destination, item.file.name);

    try {
      // Phase 1 : presigned PUT (R2 ne supporte pas POST Object API).
      // L'URL retournée embarque la signature SigV4 dans ses query params.
      const auth = await createR2UploadMutation.mutateAsync({
        path,
        mimeType: item.file.type,
        maxBytes: item.file.size,
      });

      // Phase 2 : PUT direct vers R2 — body = binaire brut.
      //
      // Le Content-Type est intégré à la signature côté serveur ; il doit
      // matcher exactement, sinon R2 rejette en 403 SignatureDoesNotMatch.
      // Pas de FormData ici (presigned PUT, pas POST).
      const res = await fetch(auth.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': item.file.type,
        },
        body: item.file,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`R2 HTTP ${res.status}: ${text.slice(0, 200)}`);
      }

      // Phase 3 : confirmer côté backend (HeadObject + validation cohérence).
      // Cette étape est aussi notre rempart contre les abus de taille
      // (`registerR2Upload` rejette si la taille réelle diverge).
      const result = await registerR2UploadMutation.mutateAsync({
        path,
        expectedBytes: item.file.size,
        expectedMimeType: item.file.type,
        destination,                       // ← déjà construit dans onSubmit
        originalFileName: item.file.name,  // ← depuis le File natif
      });

      return {
        ok: true,
        itemId: item.id,
        path: result.path,
        bytes: result.bytes,
      };
    } catch (err) {
      return {
        ok: false,
        itemId: item.id,
        error: err instanceof Error ? err.message : 'Upload R2 failed',
      };
    }
  }

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

    const toUpload = items.filter(
      (it) => it.status === 'pending' || it.status === 'error'
    );
    if (toUpload.length === 0) {
      setFilesError('Ajoute au moins un fichier à envoyer.');
      return;
    }

    setIsSubmitting(true);

    setItems((prev) =>
      prev.map((it) =>
        toUpload.find((t) => t.id === it.id)
          ? { ...it, status: 'uploading', errorMessage: undefined }
          : it
      )
    );

    const destination: Destination =
      values.destinationKind === 'existing-discipline'
        ? {
            kind: 'existing-discipline',
            categoryId: values.categoryId,
            disciplineId: values.disciplineId,
          }
        : {
            kind: 'new-discipline',
            categoryId: values.categoryId,
            proposedDisciplineName: values.proposedDisciplineName.trim(),
          };

    // Split par backend cible (déjà calculé au drop, on s'en sert)
    const cloudinaryItems = toUpload.filter((it) => it.backend === 'cloudinary');
    const r2Items = toUpload.filter((it) => it.backend === 'r2');

    try {
      // Les deux pipelines tournent en parallèle (indépendants par construction).
      const [cloudinaryRes, r2Res] = await Promise.all([
        uploadCloudinaryBatch(cloudinaryItems, destination),
        Promise.all(r2Items.map((it) => uploadR2Single(it, destination))),
      ]);

      const cloudinaryOutcomes = cloudinaryRes.outcomes;
      const r2Outcomes = r2Res;

      // Update statuts UI
      const successIds = new Set<string>([
        ...cloudinaryOutcomes.filter((o) => o.ok).map((o) => o.itemId),
        ...r2Outcomes.filter((o) => o.ok).map((o) => o.itemId),
      ]);
      const failures = new Map<string, string>([
        ...cloudinaryOutcomes
          .filter((o): o is CloudinaryUploadOutcome & { ok: false } => !o.ok)
          .map((o): [string, string] => [o.itemId, o.error]),
        ...r2Outcomes
          .filter((o): o is R2UploadOutcome & { ok: false } => !o.ok)
          .map((o): [string, string] => [o.itemId, o.error]),
      ]);

      setItems((prev) =>
        prev.map((it) => {
          if (successIds.has(it.id)) {
            return { ...it, status: 'done' as UploadStatus };
          }
          if (failures.has(it.id)) {
            return {
              ...it,
              status: 'error' as UploadStatus,
              errorMessage: failures.get(it.id),
            };
          }
          return it;
        })
      );

      const totalSuccess = successIds.size;
      if (totalSuccess > 0) {
        setSubmitSuccess(totalSuccess);

        // Invalide le cache finder pour que la prochaine visite de
        // /admin/dashboard/library refetch AKFC/pending (et tous les
        // autres paths déjà visités) et affiche les nouveaux fichiers
        // sans reload manuel. L'opération est instantanée — c'est juste
        // un toggle de Map vide + incrément de reloadKey.
        reloadFolderContent();
      }
      if (failures.size > 0) {
        setSubmitError(
          `${failures.size} fichier(s) en erreur — voir détail sur chaque vignette. Tu peux re-soumettre pour réessayer.`
        );
      }
    } catch (err) {
      setItems((prev) =>
        prev.map((it) =>
          it.status === 'uploading'
            ? {
                ...it,
                status: 'error' as UploadStatus,
                errorMessage: 'Submission failed',
              }
            : it
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
        {isDragActive ? (
          'Dépose ici'
        ) : (
          <>
            <p>
              Glisse des fichiers ou clique (max {MAX_FILES_PER_BATCH} fichiers
              par envoi)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Images/vidéos jusqu&apos;à {MAX_FILE_SIZE_CLOUDINARY_MB} Mo · audios/docs/zip
              jusqu&apos;à {MAX_FILE_SIZE_R2_MB} Mo
            </p>
          </>
        )}
      </div>

      {filesError && <p className="text-sm text-red-600">{filesError}</p>}

      {/* Previews + statuts */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {items.map((it) => {
            const showsImagePreview = isImageOrVideo(it.file);
            return (
              <div
                key={it.id}
                className="relative w-32 h-32 border rounded overflow-hidden group bg-gray-50"
              >
                {showsImagePreview ? (
                  // Image/vidéo : vignette navigateur (URL.createObjectURL)
                  // Cliquable pour ouvrir le cropper (images uniquement, mais
                  // pour les vidéos on garde le clic — le cropper s'occupe
                  // de gérer ce cas).
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.previewUrl}
                    alt=""
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => {
                      if (it.file.type.startsWith('image/')) {
                        setItemToCrop(it);
                      }
                    }}
                  />
                ) : (
                  // Audio / doc / archive : icône typée + nom de fichier
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-3xl mb-1">
                      {iconForMime(it.file.type)}
                    </span>
                    <span
                      className="text-xs text-gray-700 truncate w-full"
                      title={it.file.name}
                    >
                      {it.file.name}
                    </span>
                  </div>
                )}

                {it.status !== 'pending' && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 text-xs text-white text-center py-0.5 ${
                      it.status === 'uploading'
                        ? 'bg-blue-600/80'
                        : it.status === 'done'
                          ? 'bg-green-600/80'
                          : 'bg-red-600/80'
                    }`}
                    title={it.errorMessage}
                  >
                    {it.status === 'uploading' && '⏳ Upload…'}
                    {it.status === 'done' && '✅ OK'}
                    {it.status === 'error' && '⚠️ Erreur'}
                  </div>
                )}

                {/* Message d'erreur détaillé visible sous la vignette
                    (en plus du tooltip au survol). Aide à diagnostiquer
                    sans avoir à survoler. Le `break-words` évite que le
                    container explose en largeur si le message est long. */}
                {it.status === 'error' && it.errorMessage && (
                  <div className="absolute -bottom-12 left-0 right-0 text-[10px] text-red-700 bg-red-50 border border-red-200 rounded p-1 break-words leading-tight z-20">
                    {it.errorMessage}
                  </div>
                )}

                <div className="absolute top-1 left-1 right-1 flex justify-between items-start z-10 pointer-events-auto">
                  <input
                    type="checkbox"
                    className="scale-125 z-10"
                    checked={selectedIds.has(it.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(it.id);
                    }}
                  />
                  <div className="flex flex-col gap-1 z-10">
                    <button
                      type="button"
                      className="bg-red-500 text-white text-xs px-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(it.id);
                      }}
                    >
                      🗑
                    </button>
                    {it.file.type.startsWith('image/') && (
                      // Reset n'a de sens que sur les images crop-ables.
                      <button
                        type="button"
                        className="bg-yellow-500 text-white text-xs px-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetItem(it.id);
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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

      {itemToCrop && (
        <Cropper
          picture={itemToCrop}
          onCancel={() => setItemToCrop(null)}
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
      {submitError && <p className="text-sm text-red-700">⚠️ {submitError}</p>}
    </form>
  );
}
