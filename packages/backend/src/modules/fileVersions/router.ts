import { z } from "zod";

import { router, protectedProcedure } from "#trpc/core.ts";
import { sameAppRoot } from "#trpc/middleware.ts";

import {
  deleteVersion,
  listVersions,
  restoreVersion,
  versionDownloadUrl,
} from "#modules/fileVersions/fileVersions.service.ts";

/**
 * fileVersion.router.ts — anciennes versions d'un fichier de la bibliothèque.
 * Les droits sont vérifiés dans le service (admin, membres ou éditeurs de l'espace du groupe).
 */
const memberProcedure = protectedProcedure.use(sameAppRoot);

const userOf = (ctx: { sessionClient: { user: { id: string; isAdmin: boolean } } }) => ({
  id: ctx.sessionClient.user.id,
  isAdmin: ctx.sessionClient.user.isAdmin,
});

const versionInput = z.object({ versionId: z.string().min(1) });

export const fileVersionRouter = router({
  /** Le contenu actuel et les anciennes versions d'un fichier, par son chemin. */
  list: memberProcedure
    .input(z.object({ fullPath: z.string().min(1) }))
    .query(({ ctx, input }) => listVersions({ prisma: ctx.prisma, user: userOf(ctx), fullPath: input.fullPath })),

  /** Lien de téléchargement d'une version (10 minutes). */
  downloadUrl: memberProcedure
    .input(versionInput)
    .mutation(async ({ ctx, input }) => ({
      url: await versionDownloadUrl({ prisma: ctx.prisma, user: userOf(ctx), versionId: input.versionId }),
    })),

  /** Remet une version à la place du fichier ; le contenu actuel devient une version. */
  restore: memberProcedure
    .input(versionInput)
    .mutation(({ ctx, input }) => restoreVersion({ prisma: ctx.prisma, user: userOf(ctx), versionId: input.versionId })),

  /** Efface une version (admin). */
  delete: memberProcedure
    .input(versionInput)
    .mutation(async ({ ctx, input }) => {
      await deleteVersion({ prisma: ctx.prisma, user: userOf(ctx), versionId: input.versionId });
      return { ok: true as const };
    }),
});
