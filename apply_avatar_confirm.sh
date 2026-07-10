#!/bin/bash
# Avatar : flux de CONFIRMATION avant/apres. Le crop ne declenche plus
# l upload direct — il produit une preview LOCALE affichee a cote de l avatar
# actuel (barre verticale entre les deux). Boutons ✗ (annuler, jette) et ✓
# (valider = upload+register+bump). Rien n ecrase Cloudinary avant validation.
# Corrige aussi le bug "ne remplace que si retire d abord" : le remplacement
# est desormais explicite, plus de dependance a l invalidate d un publicId fixe.
# À lancer depuis la RACINE du monorepo : bash apply_avatar_confirm.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }
echo "-> apps/web/src/features/avatar/AvatarUploader.tsx"
cat > 'apps/web/src/features/avatar/AvatarUploader.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useDropzone } from "react-dropzone";
import {
  Camera,
  Check,
  ImageUp,
  Loader2,
  Trash2,
  Video,
  X,
} from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useAvatarVersionStore } from "@lib/stores/useAvatarVersionStore";
import { useSessionStore } from "@lib/stores/useSessionStore";
import Cropper from "@features/gallery-crop/components/Cropper";
import type { PictureItem } from "@features/gallery-crop/types/picture.types";
import type { CropResult } from "@features/gallery-crop/types/cropper.types";
import { toSquareFile } from "@features/avatar/toSquareFile";
import { CameraCapture } from "@features/avatar/CameraCapture";

/**
 * AvatarUploader — trois sources (glisser-déposer, picker fichier, caméra
 * frontale) convergent vers le Cropper, puis un carré 1:1 (toSquareFile).
 *
 * FLUX AVEC CONFIRMATION (option A) : le crop ne déclenche PAS l'upload. Il
 * produit une preview LOCALE, affichée à côté de l'avatar actuel (avant /
 * après, séparés d'une barre verticale). L'upload+register+bump n'a lieu
 * qu'au clic « valider » (✓) ; « annuler » (✗) jette la preview et garde
 * l'ancien. Rien n'écrase Cloudinary tant que l'utilisateur n'a pas confirmé.
 *
 * Le refresh partout (header, posts…) passe par le store de version.
 */

function avatarUrl(publicId: string | null, version?: number): string | null {
  if (!publicId) return null;
  const enc = publicId.split("/").map(encodeURIComponent).join("/");
  const v = version ? `&v=${version}` : "";
  return `/api/media/by-public-id/${enc}?variant=large${v}`;
}

interface AvatarUploaderProps {
  onChanged?: (publicId: string | null) => void;
}

export function AvatarUploader({
  onChanged,
}: AvatarUploaderProps = {}): JSX.Element {
  const utils = trpc.useUtils();
  const { data } = trpc.avatar.getMine.useQuery();
  const getSignature = trpc.avatar.getUploadSignature.useMutation();
  const register = trpc.avatar.register.useMutation();
  const remove = trpc.avatar.remove.useMutation();

  const userId = useSessionStore((s) => s.session?.user?.id ?? null);
  const bumpAvatar = useAvatarVersionStore((s) => s.bump);
  const version = useAvatarVersionStore((s) =>
    userId ? (s.versions[userId] ?? 0) : 0,
  );

  const [itemToCrop, setItemToCrop] = useState<PictureItem | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview LOCALE du nouveau cliché (post-crop, avant upload). Tant qu'elle
  // est non-null, on est en mode confirmation (avant / après).
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUrl = useMemo(
    () => avatarUrl(data?.publicId ?? null, version),
    [data?.publicId, version],
  );

  // Libère l'objectURL de la preview quand elle change / au démontage.
  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

  const startCrop = (file: File) => {
    setError(null);
    setItemToCrop({
      id: crypto.randomUUID(),
      file,
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
    onDrop: (files) => {
      if (files[0]) startCrop(files[0]);
    },
  });

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) startCrop(file);
  };

  const onCameraCapture = (file: File) => {
    setCameraOpen(false);
    startCrop(file);
  };

  // Crop terminé → preview LOCALE (pas d'upload). Passe en mode confirmation.
  const handleCrop = async ({ croppedFile }: CropResult) => {
    setItemToCrop(null);
    setError(null);
    try {
      const squared = await toSquareFile(croppedFile);
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
      setPendingFile(squared);
      setPendingUrl(URL.createObjectURL(squared));
    } catch {
      setError("Impossible de préparer l'image.");
    }
  };

  // ✓ valider : upload + register + bump (le remplacement effectif).
  const confirmPending = async () => {
    if (!pendingFile) return;
    setBusy(true);
    setError(null);
    try {
      const sig = await getSignature.mutateAsync();

      const formData = new FormData();
      formData.append("file", pendingFile);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);
      formData.append("public_id", sig.publicId);
      formData.append("type", sig.type);
      formData.append("overwrite", String(sig.overwrite));

      const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
      const res = await fetch(url, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Cloudinary HTTP ${res.status}`);

      const registered = await register.mutateAsync();
      await utils.avatar.getMine.invalidate();
      if (userId) bumpAvatar(userId);
      onChanged?.(registered.publicId);

      cancelPending();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec de l'upload de l'avatar.",
      );
    } finally {
      setBusy(false);
    }
  };

  // ✗ annuler : jette la preview, garde l'ancien.
  const cancelPending = () => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(null);
    setPendingUrl(null);
  };

  const handleRemove = async () => {
    setBusy(true);
    setError(null);
    try {
      await remove.mutateAsync();
      await utils.avatar.getMine.invalidate();
      if (userId) bumpAvatar(userId);
      onChanged?.(null);
    } catch {
      setError("Suppression impossible.");
    } finally {
      setBusy(false);
    }
  };

  const inConfirm = pendingUrl !== null;

  return (
    <div className="flex flex-col items-center gap-3">
      {inConfirm ? (
        /* -------- MODE CONFIRMATION : avant / après -------- */
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-stretch gap-4">
            {/* Avant (actuel) */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs uppercase tracking-wide text-gray-400">
                Actuel
              </span>
              <div className="h-32 w-32 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                {currentUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- proxy signé
                  <img
                    key={currentUrl}
                    src={currentUrl}
                    alt="Avatar actuel"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>
            </div>

            {/* Barre verticale de séparation */}
            <div className="w-px self-stretch bg-gray-300" />

            {/* Après (nouveau) + boutons ✓ / ✗ */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs uppercase tracking-wide text-emerald-600">
                Nouveau
              </span>
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-emerald-400 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob local */}
                <img
                  src={pendingUrl}
                  alt="Nouvel avatar"
                  className="h-full w-full object-cover"
                />
                {busy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={cancelPending}
                  aria-label="Annuler"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={confirmPending}
                  aria-label="Valider"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        /* -------- MODE NORMAL : avatar actuel + sources -------- */
        <>
          <div
            {...getRootProps()}
            className={`flex flex-col items-center gap-3 rounded-lg p-3 transition-colors ${
              isDragActive ? "bg-emerald-50 ring-2 ring-emerald-300" : ""
            }`}
          >
            <input {...getInputProps()} />
            <div className="relative h-32 w-32 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
              {currentUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- proxy signé
                <img
                  key={currentUrl}
                  src={currentUrl}
                  alt="Votre avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <Camera className="h-8 w-8" />
                </div>
              )}
              {busy && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {isDragActive
                ? "Déposez l'image ici"
                : "ou glissez une image ici"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              <ImageUp className="h-4 w-4" />
              Choisir un fichier
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setCameraOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <Video className="h-4 w-4" />
              Caméra
            </button>
            {data?.publicId && (
              <button
                type="button"
                disabled={busy}
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Retirer
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickFile}
      />

      {itemToCrop && (
        <Cropper
          picture={itemToCrop}
          onCancel={() => setItemToCrop(null)}
          onCrop={handleCrop}
        />
      )}

      {cameraOpen && (
        <CameraCapture
          onCapture={onCameraCapture}
          onCancel={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
FILE_EOF
pnpm --filter web typecheck