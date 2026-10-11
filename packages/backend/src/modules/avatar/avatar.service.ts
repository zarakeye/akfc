import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

import { readUploadedAssetMetadata } from "@backend/modules/cloudinary/services/readUploadedAssetMetadata.service";
import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";
import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Bucket, getR2Client, getR2PresignClient } from "@backend/modules/storage/adapters/r2/client";
import { deleteDerivatives } from "@backend/modules/media/services/mediaDerivatives.service";

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

  if (publicId) await removeAvatarFile(publicId);

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
  });
}

/* ── Avatars sur R2 (sortie de Cloudinary) ─────────────────────────────────
 * Clé : `${appRoot}/avatars/<userId>/<horodatage>-<aléa>.<ext>` ; User.avatar garde la clé R2
 * (avec extension) — une valeur SANS extension est un ancien publicId Cloudinary.
 */

export const AVATAR_MAX_BYTES = 10 * 1024 * 1024;
const AVATAR_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Vrai si la valeur de User.avatar est une clé R2 (porte une extension). */
export function isR2AvatarKey(value: string): boolean {
  return /\.(jpe?g|png|webp)$/i.test(value);
}

export async function createAvatarR2Upload(params: { appRoot: string; userId: string; mimeType: string; bytes: number }) {
  const ext = AVATAR_EXT[params.mimeType];
  if (!ext) throw new Error("Format d'avatar non accepté (JPEG, PNG ou WebP).");
  if (params.bytes <= 0 || params.bytes > AVATAR_MAX_BYTES) throw new Error("Avatar trop volumineux (10 Mo au plus).");
  const path = `${avatarFolder(params.appRoot, params.userId)}/${Date.now()}-${crypto.randomBytes(3).toString("hex")}.${ext}`;
  const uploadUrl = await getSignedUrl(
    getR2PresignClient(),
    new PutObjectCommand({ Bucket: getR2Bucket(), Key: path, ContentType: params.mimeType }),
    { expiresIn: 5 * 60 },
  );
  return { uploadUrl, path };
}

/** Supprime un fichier d'avatar, R2 ou Cloudinary (meilleur effort, jamais bloquant). */
async function removeAvatarFile(value: string): Promise<void> {
  try {
    if (isR2AvatarKey(value)) {
      await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: value }));
      await deleteDerivatives(value);
    } else {
      await cloudinary.uploader.destroy(value, { resource_type: "image", type: "authenticated", invalidate: true });
    }
  } catch {
    // déjà absent — rien à faire
  }
}

export async function registerAvatarR2(params: { prisma: PrismaClient; appRoot: string; userId: string; path: string }): Promise<{ publicId: string }> {
  const { prisma, appRoot, userId, path } = params;
  if (!path.startsWith(`${avatarFolder(appRoot, userId)}/`) || path.includes("..") || !isR2AvatarKey(path)) {
    throw new Error("Chemin hors de l'espace avatar de l'utilisateur.");
  }
  const head = await getR2Client()
    .send(new HeadObjectCommand({ Bucket: getR2Bucket(), Key: path }))
    .catch(() => null);
  if (!head) throw new Error("Avatar introuvable : l'envoi n'a pas abouti.");
  if (!(head.ContentType ?? "").startsWith("image/") || (head.ContentLength ?? 0) > AVATAR_MAX_BYTES) {
    await removeAvatarFile(path);
    throw new Error("Fichier d'avatar refusé.");
  }
  const prev = await prisma.user.findUnique({ where: { id: userId }, select: { avatar: true } });
  await prisma.user.update({ where: { id: userId }, data: { avatar: path } });
  if (prev?.avatar && prev.avatar !== path) await removeAvatarFile(prev.avatar);
  return { publicId: path };
}
