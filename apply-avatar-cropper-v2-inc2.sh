#!/usr/bin/env bash
#
# AKFC — Cropper avatar (v2), INCRÉMENT 2 : AvatarUploader (le tampon).
#
# - recette (CropRecipe) + fichier ORIGINAL en state ;
# - vignette « Nouveau » CLIQUABLE → rouvre le Cropper seedé (image non croppée) ;
# - forme en state (défaut cercle, persiste session) → radius vignettes + Cropper ;
# - Cropper invoqué en mode avatar : enableTheme + controls="responsive"
#   + shape/onShapeChange + initialTransform ;
# - toSquareFile RETIRÉ du flux ; une nouvelle source écrase la proposition ;
# - ✓/✗ consomment la recette.
#
# CameraCapture : INTOUCHÉ. toSquareFile.ts laissé sur le disque (plus importé).
# Un typecheck.
# Usage : bash apply-avatar-cropper-v2-inc2.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/avatar/AvatarUploader.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BR="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$BR" = "main" ] || [ "$BR" = "master" ] && { echo "NOTE: branche '$BR'."; sleep 2; } || true
fi

cat > "$F" <<'TSX'
"use client";

import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Check, ImageUp, Loader2, Trash2, Video, X } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useAvatarVersionStore } from "@lib/stores/useAvatarVersionStore";
import { useSessionStore } from "@lib/stores/useSessionStore";
import Cropper from "@features/gallery-crop/components/Cropper";
import type { PictureItem } from "@features/gallery-crop/types/picture.types";
import type {
  CropResult,
  CropRecipe,
  Shape,
} from "@features/gallery-crop/types/cropper.types";
import { CameraCapture } from "@features/avatar/CameraCapture";

/**
 * AvatarUploader — trois sources (glisser-déposer, picker fichier, caméra
 * frontale) convergent vers le Cropper (mode avatar : thème persistant,
 * curseurs responsive, formes cercle/carré). La grille étant carrée, le rendu
 * est déjà 1:1 — pas de post-traitement.
 *
 * CONFIRMATION (option A) : le crop ne déclenche PAS l'upload. Il produit une
 * proposition LOCALE (« Nouveau ») ; l'upload n'a lieu qu'au clic ✓.
 *
 * TAMPON : « Nouveau » porte sa RECETTE (zoom, rotation, position en fractions,
 * forme) + le fichier ORIGINAL non croppé. Cliquer la vignette rouvre le
 * Cropper exactement dans cet état. La recette est CONSOMMÉE à ✓ ou ✗.
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
  const setSessionAvatar = useSessionStore((s) => s.setAvatar);
  const bumpAvatar = useAvatarVersionStore((s) => s.bump);
  const version = useAvatarVersionStore((s) =>
    userId ? (s.versions[userId] ?? 0) : 0,
  );

  const [itemToCrop, setItemToCrop] = useState<PictureItem | null>(null);
  const [cropSeed, setCropSeed] = useState<CropRecipe | null>(null);
  const [shape, setShape] = useState<Shape>("circle");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [awaitingImage, setAwaitingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingRecipe, setPendingRecipe] = useState<CropRecipe | null>(null);
  const [pendingOriginal, setPendingOriginal] = useState<File | null>(null);
  const [settlingUrl, setSettlingUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUrl = useMemo(
    () => avatarUrl(data?.publicId ?? null, version),
    [data?.publicId, version],
  );

  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
      if (settlingUrl) URL.revokeObjectURL(settlingUrl);
    };
  }, [pendingUrl, settlingUrl]);

  const avatarRadius = shape === "circle" ? "rounded-full" : "rounded-2xl";

  const dropPending = () => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(null);
    setPendingUrl(null);
    setPendingRecipe(null);
    setPendingOriginal(null);
  };

  const beginFreshCrop = (file: File) => {
    setError(null);
    dropPending();
    setCropSeed(null);
    setItemToCrop({
      id: crypto.randomUUID(),
      file,
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const reopenPending = () => {
    if (!pendingOriginal || !pendingRecipe) return;
    setError(null);
    setShape(pendingRecipe.shape);
    setCropSeed(pendingRecipe);
    setItemToCrop({
      id: crypto.randomUUID(),
      file: pendingOriginal,
      originalFile: pendingOriginal,
      previewUrl: URL.createObjectURL(pendingOriginal),
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
    onDrop: (files) => {
      if (files[0]) beginFreshCrop(files[0]);
    },
  });

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) beginFreshCrop(file);
  };

  const onCameraCapture = (file: File) => {
    setCameraOpen(false);
    beginFreshCrop(file);
  };

  const closeCropper = () => {
    setItemToCrop(null);
    setCropSeed(null);
  };

  const handleCrop = ({ croppedFile, recipe }: CropResult) => {
    const original = itemToCrop?.originalFile ?? null;
    setItemToCrop(null);
    setCropSeed(null);
    setError(null);
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(croppedFile);
    setPendingUrl(URL.createObjectURL(croppedFile));
    setPendingRecipe(recipe ?? null);
    setPendingOriginal(original);
  };

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

      const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
      const res = await fetch(url, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Cloudinary HTTP ${res.status}`);

      const registered = await register.mutateAsync({
        publicId: sig.fullPublicId,
      });
      await utils.avatar.getMine.invalidate();
      setSessionAvatar(registered.publicId);
      if (userId) bumpAvatar(userId);
      onChanged?.(registered.publicId);

      setSettlingUrl(pendingUrl);
      setPendingFile(null);
      setPendingUrl(null);
      setPendingRecipe(null); // recette consommée
      setPendingOriginal(null);
      setAwaitingImage(true);
      setBusy(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec de l'upload de l'avatar.",
      );
      setBusy(false);
    }
  };

  const cancelPending = () => {
    dropPending();
  };

  const handleSettled = () => {
    setAwaitingImage(false);
    if (settlingUrl) {
      URL.revokeObjectURL(settlingUrl);
      setSettlingUrl(null);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    setError(null);
    try {
      await remove.mutateAsync();
      await utils.avatar.getMine.invalidate();
      setSessionAvatar(null);
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
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs uppercase tracking-wide text-gray-400">Actuel</span>
              <div className={`h-32 w-32 overflow-hidden border border-gray-200 bg-gray-100 ${avatarRadius}`}>
                {currentUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- proxy signé
                  <img key={currentUrl} src={currentUrl} alt="Avatar actuel" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>
            </div>

            <div className="w-px self-stretch bg-gray-300" />

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs uppercase tracking-wide text-emerald-600">Nouveau</span>
              <button
                type="button"
                disabled={busy}
                onClick={reopenPending}
                title="Rouvrir le recadrage dans le même état"
                className={`group relative h-32 w-32 overflow-hidden border-2 border-emerald-400 bg-gray-100 ${avatarRadius} disabled:cursor-default`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- blob local */}
                <img src={pendingUrl} alt="Nouvel avatar" className="h-full w-full object-cover" />
                {busy ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-medium text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                    Ré-éditer
                  </span>
                )}
              </button>
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
            <div className={`relative h-32 w-32 overflow-hidden border border-gray-200 bg-gray-100 ${avatarRadius}`}>
              {awaitingImage && settlingUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob local
                <img src={settlingUrl} alt="Votre avatar" className="h-full w-full object-cover" />
              ) : currentUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- proxy signé
                <img key={currentUrl} src={currentUrl} alt="Votre avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <Camera className="h-8 w-8" />
                </div>
              )}

              {awaitingImage && currentUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- préchargement
                <img
                  key={`preload-${currentUrl}`}
                  src={currentUrl}
                  alt=""
                  aria-hidden
                  className="hidden"
                  onLoad={handleSettled}
                  onError={handleSettled}
                />
              )}

              {(busy || awaitingImage) && (
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
          key={itemToCrop.id}
          picture={itemToCrop}
          enableTheme
          controls="responsive"
          shape={shape}
          onShapeChange={setShape}
          initialTransform={
            cropSeed
              ? { zoom: cropSeed.zoom, rotation: cropSeed.rotation, gridFrac: cropSeed.gridFrac }
              : undefined
          }
          onCancel={closeCropper}
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
TSX
echo "  ok  AvatarUploader.tsx"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -20 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
git commit -m "feat(avatar): cropper avatar complet — tampon réouvrable, thème persistant, responsive, formes" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }