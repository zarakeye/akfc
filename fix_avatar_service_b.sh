#!/bin/bash
# Avatar TRANCHE 1 — CORRECTIF option B : l'avatar n'est PAS un MediaAsset
# (pas de categorie, pas de finder). On stocke juste le publicId sur
# User.avatar. Resout l'erreur categoryId requis.
# À lancer depuis la RACINE du monorepo : bash fix_avatar_service_b.sh
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
 * Un avatar n'est PAS un MediaAsset de bibliothèque : pas de catégorie,
 * pas de cycle pending/published, pas de présence dans le finder. On ne
 * stocke donc QUE son publicId sur `User.avatar` ; l'URL est construite à
 * la volée par le proxy `by-public-id` (délivrance publique, comme tout
 * asset authenticated).
 *
 * Un seul fichier remplaçable, sous `${appRoot}/avatars/${userId}/avatar`
 * (publicId fixe → le ré-upload écrase). Le folder et le publicId sont
 * dérivés du userId côté serveur : un user ne peut ni écrire ni deviner
 * l'avatar d'un autre.
 */

/** Dossier-entité de l'avatar d'un user. */
export function avatarFolder(appRoot: string, userId: string): string {
  return `${appRoot}/avatars/${userId}`;
}

/** publicId complet, fixe (un seul avatar par user). */
export function avatarPublicId(appRoot: string, userId: string): string {
  return `${avatarFolder(appRoot, userId)}/avatar`;
}

/**
 * Signature d'un upload direct d'avatar (authenticated, overwrite forcé —
 * on écrase toujours l'avatar précédent au même publicId). Ne passe PAS
 * par resolvePendingUploadFolder : le folder est l'espace privé du user.
 */
export function createAvatarUploadSignature(params: {
  appRoot: string;
  userId: string;
}) {
  const { appRoot, userId } = params;
  const folder = avatarFolder(appRoot, userId);
  const publicId = "avatar";
  const timestamp = Math.floor(Date.now() / 1000);

  const toSign: Record<string, string | number | boolean> = {
    folder,
    overwrite: true,
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
    fullPublicId: `${folder}/${publicId}`,
    timestamp,
    overwrite: true,
    type: "authenticated" as const,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}

/**
 * Après upload Cloudinary : relit les métadonnées (source de vérité, pour
 * confirmer que le fichier existe bien), puis pointe `User.avatar` sur le
 * publicId. Aucune ligne MediaAsset créée.
 */
export async function registerAvatar(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<{ publicId: string }> {
  const { prisma, appRoot, userId } = params;
  const fullPublicId = avatarPublicId(appRoot, userId);

  // Confirme que l'upload a bien abouti côté Cloudinary (jette sinon).
  await readUploadedAssetMetadata({
    publicId: fullPublicId,
    resourceType: "image",
  });

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: fullPublicId },
  });

  return { publicId: fullPublicId };
}

/**
 * Supprime l'avatar : fichier Cloudinary + champ User.avatar.
 * Best-effort côté Cloudinary (un avatar déjà absent n'est pas une erreur).
 */
export async function deleteAvatar(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<void> {
  const { prisma, appRoot, userId } = params;
  const fullPublicId = avatarPublicId(appRoot, userId);

  try {
    await cloudinary.uploader.destroy(fullPublicId, {
      resource_type: "image",
      type: "authenticated",
      invalidate: true,
    });
  } catch {
    // avatar déjà absent côté Cloudinary — rien à faire
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
  });
}
FILE_EOF
pnpm --filter backend typecheck