'use client';

import { JSX, useState, useRef, useEffect } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { trpc } from '@trpc/trpcClient';
import { useSessionStore } from '@lib/stores/useSessionStore';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { APP_ROOT } from '@config/app';
import { pickBackend, type StorageProvider } from '@contracts/storage';

import type { PictureItem } from '@features/gallery-crop/types/picture.types';
import type { CropResult } from '@features/gallery-crop/types/cropper.types';
import Cropper from '@features/gallery-crop/components/Cropper';
import { PdfThumbnail } from '@features/common-repository/PdfThumbnail';

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
 * ─── Conflits Cloudinary (ré-upload) ──────────────────────────────────────
 *
 * À l'autorisation, le backend signe `overwrite:false` par défaut et renvoie
 * `alreadyExists` par asset. Si des fichiers existent déjà, on demande à
 * l'utilisateur (dialogue) : Annuler (on ignore ces fichiers) ou Écraser
 * (on re-signe ces fichiers avec `overwrite:true`). Le binaire d'origine est
 * donc protégé tant que l'utilisateur n'a pas explicitement confirmé.
 */

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const MAX_FILES_PER_BATCH = 20;

const MAX_FILE_SIZE_CLOUDINARY_MB = 50;
const MAX_FILE_SIZE_R2_MB = 500;
const MAX_FILE_SIZE_CLOUDINARY_BYTES = MAX_FILE_SIZE_CLOUDINARY_MB * 1024 * 1024;
const MAX_FILE_SIZE_R2_BYTES = MAX_FILE_SIZE_R2_MB * 1024 * 1024;

const ACCEPTED_MIME_TYPES: Accept = {
  // Images (Cloudinary)
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
  'image/gif': ['.gif'],
  'image/svg+xml': ['.svg'],
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
    destinationKind: z.literal('stage'),
    stageId: z
      .number({ message: 'Sélectionne un stage.' })
      .int()
      .positive('Sélectionne un stage.'),
  }),
  z.object({
    destinationKind: z.literal('common_repository'),
    // Sous-dossier optionnel sous « Général » (vide = racine).
    containerName: z.string().trim().max(120).optional(),
  }),
  z.object({
    destinationKind: z.literal('event'),
    // Les évènements sont créés par les admins ; on en choisit un existant.
    eventId: z
      .number({ message: 'Sélectionne un évènement.' })
      .int()
      .positive('Sélectionne un évènement.'),
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
      kind: 'stage';
      stageId: number;
    }
  | {
      kind: 'common_repository';
      containerName?: string;
    }
  | {
      kind: 'event';
      eventId: number;
      /** Disciplines présentées lors de l'évènement (enrichissent l'évènement). */
      disciplineIds: number[];
    };

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

type EnrichedItem = PictureItem & {
  status: UploadStatus;
  errorMessage?: string;
  backend: StorageProvider;
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const EXT_TO_MIME: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  svg: 'image/svg+xml',
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

function ensureMimeType(file: File): File {
  if (file.type && file.type.length > 0) return file;
  const resolved = resolveMimeFromExtension(file.name);
  if (!resolved) return file;
  return new File([file], file.name, {
    type: resolved,
    lastModified: file.lastModified,
  });
}

function getMaxBytesForFile(file: File): number {
  return pickBackend(file.type) === 'cloudinary'
    ? MAX_FILE_SIZE_CLOUDINARY_BYTES
    : MAX_FILE_SIZE_R2_BYTES;
}

function isImageOrVideo(file: File): boolean {
  return file.type.startsWith('image/') || file.type.startsWith('video/');
}

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
  const { data: categories = [] } = trpc.category.getAll.useQuery();

  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);
  const utils = trpc.useUtils();

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

  // eslint-disable-next-line react-hooks/incompatible-library
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

  const containerFoldersQuery = trpc.storage.listCommonRepositoryFolders.useQuery(
    undefined,
    { enabled: destinationKind === 'common_repository' },
  );
  const containerFolders = containerFoldersQuery.data ?? [];

  // Évènements existants (créés par les admins) pour le picker.
  const stagesQuery = trpc.stage.listForUpload.useQuery(undefined, {
    enabled: destinationKind === 'stage',
  });
  const stagesForUpload = stagesQuery.data ?? [];
  const eventsQuery = trpc.event.listForUpload.useQuery(undefined, {
    enabled: destinationKind === 'event',
  });
  const eventsForUpload = eventsQuery.data ?? [];

  // TOUTES les disciplines : `disciplinesQuery` ci-dessus est filtrée par
  // catégorie, or un évènement n'a pas de catégorie.
  const allDisciplinesQuery = trpc.discipline.getAll.useQuery(undefined, {
    enabled: destinationKind === 'event',
  });
  const allDisciplines = allDisciplinesQuery.data ?? [];

  // Hors schéma RHF (évite le typage d'un tableau dans une union discriminée) —
  // fusionné à la destination au moment de la soumission.
  const [eventDisciplineIds, setEventDisciplineIds] = useState<number[]>([]);

  const toggleEventDiscipline = (id: number) => {
    setEventDisciplineIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // -------------------------------
  // Mutations tRPC
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
  const [skippedCount, setSkippedCount] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mise à disposition des PDF aux membres (admin) au moment de l'envoi.
  const isAdmin = (user?.isAdmin ?? false);
  const hasPdf = items.some((it) => it.file.type === 'application/pdf');
  const [publishToMembers, setPublishToMembers] = useState(false);
  const [publishAudience, setPublishAudience] = useState<
    'ALL_MEMBERS' | 'SPECIFIC'
  >('ALL_MEMBERS');
  const [publishRecipientIds, setPublishRecipientIds] = useState<string[]>([]);
  const publishMembersMutation = trpc.memberDocument.publish.useMutation();
  const membersQuery = trpc.memberDocument.listMembers.useQuery(undefined, {
    enabled: isAdmin && publishToMembers && publishAudience === 'SPECIFIC',
  });

  const [overwritePrompt, setOverwritePrompt] = useState<{
    names: string[];
    resolve: (choice: 'cancel' | 'overwrite') => void;
  } | null>(null);

  // Pause le pipeline jusqu'au choix de l'utilisateur (résolu par les boutons du dialogue).
  function askOverwrite(names: string[]): Promise<'cancel' | 'overwrite'> {
    return new Promise((resolve) => setOverwritePrompt({ names, resolve }));
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // -------------------------------
  // Dropzone
  // -------------------------------
  const onDrop = (acceptedFiles: File[]) => {
    setFilesError(null);

    const normalizedFiles = acceptedFiles.map(ensureMimeType);

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
    destination: Destination,
  ): Promise<{
    outcomes: CloudinaryUploadOutcome[];
    registeredCount: number;
    skippedItemIds: string[];
  }> {
    if (cloudinaryItems.length === 0) {
      return { outcomes: [], registeredCount: 0, skippedItemIds: [] };
    }

    const assetsPayload = cloudinaryItems.map((it) => ({
      fileName: it.file.name,
      mimeType: it.file.type,
      mediaType: it.file.type.startsWith('video/') ? ('video' as const) : ('image' as const),
    }));

    // Phase 1 — autorisation SANS overwrite (binaire protégé par défaut)
    const signatures = await createUploadAuthMutation.mutateAsync({
      provider: 'cloudinary',
      destination,
      allowOverwrite: false,
      assets: assetsPayload,
    });

    const conflictingIdx = signatures
      .map((sig, idx) => (sig.alreadyExists ? idx : -1))
      .filter((idx) => idx !== -1);

    let effectiveSignatures = signatures;
    const skippedItemIds: string[] = [];

    if (conflictingIdx.length > 0) {
      const choice = await askOverwrite(
        conflictingIdx.map((i) => cloudinaryItems[i].file.name),
      );
      if (choice === 'cancel') {
        conflictingIdx.forEach((i) => skippedItemIds.push(cloudinaryItems[i].id));
      } else {
        // Écraser : re-signer UNIQUEMENT les conflictuels avec overwrite:true
        const overwriteSigs = await createUploadAuthMutation.mutateAsync({
          provider: 'cloudinary',
          destination,
          allowOverwrite: true,
          assets: conflictingIdx.map((i) => assetsPayload[i]),
        });
        effectiveSignatures = [...signatures];
        conflictingIdx.forEach((idx, k) => {
          effectiveSignatures[idx] = overwriteSigs[k];
        });
      }
    }

    const skippedSet = new Set(skippedItemIds);
    const sigByItemId = new Map(
      cloudinaryItems.map((it, idx) => [it.id, effectiveSignatures[idx]]),
    );

    const toUpload = cloudinaryItems.filter((it) => !skippedSet.has(it.id));

    // Phase 2 — POST en parallèle (on saute les ignorés)
    const outcomes: CloudinaryUploadOutcome[] = await Promise.all(
      toUpload.map(async (item): Promise<CloudinaryUploadOutcome> => {
        const sig = sigByItemId.get(item.id)!;
        try {
          // Mode sandbox (MinIO) : la signature porte un `uploadUrl` presigné.
          // PUT direct du fichier — pas de réponse Cloudinary, on fabrique
          // l'asset depuis le fichier + la signature.
          if (sig.uploadUrl) {
            const putRes = await fetch(sig.uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': item.file.type },
              body: item.file,
            });
            if (!putRes.ok) {
              const text = await putRes.text();
              throw new Error(`MinIO HTTP ${putRes.status}: ${text.slice(0, 200)}`);
            }
            return {
              ok: true,
              itemId: item.id,
              cloudinaryAsset: {
                publicId: `${sig.folder}/${sig.publicId}`,
                secureUrl: '',
                resourceType: sig.resourceType,
                format: item.file.type.split('/')[1],
                bytes: item.file.size,
              },
            };
          }
          const formData = new FormData();
          formData.append('file', item.file);
          formData.append('api_key', sig.apiKey);
          formData.append('timestamp', String(sig.timestamp));
          formData.append('signature', sig.signature);
          formData.append('folder', sig.folder);
          formData.append('public_id', sig.publicId);
          formData.append('type', sig.type);
          formData.append('overwrite', String(sig.overwrite)); // ← signé → doit être envoyé
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
      }),
    );

    // Phase 3 — register (upsert côté serveur)
    const successes = outcomes.filter(
      (r): r is CloudinaryUploadOutcome & { ok: true } => r.ok,
    );
    let registeredCount = 0;
    if (successes.length > 0) {
      const itemById = new Map(cloudinaryItems.map((it) => [it.id, it]));
      const registered = await registerUploadedAssetMutation.mutateAsync({
        provider: 'cloudinary',
        destination,
        assets: successes.map((s) => {
          const it = itemById.get(s.itemId)!;
          const sig = sigByItemId.get(s.itemId)!;
          return {
            ...s.cloudinaryAsset,
            originalFileName: it.file.name,
            mimeType: it.file.type,
            folder: sig.folder,
          };
        }),
      });
      registeredCount = registered.assets.length;
    }

    return { outcomes, registeredCount, skippedItemIds };
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
    try {
      // Le serveur calcule le chemin (une seule règle, tous providers) et le
      // renvoie dans `auth.path` — on le réutilise pour l'enregistrement.
      const auth = await createR2UploadMutation.mutateAsync({
        destination,
        originalFileName: item.file.name,
        mimeType: item.file.type,
        maxBytes: item.file.size,
      });
      const path = auth.path;

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

      const result = await registerR2UploadMutation.mutateAsync({
        path,
        expectedBytes: item.file.size,
        expectedMimeType: item.file.type,
        destination,
        originalFileName: item.file.name,
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
    setSkippedCount(null);
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

    let destination: Destination;
    if (values.destinationKind === 'existing-discipline') {
      destination = {
        kind: 'existing-discipline',
        categoryId: values.categoryId,
        disciplineId: values.disciplineId,
      };
    } else if (values.destinationKind === 'stage') {
      destination = {
        kind: 'stage',
        stageId: values.stageId,
      };
    } else if (values.destinationKind === 'event') {
      destination = {
        kind: 'event',
        eventId: values.eventId,
        disciplineIds: eventDisciplineIds,
      };
    } else {
      const containerName = values.containerName?.trim();
      destination = {
        kind: 'common_repository',
        containerName: containerName ? containerName : undefined,
      };
    }

    const cloudinaryItems = toUpload.filter((it) => it.backend === 'cloudinary');
    const r2Items = toUpload.filter((it) => it.backend === 'r2');

    try {
      const [cloudinaryRes, r2Res] = await Promise.all([
        uploadCloudinaryBatch(cloudinaryItems, destination),
        Promise.all(r2Items.map((it) => uploadR2Single(it, destination))),
      ]);

      const cloudinaryOutcomes = cloudinaryRes.outcomes;
      const r2Outcomes = r2Res;

      // Items ignorés (conflit Cloudinary, choix « Annuler ») → on les
      // remet en `pending` (jamais uploadés, restent dans la liste).
      const skippedSet = new Set(cloudinaryRes.skippedItemIds);

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
          if (skippedSet.has(it.id)) {
            return { ...it, status: 'pending' as UploadStatus, errorMessage: undefined };
          }
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
        reloadFolderContent();
        // Un dépôt biblio alimente `pending`, et `generalPending` si la
        // destination est le dossier « général ».
        void utils.storage.getAttentionCounts.invalidate();
      }

      // Mise à disposition des PDF déposés (option admin). Le path R2 est déjà
      // connu du front (outcome). Erreurs non bloquantes (ex. déjà publié).
      if (isAdmin && publishToMembers) {
        const pdfPaths = r2Outcomes
          .filter((o): o is R2UploadOutcome & { ok: true } => o.ok)
          .filter(
            (o) =>
              items.find((it) => it.id === o.itemId)?.file.type ===
              'application/pdf',
          )
          .map((o) => o.path);
        let published = 0;
        for (const path of pdfPaths) {
          try {
            await publishMembersMutation.mutateAsync({
              path,
              audience: publishAudience,
              recipientUserIds:
                publishAudience === 'SPECIFIC' ? publishRecipientIds : undefined,
            });
            published += 1;
          } catch {
            // non bloquant
          }
        }
        if (published > 0) {
          void utils.memberDocument.listAdmin.invalidate();
          void utils.memberDocument.unreadCountForMe.invalidate();
        }
      }

      if (skippedSet.size > 0) {
        setSkippedCount(skippedSet.size);
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
      // Filet de sécurité : si un dialogue de conflit était resté ouvert
      // (cas anormal), on le referme pour ne pas bloquer l'UI.
      setOverwritePrompt(null);
    }
  };

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-80">
      <input ref={fileInputRef} type="file" multiple hidden />

      {/* Destination : discipline, « Général » ou évènement */}
      {/* Niveau 1 : type de destination */}
      {/* Niveau 1 : type de destination */}
      <div className="flex flex-wrap gap-4">
        {([
          ['existing-discipline', 'Vers une discipline'],
          ['stage', 'Vers un stage'],
          ['event', 'Vers un évènement'],
          ['common_repository', 'Vers « Dépôt commun »'],
        ] as const).map(([kind, label]) => (
          <label key={kind} className="flex items-center gap-2">
            <input
              type="radio"
              checked={destinationKind === kind}
              onChange={() => setValue('destinationKind', kind)}
            />
            {label}
          </label>
        ))}
      </div>

      {/* Niveau 2 : discipline existante */}
      {destinationKind === 'existing-discipline' && (
        <div>
          <label className="block font-semibold mb-1">Discipline</label>
          <Controller
            name="disciplineId"
            control={control}
            render={({ field }) => (
              <select
                value={field.value ?? ''}
                onChange={(e) => {
                  const id =
                    e.target.value === '' ? undefined : Number(e.target.value);
                  field.onChange(id);
                  // categoryId dérivé de la discipline choisie (une seule
                  // catégorie « Cours » — plus de select catégorie).
                  const d = disciplines.find((x) => x.id === id);
                  if (d) setValue('categoryId', d.categoryId);
                }}
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

      {/* Niveau 2 : stage existant */}
      {destinationKind === 'stage' && (
        <div>
          <label className="block font-semibold mb-1">Stage</label>
          {stagesQuery.isLoading ? (
            <p className="text-sm text-gray-500">Chargement…</p>
          ) : stagesForUpload.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun stage. Les stages sont créés par les admins.
            </p>
          ) : (
            <select
              {...register('stageId', { valueAsNumber: true })}
              defaultValue=""
              className="border rounded p-2 w-full"
            >
              <option value="" disabled>
                — Choisir un stage —
              </option>
              {stagesForUpload.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          )}
          {'stageId' in errors && errors.stageId && (
            <p className="text-sm text-red-600 mt-1">{errors.stageId.message}</p>
          )}
        </div>
      )}

      {/* Niveau 2 : évènement + disciplines d'enrichissement (admin) */}
      {destinationKind === 'event' && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block font-semibold mb-1">Évènement</label>
            {eventsQuery.isLoading ? (
              <p className="text-sm text-gray-500">Chargement…</p>
            ) : eventsForUpload.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aucun évènement. Les évènements sont créés par les admins.
              </p>
            ) : (
              <select
                {...register('eventId', { valueAsNumber: true })}
                defaultValue=""
                className="border rounded p-2 w-full"
              >
                <option value="" disabled>
                  — Choisir un évènement —
                </option>
                {eventsForUpload.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            )}
            {'eventId' in errors && errors.eventId && (
              <p className="text-sm text-red-600 mt-1">
                {errors.eventId.message}
              </p>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Disciplines présentées (optionnel)
            </label>
            {allDisciplines.length === 0 ? (
              <p className="text-sm text-gray-500">Chargement…</p>
            ) : (
              <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded border p-2">
                {allDisciplines.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={eventDisciplineIds.includes(d.id)}
                      onChange={() => toggleEventDiscipline(d.id)}
                    />
                    <span>{d.name}</span>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Elles décrivent l&apos;ÉVÈNEMENT (pas chaque fichier) et
              s&apos;ajoutent aux disciplines déjà enregistrées sur lui.
            </p>
          </div>
        </div>
      )}

      {/* Niveau 2 : Dépôt commun (fallback) */}
      {destinationKind === 'common_repository' && (
        <div>
          <label className="block font-semibold mb-1">Nom du dossier de dépôt</label>
          <input
            type="text"
            list="akfc-common-repository-folders"
            {...register('containerName')}
            className="border rounded p-2 w-full"
            placeholder="Nom du dossier de dépôt"
          />
          <datalist id="akfc-common-repository-folders">
            {containerFolders.map((folder) => (
              <option key={folder} value={folder} />
            ))}
          </datalist>
          <p className="text-xs text-gray-500 mt-1">
            Choisis un dossier existant, tape un nouveau nom, ou laisse vide.
          </p>
        </div>
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
                ) : it.file.type === 'application/pdf' ? (
                  <PdfThumbnail file={it.file} width={128} />
                ) : (
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

      {/* Dialogue de conflit — fichiers déjà présents */}
      {overwritePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded-lg bg-white p-4 shadow-xl">
            <h3 className="mb-2 font-semibold">Fichiers déjà présents</h3>
            <p className="mb-2 text-sm text-gray-600">
              {overwritePrompt.names.length} fichier(s) existent déjà dans la
              bibliothèque :
            </p>
            <ul className="mb-3 max-h-32 overflow-auto rounded border border-gray-200 bg-gray-50 p-2 text-xs">
              {overwritePrompt.names.map((n) => (
                <li key={n} className="truncate" title={n}>
                  {n}
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={() => {
                  overwritePrompt.resolve('cancel');
                  setOverwritePrompt(null);
                }}
              >
                Annuler (ignorer)
              </button>
              <button
                type="button"
                className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                onClick={() => {
                  overwritePrompt.resolve('overwrite');
                  setOverwritePrompt(null);
                }}
              >
                Écraser
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && hasPdf && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={publishToMembers}
              onChange={(e) => setPublishToMembers(e.target.checked)}
              className="accent-emerald-600"
            />
            Rendre les PDF disponibles aux membres après l'envoi
          </label>
          {publishToMembers && (
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="pubAudience"
                  checked={publishAudience === 'ALL_MEMBERS'}
                  onChange={() => setPublishAudience('ALL_MEMBERS')}
                  className="accent-emerald-600"
                />
                Tous les membres
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="pubAudience"
                  checked={publishAudience === 'SPECIFIC'}
                  onChange={() => setPublishAudience('SPECIFIC')}
                  className="accent-emerald-600"
                />
                Des membres précis
              </label>
              {publishAudience === 'SPECIFIC' && (
                <div className="max-h-40 space-y-1 overflow-auto rounded border border-gray-200 bg-white p-2">
                  {(membersQuery.data ?? []).map((m) => (
                    <label
                      key={m.id}
                      className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={publishRecipientIds.includes(m.id)}
                        onChange={() =>
                          setPublishRecipientIds((ids) =>
                            ids.includes(m.id)
                              ? ids.filter((x) => x !== m.id)
                              : [...ids, m.id],
                          )
                        }
                        className="accent-emerald-600"
                      />
                      {m.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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
      {skippedCount !== null && skippedCount > 0 && (
        <p className="text-sm text-gray-600">
          ⏭️ {skippedCount} fichier(s) déjà présent(s) ont été ignorés.
        </p>
      )}
      {submitError && <p className="text-sm text-red-700">⚠️ {submitError}</p>}
    </form>
  );
}