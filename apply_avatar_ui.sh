#!/bin/bash
# Avatar TRANCHE 2 (UI) : AvatarUploader (fiche profil) qui reutilise le
# Cropper existant (crop libre) PUIS force le carre 1:1 en post-traitement
# (toSquareFile) — le Cropper partage n'est pas touche. Flux : fichier ->
# Cropper -> carre -> upload signe direct -> avatar.register -> refresh.
# À lancer depuis la RACINE du monorepo : bash apply_avatar_ui.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

mkdir -p apps/web/src/features/avatar

echo "-> apps/web/src/features/avatar/toSquareFile.ts"
cat > 'apps/web/src/features/avatar/toSquareFile.ts' << 'FILE_EOF'
/**
 * Recadre un fichier image en CARRÉ CENTRÉ (le plus grand carré possible,
 * pris au centre). Post-traitement de l'avatar : l'utilisateur croppe
 * librement avec le Cropper habituel, puis on garantit le 1:1 ici — sans
 * toucher au Cropper partagé. Retourne un nouveau File PNG.
 */
export async function toSquareFile(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponible.");
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, side, side);

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob a échoué."))),
      "image/png",
    ),
  );
  return new File([blob], "avatar.png", { type: "image/png" });
}
FILE_EOF

echo "-> apps/web/src/features/avatar/AvatarUploader.tsx"
cat > 'apps/web/src/features/avatar/AvatarUploader.tsx' << 'FILE_EOF'
"use client";

import { useMemo, useRef, useState, type JSX } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import Cropper from "@features/gallery-crop/components/Cropper";
import type { PictureItem } from "@features/gallery-crop/types/picture.types";
import type { CropResult } from "@features/gallery-crop/types/cropper.types";
import { toSquareFile } from "@features/avatar/toSquareFile";

/**
 * AvatarUploader — fiche profil. Réutilise le Cropper existant (crop libre,
 * zoom, rotation) PUIS force le carré en post-traitement (toSquareFile) :
 * le Cropper partagé n'est pas modifié. Flux :
 *   fichier → PictureItem → <Cropper> → croppedFile → carré → upload signé
 *   direct Cloudinary → avatar.register → refresh (getMine).
 *
 * L'avatar est délivré publiquement via le proxy by-public-id ; ici on
 * l'affiche simplement à partir du publicId courant.
 */

function avatarUrl(publicId: string | null): string | null {
  if (!publicId) return null;
  const enc = publicId.split("/").map(encodeURIComponent).join("/");
  return `/api/media/by-public-id/${enc}?variant=large`;
}

export function AvatarUploader(): JSX.Element {
  const utils = trpc.useUtils();
  const { data } = trpc.avatar.getMine.useQuery();
  const getSignature = trpc.avatar.getUploadSignature.useMutation();
  const register = trpc.avatar.register.useMutation();
  const remove = trpc.avatar.remove.useMutation();

  const [itemToCrop, setItemToCrop] = useState<PictureItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUrl = useMemo(
    () => avatarUrl(data?.publicId ?? null),
    [data?.publicId],
  );

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier
    if (!file) return;
    setError(null);
    setItemToCrop({
      id: crypto.randomUUID(),
      file,
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
    });
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
      if (!res.ok) {
        throw new Error(`Cloudinary HTTP ${res.status}`);
      }

      await register.mutateAsync();
      await utils.avatar.getMine.invalidate();
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
    } catch {
      setError("Suppression impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-32 w-32 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- proxy signé
          <img
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

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
          Changer
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
    </div>
  );
}
FILE_EOF

echo
pnpm --filter web typecheck