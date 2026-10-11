import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc/core";
import {
  createAvatarUploadSignature,
  registerAvatar,
  deleteAvatar,
  createAvatarR2Upload,
  registerAvatarR2,
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

  /** Envoi direct sur R2 : URL signée (PUT) + chemin à renvoyer à registerR2. */
  createR2Upload: protectedProcedure
    .input(z.object({ mimeType: z.string().min(1), bytes: z.number().int().positive() }))
    .mutation(({ ctx, input }) =>
      createAvatarR2Upload({ appRoot: ctx.appRoot, userId: ctx.sessionClient.user.id, mimeType: input.mimeType, bytes: input.bytes }),
    ),

  /** Après l'envoi R2 : pointe User.avatar sur le nouveau fichier, supprime l'ancien. */
  registerR2: protectedProcedure
    .input(z.object({ path: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      registerAvatarR2({ prisma: ctx.prisma, appRoot: ctx.appRoot, userId: ctx.sessionClient.user.id, path: input.path }),
    ),

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
