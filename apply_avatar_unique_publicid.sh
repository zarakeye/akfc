#!/bin/bash
# Avatar : publicId UNIQUE par upload (solution C). Le publicId FIXE causait
# tous les bugs de cache CDN (cliche de retard, ancien qui revient au reload)
# car le CDN Cloudinary ressert l ancien binaire pour une URL inchangee.
# Desormais chaque upload -> `avatars/<userId>/<timestamp>-<rand>` : l URL
# change, User.avatar change, tout se rafraichit naturellement (reload
# compris). « Un seul avatar » preserve : register SUPPRIME l ancien fichier.
# register prend maintenant { publicId } (genere a la signature).
# À lancer depuis la RACINE du monorepo : bash apply_avatar_unique_publicid.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

echo "-> packages/backend/src/modules/avatar/avatar.service.ts"
cat > 'packages/backend/src/modules/avatar/avatar.service.ts' << 'FILE_EOF'
import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

import { readUploadedAssetMetadata } from "@backend/modules/cloudinary/services/readUploadedAssetMetadata.service";
import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";

/**
 * avatar.service.ts — pipeline avatar, ISOLÉ du reste.
 *
 * Un avatar n'est PAS un MediaAsset : pas de catégorie, pas de cycle
 * pending/published, pas de finder. On stocke QUE son publicId sur
 * `User.avatar` ; l'URL est construite par le proxy `by-public-id`.
 *
 * ⚠ publicId UNIQUE par upload (`avatars/<userId>/<timestamp>`), PAS fixe.
 * Raison : un publicId fixe + cache CDN Cloudinary = l'ancien binaire
 * resservi après écrasement (« cliché de retard », réapparition au reload).
 * Un publicId unique fait changer l'URL à chaque upload → le CDN n'a jamais
 * d'ancien binaire pour cette URL, et `User.avatar` change donc TOUT se
 * rafraîchit naturellement (reload compris), sans store de version ni
 * cache-buster. « Un seul fichier » reste vrai : on SUPPRIME l'ancien à
 * chaque remplacement. Le folder est dérivé du userId côté serveur : un
 * user ne peut agir que sur son propre espace.
 */

/** Dossier-entité des avatars d'un user. */
export function avatarFolder(appRoot: string, userId: string): string {
  return `${appRoot}/avatars/${userId}`;
}

/** Vrai si le publicId appartient bien à l'espace avatar de CE user. */
function isOwnAvatarPublicId(
  publicId: string,
  appRoot: string,
  userId: string,
): boolean {
  return publicId.startsWith(`${avatarFolder(appRoot, userId)}/`);
}

/**
 * Signature d'un upload direct d'avatar. Génère un publicId UNIQUE
 * (horodaté) côté serveur et le renvoie : le client upload avec, puis le
 * repasse à `register`.
 */
export function createAvatarUploadSignature(params: {
  appRoot: string;
  userId: string;
}) {
  const { appRoot, userId } = params;
  const folder = avatarFolder(appRoot, userId);
  // publicId unique : timestamp ms + court aléatoire (évite collision si
  // deux uploads dans la même ms).
  const unique = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const publicId = unique;
  const fullPublicId = `${folder}/${publicId}`;
  const timestamp = Math.floor(Date.now() / 1000);

  const toSign: Record<string, string | number | boolean> = {
    folder,
    public_id: publicId,
    timestamp,
    type: "authenticated",
  };
  const signature = crypto
    .createHash("sha1")
    .update(
      Object.keys(toSign)
        .sort()
        .map((k) => `${k}=${toSign[k]}`)
        .join("&") + process.env.CLOUDINARY_API_SECRET,
    )
    .digest("hex");

  return {
    folder,
    publicId,
    fullPublicId,
    timestamp,
    type: "authenticated" as const,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}

/**
 * Après upload : confirme l'existence côté Cloudinary, pointe `User.avatar`
 * sur le nouveau publicId, puis SUPPRIME l'ancien fichier (un seul avatar à
 * la fois). Le publicId reçu est vérifié comme appartenant à l'espace du
 * user (sécurité : pas d'injection d'un publicId arbitraire).
 */
export async function registerAvatar(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
  publicId: string;
}): Promise<{ publicId: string }> {
  const { prisma, appRoot, userId, publicId } = params;

  if (!isOwnAvatarPublicId(publicId, appRoot, userId)) {
    throw new Error("publicId hors de l'espace avatar de l'utilisateur.");
  }

  // Confirme que l'upload a bien abouti (jette sinon).
  await readUploadedAssetMetadata({ publicId, resourceType: "image" });

  // Ancien avatar (à supprimer après bascule).
  const prev = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });
  const oldPublicId = prev?.avatar ?? null;

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: publicId },
  });

  // Supprime l'ancien fichier Cloudinary (best-effort, jamais bloquant).
  if (oldPublicId && oldPublicId !== publicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId, {
        resource_type: "image",
        type: "authenticated",
        invalidate: true,
      });
    } catch {
      // ancien déjà absent — rien à faire
    }
  }

  return { publicId };
}

/**
 * Supprime l'avatar courant : fichier Cloudinary + champ User.avatar.
 */
export async function deleteAvatar(params: {
  prisma: PrismaClient;
  userId: string;
}): Promise<void> {
  const { prisma, userId } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });
  const publicId = user?.avatar ?? null;

  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        type: "authenticated",
        invalidate: true,
      });
    } catch {
      // déjà absent — rien à faire
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
  });
}
FILE_EOF

echo "-> packages/backend/src/modules/avatar/router.ts"
cat > 'packages/backend/src/modules/avatar/router.ts' << 'FILE_EOF'
import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc/core";
import {
  createAvatarUploadSignature,
  registerAvatar,
  deleteAvatar,
} from "@backend/modules/avatar/avatar.service";

/**
 * Router avatar — tout est scellé sur le user CONNECTÉ (ctx.sessionClient
 * .user.id). Le folder est dérivé du userId côté serveur ; `register`
 * vérifie que le publicId reçu appartient bien à l'espace du user.
 */
export const avatarRouter = router({
  /** Signature d'upload direct (publicId UNIQUE généré côté serveur). */
  getUploadSignature: protectedProcedure.mutation(({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    return createAvatarUploadSignature({ appRoot: ctx.appRoot, userId });
  }),

  /** Après upload : pointe User.avatar sur le nouveau publicId, supprime l'ancien. */
  register: protectedProcedure
    .input(z.object({ publicId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;
      return registerAvatar({
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
        userId,
        publicId: input.publicId,
      });
    }),

  /** Avatar courant du user connecté (publicId ou null). */
  getMine: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.sessionClient.user.id },
      select: { avatar: true },
    });
    return { publicId: user?.avatar ?? null };
  }),

  /** Suppression de l'avatar. */
  remove: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    await deleteAvatar({ prisma: ctx.prisma, userId });
    return { ok: true };
  }),
});

export default avatarRouter;
FILE_EOF

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

      const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
      const res = await fetch(url, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Cloudinary HTTP ${res.status}`);

      // publicId UNIQUE : on le repasse à register, qui pointe User.avatar
      // dessus et supprime l'ancien. L'URL change donc naturellement
      // (nouveau publicId) → refresh partout, reload compris.
      const registered = await register.mutateAsync({
        publicId: sig.fullPublicId,
      });
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

echo
pnpm --filter backend typecheck && pnpm --filter web typecheck