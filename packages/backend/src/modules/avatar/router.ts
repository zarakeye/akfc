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
