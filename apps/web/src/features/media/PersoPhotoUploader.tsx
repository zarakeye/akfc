'use client';

import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { HEIC_ACCEPT, countHeic, heicFailureMessage, heicProgressMessage, toBrowserImages } from '#features/media/heic/browserImages.ts';

import { trpc } from '#core/trpc/trpcClient.ts';
import { uploadToR2 } from '#features/media/uploadToR2.ts';

/**
 * PersoPhotoUploader
 *
 * Envoi de photos dans l'espace PERSONNEL du membre connecté (monté sur le profil d'un
 * instructeur, pour les photos de sa présentation). Volontairement léger et
 * distinct du `DragNDropForm` de la bibliothèque :
 *   - images UNIQUEMENT (le back refuse le reste sur destination `perso`) ;
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
  // Photos iPhone (HEIC) : converties en JPEG dans le navigateur avant l'envoi.
  ...HEIC_ACCEPT,
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

/** À envoyer : en attente, ou en erreur (relancé avec les autres). */
const isToSend = (it: UploadItem): boolean => it.status === 'pending' || it.status === 'error';

type UploadOutcome =
  | { ok: true; itemId: string; path: string }
  | { ok: false; itemId: string; error: string };

/* -------------------------------------------------------------------------- */
/*                                COMPOSANT                                    */
/* -------------------------------------------------------------------------- */

export default function PersoPhotoUploader(): JSX.Element {
  const utils = trpc.useUtils();
  const quotaQuery = trpc.storage.getPersoPhotoQuota.useQuery();
  const createR2Mutation = trpc.storage.createR2Upload.useMutation();
  const registerR2Mutation = trpc.storage.registerR2Upload.useMutation();

  const [items, setItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  // Ref pour révoquer les object-URLs au démontage (sans dépendance stale). Mis à jour APRÈS le
  // rendu, dans un effet : écrire un ref pendant le rendu est interdit (règle react-hooks/refs),
  // car un rendu abandonné par React y laisserait une valeur qui n'a jamais été affichée.
  const itemsRef = useRef<UploadItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(
    () => () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    },
    [],
  );

  const quota = quotaQuery.data;
  const remaining = quota?.remaining ?? 0;
  const atCapacity = quota != null && remaining <= 0;
  const pendingCount = items.filter(isToSend).length;

  /* ---- Ajout de fichiers (borné par le quota restant + limite de lot) ---- */
  const addAccepted = useCallback(
    (accepted: File[]) => {
      setItems((prev) => {
        const pendingNow = prev.filter(isToSend).length;
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

  // Photos HEIC (iPhone) : converties en JPEG avant d'entrer dans la liste.
  const onDrop = useCallback(
    (accepted: File[]) => {
      const n = countHeic(accepted);
      if (n === 0) return addAccepted(accepted);
      setBanner({ kind: 'info', text: heicProgressMessage(n) });
      void toBrowserImages(accepted).then(({ files, failed }) => {
        addAccepted(files);
        if (failed.length > 0) setBanner({ kind: 'error', text: heicFailureMessage(failed) });
      });
    },
    [addAccepted],
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

  /* ---- Upload : autorisation → PUT du navigateur → register ---- */
  const upload = async () => {
    // Les fichiers en erreur repartent aussi (une autorisation expirée, une coupure) ; ceux qui
    // sont arrivés ou ignorés, jamais.
    const toUpload = items.filter(isToSend);
    if (toUpload.length === 0) return;

    setIsUploading(true);
    setBanner(null);
    const sending = new Set(toUpload.map((it) => it.id));
    setItems((prev) =>
      prev.map((it) =>
        sending.has(it.id) ? { ...it, status: 'uploading', error: undefined } : it,
      ),
    );

    try {
      // Envoi sur R2 : un fichier déjà présent est ignoré (jamais d'écrasement silencieux en perso).
      const destination = { kind: 'perso' as const };
      const { existing, duplicateIndexes } = await utils.storage.checkR2Conflicts.fetch({
        destination,
        fileNames: toUpload.map((it) => it.file.name),
      });
      const existingNames = new Set(existing);
      const skippedIds = new Set(toUpload.filter((it) => existingNames.has(it.file.name)).map((it) => it.id));
      // Même clé qu'un autre fichier du lot : il serait refusé après l'autre. On le dit tout de suite.
      const duplicateIds = new Set(duplicateIndexes.map((i) => toUpload[i].id));
      const actuallyUpload = toUpload.filter((it) => !skippedIds.has(it.id) && !duplicateIds.has(it.id));

      // Un par un : le quota se vérifie à chaque demande d'envoi.
      const outcomes: UploadOutcome[] = [];
      for (const it of actuallyUpload) {
        try {
          const registered = await uploadToR2({
            file: it.file,
            destination,
            create: createR2Mutation.mutateAsync,
            register: registerR2Mutation.mutateAsync,
          });
          outcomes.push({ ok: true, itemId: it.id, path: registered.path });
        } catch (err) {
          outcomes.push({ ok: false, itemId: it.id, error: err instanceof Error ? err.message : 'Envoi échoué' });
        }
      }
      const successes = outcomes.filter(
        (o): o is Extract<UploadOutcome, { ok: true }> => o.ok,
      );

      // MAJ des statuts locaux
      const okIds = new Set(successes.map((s) => s.itemId));
      const failById = new Map<string, UploadOutcome>([
        ...outcomes.filter((o) => !o.ok).map((o): [string, UploadOutcome] => [o.itemId, o]),
        ...toUpload
          .filter((it) => duplicateIds.has(it.id))
          .map((it): [string, UploadOutcome] => [
            it.id,
            { ok: false, itemId: it.id, error: `« ${it.file.name} » porte le même nom qu'une autre photo de cet envoi. Renommez-la.` },
          ]),
      ]);
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
          <p className="text-sm text-muted-foreground">Chargement du quota…</p>
        ) : quotaQuery.isError || !quota ? (
          <p className="text-sm text-destructive">
            Impossible de charger le quota photos.
          </p>
        ) : (
          <>
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-semibold text-sm">
                {quota.total} / {quota.quota} photos
              </span>
              <span className="text-xs text-muted-foreground">
                {quota.remaining} restante(s)
              </span>
            </div>
            <div className="h-2 w-full rounded bg-secondary overflow-hidden">
              <div
                className={`h-full rounded ${
                  atCapacity ? 'bg-destructive' : 'bg-brand'
                }`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
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
            ? 'border-border bg-muted opacity-60 cursor-not-allowed'
            : isDragActive
              ? 'border-ring bg-info-muted'
              : 'border-border cursor-pointer'
        }`}
      >
        <input {...getInputProps()} />
        {atCapacity ? (
          <p className="text-sm text-muted-foreground">
            Quota atteint. Pour libérer de la place, adressez-vous au club.
          </p>
        ) : isDragActive ? (
          <p className="text-sm text-info">Déposez les photos ici…</p>
        ) : (
          <>
            <p className="text-sm">Glissez vos photos ici, ou cliquez pour les choisir</p>
            <p className="text-xs text-muted-foreground mt-1">
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
              ? 'text-destructive'
              : banner.kind === 'success'
                ? 'text-success'
                : 'text-muted-foreground'
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
              className="relative w-28 h-28 border rounded overflow-hidden group bg-muted"
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
                    ? 'bg-brand/80'
                    : it.status === 'done'
                      ? 'bg-brand/80'
                      : it.status === 'skipped'
                        ? 'bg-gray-600/80'
                        : it.status === 'error'
                          ? 'bg-destructive/80'
                          : 'bg-black/40'
                }`}
              >
                {it.status === 'pending' && 'prête'}
                {it.status === 'uploading' && 'envoi…'}
                {it.status === 'done' && 'ajoutée'}
                {it.status === 'skipped' && 'ignorée'}
                {it.status === 'error' && 'erreur'}
              </span>
              {isToSend(it) && !isUploading && (
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs px-1 rounded z-10"
                  aria-label={`Retirer ${it.file.name}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* La raison de chaque erreur : une vignette n'a pas la place de la montrer. */}
      {items.some((it) => it.status === 'error' && it.error) && (
        <ul className="text-sm text-destructive space-y-1">
          {items
            .filter((it) => it.status === 'error' && it.error)
            .map((it) => (
              <li key={it.id}>
                {it.file.name} : {it.error}
              </li>
            ))}
        </ul>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={upload}
          disabled={isUploading || pendingCount === 0}
          className="bg-brand text-brand-foreground text-sm px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="text-sm px-3 py-1.5 rounded border border-border disabled:opacity-50"
          >
            Nettoyer
          </button>
        )}
      </div>
    </div>
  );
}
