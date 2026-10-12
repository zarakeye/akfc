import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Bucket, getR2Client, getR2PresignClient } from "@backend/modules/storage/adapters/r2/client";
import { deleteDerivatives } from "@backend/modules/media/services/mediaDerivatives.service";

/**
 * avatar.service.ts — pipeline avatar, ISOLÉ du reste.
 *
 * Un avatar n'est PAS un MediaAsset : pas de catégorie, pas de cycle
 * pending/published, pas de finder. `User.avatar` garde la clé R2 du fichier :
 * `${appRoot}/avatars/<userId>/<horodatage>-<aléa>.<ext>`, servi par
 * `/api/media/public/avatar/<userId>` (vignette AVIF).
 *
 * Clé UNIQUE par envoi, et l'ancien fichier est SUPPRIMÉ à chaque
 * remplacement : un seul avatar à la fois. Le dossier est dérivé du userId
 * côté serveur : un user ne peut agir que sur son propre espace.
 */

/** Dossier-entité des avatars d'un user. */
export function avatarFolder(appRoot: string, userId: string): string {
  return `${appRoot}/avatars/${userId}`;
}

/**
 * Supprime l'avatar courant : fichier + champ User.avatar.
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
  const avatar = user?.avatar ?? null;

  if (avatar) await removeAvatarFile(avatar);

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
  });
}

export const AVATAR_MAX_BYTES = 10 * 1024 * 1024;
const AVATAR_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Vrai si la valeur de User.avatar est une clé d'avatar valide (image JPEG, PNG ou WebP). */
export function isAvatarKey(value: string): boolean {
  return /\.(jpe?g|png|webp)$/i.test(value);
}

export async function createAvatarUpload(params: { appRoot: string; userId: string; mimeType: string; bytes: number }) {
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

/** Supprime un fichier d'avatar et ses vignettes (meilleur effort, jamais bloquant). */
async function removeAvatarFile(value: string): Promise<void> {
  try {
    await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: value }));
    await deleteDerivatives(value);
  } catch {
    // déjà absent — rien à faire
  }
}

export async function registerAvatar(params: { prisma: PrismaClient; appRoot: string; userId: string; path: string }): Promise<{ avatar: string }> {
  const { prisma, appRoot, userId, path } = params;
  if (!path.startsWith(`${avatarFolder(appRoot, userId)}/`) || path.includes("..") || !isAvatarKey(path)) {
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
  return { avatar: path };
}
