#!/bin/bash
# Avatar — TRANCHE 1 (backend) : service + router dedies, ISOLES des services
# d'upload partages. Upload direct signe vers AKFC/avatars/<userId>/avatar
# (publicId fixe, overwrite), status "avatar", User.avatar = publicId,
# suppression de l'ancien. Delivrance publique via le proxy existant.
# À lancer depuis la RACINE du monorepo : bash apply_avatar_backend.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

mkdir -p packages/backend/src/modules/avatar

echo "-> packages/backend/src/modules/avatar/avatar.service.ts"
cat > 'packages/backend/src/modules/avatar/avatar.service.ts' << 'FILE_EOF'
import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

import { readUploadedAssetMetadata } from "@backend/modules/cloudinary/services/readUploadedAssetMetadata.service";
import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";

/**
 * avatar.service.ts — pipeline avatar, ISOLÉ des services d'upload partagés.
 *
 * Un avatar = un seul fichier remplaçable, stocké sous
 * `${appRoot}/avatars/${userId}/avatar` (publicId fixe → le ré-upload
 * écrase naturellement). status = "avatar" : hors des cycles pending/
 * published, donc invisible du finder de gestion de contenu. Délivré
 * publiquement via le proxy `by-public-id` (comme tout asset authenticated).
 *
 * Le publicId étant fixe et le folder forcé au userId courant, un user ne
 * peut ni écrire ni deviner l'avatar d'un autre.
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
 * Après upload Cloudinary : relit les métadonnées (source de vérité),
 * upsert le MediaAsset en status "avatar", pointe User.avatar dessus.
 * L'ancien avatar est écrasé au même publicId — pas de fichier orphelin.
 */
export async function registerAvatar(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}) {
  const { prisma, appRoot, userId } = params;
  const fullPublicId = avatarPublicId(appRoot, userId);

  const meta = await readUploadedAssetMetadata({
    publicId: fullPublicId,
    resourceType: "image",
  });

  const fullPath = `${meta.publicId}${meta.format ? "." + meta.format : ""}`;

  return prisma.$transaction(async (tx) => {
    const asset = await tx.mediaAsset.upsert({
      where: { publicId: meta.publicId },
      create: {
        publicId: meta.publicId,
        cloudinaryAssetId: meta.assetId,
        secureUrl: meta.secureUrl,
        resourceType: meta.resourceType,
        mimeType: meta.mimeType,
        format: meta.format,
        originalFileName: "avatar",
        bytes: meta.bytes,
        width: meta.width,
        height: meta.height,
        duration: meta.duration,
        appRoot,
        status: "avatar",
        uploaderUserId: userId,
        fullPath,
      },
      update: {
        secureUrl: meta.secureUrl,
        cloudinaryAssetId: meta.assetId,
        resourceType: meta.resourceType,
        mimeType: meta.mimeType,
        format: meta.format,
        bytes: meta.bytes,
        width: meta.width,
        height: meta.height,
        duration: meta.duration,
        fullPath,
        status: "avatar",
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { avatar: meta.publicId },
    });

    return asset;
  });
}

/**
 * Supprime l'avatar : fichier Cloudinary + MediaAsset + champ User.avatar.
 * Best-effort côté Cloudinary (un avatar déjà absent n'est pas une erreur).
 */
export async function deleteAvatar(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}) {
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

  await prisma.$transaction(async (tx) => {
    await tx.mediaAsset.deleteMany({ where: { publicId: fullPublicId } });
    await tx.user.update({
      where: { id: userId },
      data: { avatar: null },
    });
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
 * .user.id) : impossible d'agir sur l'avatar d'un autre. Le folder et le
 * publicId sont dérivés du userId côté serveur, jamais reçus du client.
 */
export const avatarRouter = router({
  /** Signature d'upload direct vers l'espace avatar privé du user. */
  getUploadSignature: protectedProcedure.mutation(({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    return createAvatarUploadSignature({ appRoot: ctx.appRoot, userId });
  }),

  /** Après upload Cloudinary : enregistre et pointe User.avatar. */
  register: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    return registerAvatar({
      prisma: ctx.prisma,
      appRoot: ctx.appRoot,
      userId,
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
    await deleteAvatar({ prisma: ctx.prisma, appRoot: ctx.appRoot, userId });
    return { ok: true };
  }),
});

export default avatarRouter;
FILE_EOF

echo "-> packages/backend/src/modules/index.ts"
cat > 'packages/backend/src/modules/index.ts' << 'FILE_EOF'
import { router } from "@backend/trpc/core";

import { authRouter } from "@backend/modules/auth/router";
import { userRouter } from "@backend/modules/users/router";
import { avatarRouter } from "@backend/modules/avatar/router";
import { roleRouter } from "@backend/modules/roles/router";
import { sessionRouter } from "@backend/modules/session/router";
import { cloudinaryRouter } from "@backend/modules/cloudinary/router";
import { trashRouter } from "@backend/modules/trash/router";
import { permissionRouter } from "@backend/modules/permissions/router";
import { categoryRouter } from "@backend/modules/categories/router";
import { courseRouter } from "@backend/modules/courses/router";
import { disciplineRouter } from "@backend/modules/disciplines/router";
import { stageRouter } from "@backend/modules/stages/router";
import { stageSessionRouter } from "@backend/modules/stageSessions/router";
import { eventRouter } from "@backend/modules/events/router";
import { eventSessionRouter } from "@backend/modules/eventSessions/router";
import { postRouter } from "@backend/modules/posts/router";
import { storageRouter } from "@backend/modules/storage/router";
import { mediaRouter } from "@backend/modules/media/router";
import { originRouter } from "@backend/modules/origins/router";
import { commentRouter } from "@backend/modules/comments/router";
import { reactionRouter } from "@backend/modules/reactions/router";
import { pollRouter } from "@backend/modules/polls/router";
import { disciplineFamilyRouter } from "@backend/modules/disciplineFamilies/router";
import { galleryRouter } from "@backend/modules/galleries/router";
import { breakingNewsRouter } from "@backend/modules/breakingNews/router";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  avatar: avatarRouter,
  role: roleRouter,
  session: sessionRouter,
  cloudinary: cloudinaryRouter,
  trash: trashRouter,
  permission: permissionRouter,
  category: categoryRouter,
  course: courseRouter,
  discipline: disciplineRouter,
  origin: originRouter,
  stage: stageRouter,
  stageSession: stageSessionRouter,
  event: eventRouter,
  eventSession: eventSessionRouter,
  post: postRouter,
  storage: storageRouter,
  media: mediaRouter,
  comment: commentRouter,
  reaction: reactionRouter,
  poll: pollRouter,
  disciplineFamily: disciplineFamilyRouter,
  gallery: galleryRouter,
  breakingNews: breakingNewsRouter,
});

export type AppRouter = typeof appRouter;
FILE_EOF

echo
pnpm --filter backend typecheck