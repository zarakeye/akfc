import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

/**
 * Publication par page (mode « En construction »).
 *
 * Réservé aux admins (centre de contrôle). Ce que voit un visiteur, page publiée ou « en
 * construction », la page le décide elle-même en lisant la base (editorialGate).
 */
export const pageVisibilityRouter = router({
  all: protectedProcedure.use(isAdmin).query(async ({ ctx }) => {
    return ctx.prisma.pageVisibility.findMany({
      select: { key: true, published: true },
    });
  }),

  setPublished: protectedProcedure
    .use(isAdmin)
    .input(z.object({ key: z.string().min(1), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.pageVisibility.upsert({
        where: { key: input.key },
        create: { key: input.key, published: input.published },
        update: { published: input.published },
      });
    }),

  /**
   * Nombre d'entités en BROUILLON (publicationDate null) — disciplines,
   * events, stages. Pour le compteur/tooltip de la cloche admin.
   */
  entityDraftCounts: protectedProcedure.use(isAdmin).query(async ({ ctx }) => {
    const [disciplines, events, stages] = await Promise.all([
      ctx.prisma.discipline.count({ where: { publicationDate: null } }),
      ctx.prisma.event.count({ where: { publicationDate: null } }),
      ctx.prisma.seminar.count({ where: { publicationDate: null } }),
    ]);
    return { disciplines, events, stages };
  }),
});
