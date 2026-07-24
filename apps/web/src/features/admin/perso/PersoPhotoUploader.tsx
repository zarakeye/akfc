'use client';

import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';

import { trpc } from '@trpc/trpcClient';

/**
 * PersoPhotoUploader
 *
 * Uploader de l'espace photos PERSO d'un admin. Volontairement léger et
 * distinct du `DragNDropForm` de la bibliothèque :
 *   - images UNIQUEMENT (le back refuse le reste sur destination `perso`) ;
 *   - Cloudinary uniquement (pas de R2 ici) ;
 *   - aucune catégorie / discipline : la destination est `{ kind: 'perso' }`,
 *     le dossier cible (`.../persos/<slug>-<uid>/photos`) est résolu côté
 *     serveur à partir de `ctx.user.id` ;
 *   - un quota (constante backend) borne le nombre d'images (pending +
 *     published). On lit le statut via `storage.getPersoPhotoQuota`, on bloque
 *     l'ajout au lot quand il ne reste plus de place, et le back refait le
 *     garde-fou à la signature.
 *
 * Sur conflit (une image du même nom existe déjà), on IGNORE le fichier plutôt
 * que d'écraser : dans un espace perso, on ne détruit jamais un binaire sans
 * une action explicite (supprimer puis re-déposer).
 */

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                   */
/* -------------------------------------------------------------------------- */

const ACCEPTED_IMAGE_TYPES: Accept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
  'image/gif': ['.gif'],
};

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILES_PER_BATCH = 20;

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                      */
/* -------------------------------------------------------------------------- */

type ItemStatus = 'pending' | 'uploading' | 'done' | 'error' | 'skipped';

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: ItemStatus;
  error?: string;
};

type Banner = { kind: 'success' | 'error' | 'info'; text: string };

type CloudinaryAsset = {
  publicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video';
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
};

type UploadOutcome =
  | { ok: true; itemId: string; asset: CloudinaryAsset }
  | { ok: false; itemId: string; error: string };

/* -------------------------------------------------------------------------- */
/*                                COMPOSANT                                    */
/* -------------------------------------------------------------------------- */

export default function PersoPhotoUploader(): JSX.Element {
  const utils = trpc.useUtils();
  const quotaQuery = trpc.storage.getPersoPhotoQuota.useQuery();
  const createAuthMutation = trpc.storage.createUploadAuthorization.useMutation();
  const registerAssetMutation = trpc.storage.registerUploadedAsset.useMutation();

  const [items, setItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  // Ref pour révoquer les object-URLs au démontage (sans dépendance stale).
  const itemsRef = useRef<UploadItem[]>([]);
  itemsRef.current = items;
  useEffect(
    () => () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    },
    [],
  );

  const quota = quotaQuery.data;
  const remaining = quota?.remaining ?? 0;
  const atCapacity = quota != null && remaining <= 0;
  const pendingCount = items.filter((it) => it.status === 'pending').length;

  /* ---- Ajout de fichiers (borné par le quota restant + limite de lot) ---- */
  const onDrop = useCallback(
    (accepted: File[]) => {
      setItems((prev) => {
        const pendingNow = prev.filter((it) => it.status === 'pending').length;
        const slots = Math.min(
          Math.max(0, remaining - pendingNow),
          MAX_FILES_PER_BATCH - pendingNow,
        );
        const toAdd = accepted.slice(0, slots).map<UploadItem>((file) => ({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          status: 'pending',
        }));

        if (accepted.length > toAdd.length) {
          setBanner({
            kind: 'info',
            text: `Quota ou limite de lot atteint : ${toAdd.length} sur ${accepted.length} photo(s) ajoutée(s).`,
          });
        } else {
          setBanner(null);
        }

        return [...prev, ...toAdd];
      });
    },
    [remaining],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    disabled: isUploading || atCapacity,
    onDrop,
  });

  /* ---- Retrait d'une vignette ---- */
  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((it) => it.id !== id);
    });
  };

  const clearFinished = () => {
    setItems((prev) => {
      prev
        .filter((it) => it.status !== 'pending' && it.status !== 'uploading')
        .forEach((it) => URL.revokeObjectURL(it.previewUrl));
      return prev.filter(
        (it) => it.status === 'pending' || it.status === 'uploading',
      );
    });
  };

  /* ---- Upload : autorisation → POST navigateur → register ---- */
  const upload = async () => {
    const toUpload = items.filter((it) => it.status === 'pending');
    if (toUpload.length === 0) return;

    setIsUploading(true);
    setBanner(null);
    setItems((prev) =>
      prev.map((it) =>
        it.status === 'pending' ? { ...it, status: 'uploading' } : it,
      ),
    );

    try {
      const assetsPayload = toUpload.map((it) => ({
        fileName: it.file.name,
        mimeType: it.file.type,
        mediaType: 'image' as const,
      }));

      // Phase 1 — autorisation (overwrite:false → binaire protégé)
      const signatures = await createAuthMutation.mutateAsync({
        provider: 'cloudinary',
        destination: { kind: 'perso' },
        allowOverwrite: false,
        assets: assetsPayload,
      });

      const sigByItemId = new Map(
        toUpload.map((it, idx) => [it.id, signatures[idx]]),
      );

      // Conflits : on IGNORE (jamais d'écrasement silencieux en perso).
      const skippedIds = new Set<string>();
      toUpload.forEach((it, idx) => {
        if (signatures[idx].alreadyExists) skippedIds.add(it.id);
      });
      const actuallyUpload = toUpload.filter((it) => !skippedIds.has(it.id));

      // Phase 2 — POST direct vers Cloudinary, en parallèle
      const outcomes: UploadOutcome[] = await Promise.all(
        actuallyUpload.map(async (it): Promise<UploadOutcome> => {
          const sig = sigByItemId.get(it.id)!;
          try {
            const formData = new FormData();
            formData.append('file', it.file);
            formData.append('api_key', sig.apiKey);
            formData.append('timestamp', String(sig.timestamp));
            formData.append('signature', sig.signature);
            formData.append('folder', sig.folder);
            formData.append('public_id', sig.publicId);
            formData.append('type', sig.type);
            formData.append('overwrite', String(sig.overwrite));

            const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`;
            const res = await fetch(url, { method: 'POST', body: formData });
            if (!res.ok) {
              throw new Error(`Cloudinary HTTP ${res.status}`);
            }
            const data = await res.json();
            return {
              ok: true,
              itemId: it.id,
              asset: {
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
              itemId: it.id,
              error: err instanceof Error ? err.message : 'Envoi échoué',
            };
          }
        }),
      );

      // Phase 3 — register des succès
      const successes = outcomes.filter(
        (o): o is Extract<UploadOutcome, { ok: true }> => o.ok,
      );
      if (successes.length > 0) {
        const itemById = new Map(actuallyUpload.map((it) => [it.id, it]));
        await registerAssetMutation.mutateAsync({
          provider: 'cloudinary',
          destination: { kind: 'perso' },
          assets: successes.map((s) => {
            const it = itemById.get(s.itemId)!;
            const sig = sigByItemId.get(s.itemId)!;
            return {
              ...s.asset,
              originalFileName: it.file.name,
              mimeType: it.file.type,
              folder: sig.folder,
            };
          }),
        });
      }

      // MAJ des statuts locaux
      const okIds = new Set(successes.map((s) => s.itemId));
      const failById = new Map(
        outcomes.filter((o) => !o.ok).map((o) => [o.itemId, o]),
      );
      setItems((prev) =>
        prev.map((it) => {
          if (skippedIds.has(it.id)) return { ...it, status: 'skipped' };
          if (okIds.has(it.id)) return { ...it, status: 'done' };
          const fail = failById.get(it.id);
          if (fail && !fail.ok) {
            return { ...it, status: 'error', error: fail.error };
          }
          return it;
        }),
      );

      // Bilan
      const parts: string[] = [];
      if (okIds.size > 0) parts.push(`${okIds.size} ajoutée(s)`);
      if (skippedIds.size > 0) {
        parts.push(`${skippedIds.size} déjà présente(s), ignorée(s)`);
      }
      if (failById.size > 0) parts.push(`${failById.size} en erreur`);
      setBanner({
        kind: failById.size > 0 ? 'error' : 'success',
        text: parts.join(' · ') || 'Rien à envoyer.',
      });

      await utils.storage.getPersoPhotoQuota.invalidate();
      // Un dépôt perso alimente `pending` et `persoPending`.
      await utils.storage.getAttentionCounts.invalidate();
    } catch (err) {
      // Ex. : le back refuse la signature car quota dépassé.
      setBanner({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Une erreur est survenue.',
      });
      setItems((prev) =>
        prev.map((it) =>
          it.status === 'uploading'
            ? { ...it, status: 'error', error: 'Envoi échoué' }
            : it,
        ),
      );
    } finally {
      setIsUploading(false);
    }
  };

  /* ------------------------------- Render -------------------------------- */

  const quotaPct =
    quota && quota.quota > 0
      ? Math.min(100, Math.round((quota.total / quota.quota) * 100))
      : 0;

  return (
    <div className="space-y-4 w-96 max-w-full">
      {/* Barre de quota */}
      <div>
        {quotaQuery.isLoading ? (
          <p className="text-sm text-gray-500">Chargement du quota…</p>
        ) : quotaQuery.isError || !quota ? (
          <p className="text-sm text-red-600">
            Impossible de charger le quota photos.
          </p>
        ) : (
          <>
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-semibold text-sm">
                {quota.total} / {quota.quota} photos
              </span>
              <span className="text-xs text-gray-500">
                {quota.remaining} restante(s)
              </span>
            </div>
            <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
              <div
                className={`h-full rounded ${
                  atCapacity ? 'bg-red-500' : 'bg-green-600'
                }`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {quota.pending} en attente · {quota.published} validée(s)
            </p>
          </>
        )}
      </div>

      {/* Zone de dépôt */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 rounded-md text-center ${
          atCapacity
            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            : isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 cursor-pointer'
        }`}
      >
        <input {...getInputProps()} />
        {atCapacity ? (
          <p className="text-sm text-gray-600">
            Quota atteint — supprime des photos pour en ajouter.
          </p>
        ) : isDragActive ? (
          <p className="text-sm text-blue-600">Dépose les photos ici…</p>
        ) : (
          <>
            <p className="text-sm">Glisse tes photos ou clique pour choisir</p>
            <p className="text-xs text-gray-500 mt-1">
              Images uniquement · {MAX_FILE_SIZE_MB} Mo max · {remaining}{' '}
              restante(s)
            </p>
          </>
        )}
      </div>

      {/* Bannière de bilan */}
      {banner && (
        <p
          className={`text-sm ${
            banner.kind === 'error'
              ? 'text-red-600'
              : banner.kind === 'success'
                ? 'text-green-700'
                : 'text-gray-600'
          }`}
        >
          {banner.text}
        </p>
      )}

      {/* Vignettes */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {items.map((it) => (
            <div
              key={it.id}
              className="relative w-28 h-28 border rounded overflow-hidden group bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.previewUrl}
                alt={it.file.name}
                className="w-full h-full object-contain"
              />
              <span
                className={`absolute bottom-0 left-0 right-0 text-xs text-white text-center py-0.5 ${
                  it.status === 'uploading'
                    ? 'bg-blue-600/80'
                    : it.status === 'done'
                      ? 'bg-green-600/80'
                      : it.status === 'skipped'
                        ? 'bg-gray-600/80'
                        : it.status === 'error'
                          ? 'bg-red-600/80'
                          : 'bg-black/40'
                }`}
              >
                {it.status === 'pending' && 'prête'}
                {it.status === 'uploading' && 'envoi…'}
                {it.status === 'done' && 'ajoutée'}
                {it.status === 'skipped' && 'ignorée'}
                {it.status === 'error' && 'erreur'}
              </span>
              {it.status === 'pending' && !isUploading && (
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded z-10"
                  aria-label={`Retirer ${it.file.name}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={upload}
          disabled={isUploading || pendingCount === 0}
          className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Envoi…' : `Envoyer ${pendingCount || ''} photo(s)`}
        </button>
        {items.some(
          (it) => it.status !== 'pending' && it.status !== 'uploading',
        ) && (
          <button
            type="button"
            onClick={clearFinished}
            disabled={isUploading}
            className="text-sm px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50"
          >
            Nettoyer
          </button>
        )}
      </div>
    </div>
  );
}
