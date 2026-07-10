#!/bin/bash
# Fix refresh avatar (complement) : le cache-buster changeait bien l URL mais
# React mettait a jour le `src` sur le MEME element <img> — le navigateur ne
# rechargeait pas fiablement l image. Ajout d une `key={currentUrl}` : l element
# est detruit/recree quand l URL change, forcant le rechargement immediat
# (plus besoin de reload manuel de la page).
# À lancer depuis la RACINE du monorepo : bash fix_avatar_refresh_key.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }
echo "-> apps/web/src/features/avatar/AvatarUploader.tsx"
cat > 'apps/web/src/features/avatar/AvatarUploader.tsx' << 'FILE_EOF'
"use client";

import { useMemo, useRef, useState, type JSX } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, ImageUp, Loader2, Trash2, Video } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import Cropper from "@features/gallery-crop/components/Cropper";
import type { PictureItem } from "@features/gallery-crop/types/picture.types";
import type { CropResult } from "@features/gallery-crop/types/cropper.types";
import { toSquareFile } from "@features/avatar/toSquareFile";
import { CameraCapture } from "@features/avatar/CameraCapture";

/**
 * AvatarUploader — trois sources d'image convergeant vers le MÊME flux :
 *   1. glisser-déposer (react-dropzone),
 *   2. sélection fichier (picker HDD),
 *   3. capture caméra frontale (CameraCapture),
 * puis Cropper (crop libre) → toSquareFile (carré 1:1 garanti) → upload
 * signé direct Cloudinary → avatar.register → refresh.
 *
 * FLUX AUTONOME : l'avatar se sauvegarde de lui-même dès le crop validé
 * (indépendant du formulaire de profil qui l'héberge). Délivrance
 * publique via le proxy by-public-id.
 */

function avatarUrl(publicId: string | null, bust?: number): string | null {
  if (!publicId) return null;
  const enc = publicId.split("/").map(encodeURIComponent).join("/");
  // Le publicId de l'avatar est FIXE (`.../avatar`) : l'URL ne change jamais
  // d'un upload à l'autre, et la route sert l'image en `immutable` (cache 1 an).
  // Sans cache-buster, le navigateur garde l'ancienne image. `bust` change à
  // chaque changement d'avatar → force le rechargement de la vue courante.
  const suffix = bust ? `&t=${bust}` : "";
  return `/api/media/by-public-id/${enc}?variant=large${suffix}`;
}

interface AvatarUploaderProps {
  /**
   * Notifié après chaque changement d'avatar (nouveau publicId, ou null
   * après suppression). Permet à un formulaire hôte de synchroniser un
   * champ — la persistance reste AUTONOME (l'avatar est déjà sauvé).
   */
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

  // Jeton de cache-bust : change à chaque upload/suppression pour forcer
  // le rechargement de l'aperçu (publicId fixe → URL sinon identique).
  const [bustToken, setBustToken] = useState<number>(() => Date.now());
  const [itemToCrop, setItemToCrop] = useState<PictureItem | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUrl = useMemo(
    () => avatarUrl(data?.publicId ?? null, bustToken),
    [data?.publicId, bustToken],
  );

  /** Point d'entrée unique : un fichier source → le Cropper. */
  const startCrop = (file: File) => {
    setError(null);
    setItemToCrop({
      id: crypto.randomUUID(),
      file,
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  // Source 1 — glisser-déposer.
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    noClick: true, // le clic est géré par nos boutons, pas toute la zone
    onDrop: (files) => {
      if (files[0]) startCrop(files[0]);
    },
  });

  // Source 2 — picker fichier.
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) startCrop(file);
  };

  // Source 3 — caméra (dans CameraCapture).
  const onCameraCapture = (file: File) => {
    setCameraOpen(false);
    startCrop(file);
  };

  const handleCrop = async ({ croppedFile }: CropResult) => {
    setItemToCrop(null);
    setBusy(true);
    setError(null);
    try {
      const squared = await toSquareFile(croppedFile);
      const sig = await getSignature.mutateAsync();

      const formData = new FormData();
      formData.append("file", squared);
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
      setBustToken(Date.now());
      onChanged?.(registered.publicId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec de l'upload de l'avatar.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    setError(null);
    try {
      await remove.mutateAsync();
      await utils.avatar.getMine.invalidate();
      setBustToken(Date.now());
      onChanged?.(null);
    } catch {
      setError("Suppression impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Zone de dépôt : englobe l'aperçu, surlignée pendant le drag */}
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
          {isDragActive ? "Déposez l'image ici" : "ou glissez une image ici"}
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