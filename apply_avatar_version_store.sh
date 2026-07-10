#!/bin/bash
# Refresh avatar GLOBAL via store partage. Le publicId d avatar est fixe et
# la route sert en cache immutable : sans signal de version, aucune vue ne
# rafraichit l image apres changement (d ou l ancien avatar persistant
# jusqu au reload). Solution : un store Zustand `useAvatarVersionStore` qui
# tient une version PAR userId ; toute URL d avatar ajoute `?v=version` et
# porte une `key` pour remonter l <img>. Bumper au changement recharge
# l avatar PARTOUT (uploader, header, posts, commentaires...) d un seul geste.
# À lancer depuis la RACINE du monorepo : bash apply_avatar_version_store.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

mkdir -p apps/web/src/lib/stores

echo "-> apps/web/src/lib/stores/useAvatarVersionStore.ts"
cat > 'apps/web/src/lib/stores/useAvatarVersionStore.ts' << 'FILE_EOF'
import { create } from "zustand";

/**
 * Version d'avatar PAR utilisateur, partagée dans toute l'app.
 *
 * Problème résolu : l'avatar a un publicId FIXE (`.../avatar`), donc son URL
 * ne change jamais d'un upload à l'autre, et la route le sert en cache
 * `immutable`. Sans signal de version, aucune vue (uploader, header, posts,
 * commentaires…) ne rafraîchit l'image après un changement.
 *
 * Ce store tient un jeton de version par userId. TOUTE URL d'avatar y ajoute
 * `?v=<version>`. Bumper la version d'un user (au changement d'avatar)
 * recharge son image PARTOUT simultanément — un seul point de vérité.
 */
interface AvatarVersionStore {
  /** userId → jeton de version (timestamp du dernier changement). */
  versions: Record<string, number>;
  /** Version courante d'un user (0 si jamais changé cette session). */
  getVersion: (userId: string) => number;
  /** Force le rechargement de l'avatar d'un user partout dans l'app. */
  bump: (userId: string) => void;
}

export const useAvatarVersionStore = create<AvatarVersionStore>((set, get) => ({
  versions: {},
  getVersion: (userId) => get().versions[userId] ?? 0,
  bump: (userId) =>
    set((state) => ({
      versions: { ...state.versions, [userId]: Date.now() },
    })),
}));
FILE_EOF

echo "-> apps/web/src/features/social/userDisplay.tsx"
cat > 'apps/web/src/features/social/userDisplay.tsx' << 'FILE_EOF'
import type { JSX } from "react";
import { useAvatarVersionStore } from "@lib/stores/useAvatarVersionStore";

/**
 * Helpers d'affichage d'un utilisateur, partagés par les features
 * sociales (réactions, commentaires…). Évite de redéfinir la cascade
 * nom/portrait dans chaque composant.
 *
 * `DisplayUser` est la projection minimale renvoyée par les routers
 * social (même `select` partout) — les types inférés de tRPC y sont
 * structurellement assignables.
 */

export interface DisplayUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  email: string;
  avatar: string | null;
  image: string | null;
}

/** Nom complet → pseudo → email (cascade habituelle du projet). */
export function formatUserName(u: DisplayUser): string {
  const full = [u.firstName, u.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return full || u.pseudo || u.email;
}

/**
 * URL du proxy pour un publicId Cloudinary (délivrance publique,
 * authenticated signé côté serveur — marche pour les anonymes).
 */
function publicIdToUrl(publicId: string, version?: number): string {
  const enc = publicId.split("/").map(encodeURIComponent).join("/");
  const v = version ? `&v=${version}` : "";
  return `/api/media/by-public-id/${enc}?variant=large${v}`;
}

/**
 * URL de portrait. `avatar` est un publicId Cloudinary (uploadé via la
 * fiche profil) → passe par le proxy. `image` est déjà une URL absolue
 * (fournisseur OAuth) → utilisée telle quelle. Sinon null (→ initiales).
 */
export function portraitUrl(u: DisplayUser, version?: number): string | null {
  if (u.avatar) return publicIdToUrl(u.avatar, version);
  if (u.image) return u.image;
  return null;
}

/** Deux premières lettres du nom, pour le fallback sans portrait. */
export function initials(u: DisplayUser): string {
  return formatUserName(u).slice(0, 2).toUpperCase();
}

/**
 * Pastille ronde : portrait si disponible, sinon initiales sur fond
 * neutre. Deux tailles : `sm` (20px, listes denses) et `md` (32px,
 * en-tête de commentaire).
 */
export function UserPortrait({
  user,
  size = "sm",
}: {
  user: DisplayUser;
  size?: "sm" | "md";
}): JSX.Element {
  const dim = size === "md" ? "h-8 w-8 text-xs" : "h-5 w-5 text-[10px]";
  // Version d'avatar de CE user (partagée) : tout changement la bumpe et
  // recharge l'image ici comme partout ailleurs.
  const version = useAvatarVersionStore((s) => s.versions[user.id] ?? 0);
  const url = portraitUrl(user, version);

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={url}
        src={url}
        alt=""
        className={`shrink-0 rounded-full object-cover ${dim}`}
      />
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-muted font-medium ${dim}`}
    >
      {initials(user)}
    </span>
  );
}
FILE_EOF

echo "-> apps/web/src/features/avatar/AvatarUploader.tsx"
cat > 'apps/web/src/features/avatar/AvatarUploader.tsx' << 'FILE_EOF'
"use client";

import { useMemo, useRef, useState, type JSX } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, ImageUp, Loader2, Trash2, Video } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useAvatarVersionStore } from "@lib/stores/useAvatarVersionStore";
import { useSessionStore } from "@lib/stores/useSessionStore";
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

function avatarUrl(publicId: string | null, version?: number): string | null {
  if (!publicId) return null;
  const enc = publicId.split("/").map(encodeURIComponent).join("/");
  // publicId FIXE + cache `immutable` : sans jeton de version l'image ne se
  // rafraîchit jamais. `version` vient du store partagé (bump au changement).
  const v = version ? `&v=${version}` : "";
  return `/api/media/by-public-id/${enc}?variant=large${v}`;
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

  const userId = useSessionStore((s) => s.session?.user?.id ?? null);
  const bumpAvatar = useAvatarVersionStore((s) => s.bump);
  // Version partagée de MON avatar : lue ici pour l'aperçu, bumpée au
  // changement → rafraîchit l'aperçu ET toutes les autres vues (header,
  // posts…) d'un seul geste.
  const version = useAvatarVersionStore((s) =>
    userId ? (s.versions[userId] ?? 0) : 0,
  );
  const [itemToCrop, setItemToCrop] = useState<PictureItem | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUrl = useMemo(
    () => avatarUrl(data?.publicId ?? null, version),
    [data?.publicId, version],
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
      if (userId) bumpAvatar(userId);
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
      if (userId) bumpAvatar(userId);
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

echo
pnpm --filter web typecheck