import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc/core";
import {
  deleteAvatar,
  createAvatarUpload,
  registerAvatar,
} from "@backend/modules/avatar/avatar.service";

/**
 * Router avatar — tout est scellé sur le user CONNECTÉ (ctx.sessionClient
 * .user.id). Le dossier est dérivé du userId côté serveur ; `register`
 * vérifie que le chemin reçu appartient bien à l'espace du user.
 */
export const avatarRouter = router({
  /** Envoi direct sur R2 : URL signée (PUT) + chemin à renvoyer à `register`. */
  createUpload: protectedProcedure
    .input(z.object({ mimeType: z.string().min(1), bytes: z.number().int().positive() }))
    .mutation(({ ctx, input }) =>
      createAvatarUpload({ appRoot: ctx.appRoot, userId: ctx.sessionClient.user.id, mimeType: input.mimeType, bytes: input.bytes }),
    ),

  /** Après l'envoi : pointe User.avatar sur le nouveau fichier, supprime l'ancien. */
  register: protectedProcedure
    .input(z.object({ path: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      registerAvatar({ prisma: ctx.prisma, appRoot: ctx.appRoot, userId: ctx.sessionClient.user.id, path: input.path }),
    ),

  /** Avatar courant du user connecté (clé de stockage ou null). */
  getMine: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.sessionClient.user.id },
      select: { avatar: true },
    });
    return { avatar: user?.avatar ?? null };
  }),

  /** Suppression de l'avatar. */
  remove: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    await deleteAvatar({ prisma: ctx.prisma, userId });
    return { ok: true };
  }),
});

export default avatarRouter;
