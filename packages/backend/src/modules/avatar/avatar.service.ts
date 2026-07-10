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
