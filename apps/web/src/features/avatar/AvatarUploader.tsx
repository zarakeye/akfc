"use client";

import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useDropzone } from "react-dropzone";
import { HEIC_ACCEPT, heicFailureMessage, heicProgressMessage, isHeicFile, toBrowserImages } from "@features/media/heic/browserImages";
import { Camera, Check, ImageUp, Loader2, Trash2, Video, X } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useAvatarVersionStore } from "@lib/stores/useAvatarVersionStore";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { avatarUrlFor } from "@features/social/userDisplay";
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


interface AvatarUploaderProps {
  onChanged?: (publicId: string | null) => void;
}

export function AvatarUploader({
  onChanged,
}: AvatarUploaderProps = {}): JSX.Element {
  const utils = trpc.useUtils();
  const { data } = trpc.avatar.getMine.useQuery();
  const createR2 = trpc.avatar.createR2Upload.useMutation();
  const registerR2 = trpc.avatar.registerR2.useMutation();
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

  // URL publique d'avatar (sert indifféremment un avatar R2 ou un ancien avatar Cloudinary).
  const currentUrl = useMemo(
    () => (data?.publicId && userId ? avatarUrlFor(userId, version) : null),
    [data?.publicId, userId, version],
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

  const openCropper = (file: File) => {
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

  // Photo HEIC (iPhone) : convertie en JPEG avant le recadrage (seul Safari sait l'afficher).
  const [heicConverting, setHeicConverting] = useState(false);
  const beginFreshCrop = (file: File) => {
    if (!isHeicFile(file)) return openCropper(file);
    setError(null);
    setHeicConverting(true);
    void toBrowserImages([file]).then(({ files, failed }) => {
      setHeicConverting(false);
      if (files[0]) openCropper(files[0]);
      else setError(heicFailureMessage(failed));
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
    accept: { "image/*": [], ...HEIC_ACCEPT },
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
      const auth = await createR2.mutateAsync({
        mimeType: pendingFile.type,
        bytes: pendingFile.size,
      });
      const res = await fetch(auth.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": pendingFile.type },
        body: pendingFile,
      });
      if (!res.ok) throw new Error(`Envoi refusé (HTTP ${res.status})`);

      const registered = await registerR2.mutateAsync({ path: auth.path });
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
          {heicConverting && <p className="text-sm text-muted-foreground">{heicProgressMessage(1)}</p>}
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

          {heicConverting && <p className="text-sm text-muted-foreground">{heicProgressMessage(1)}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
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
