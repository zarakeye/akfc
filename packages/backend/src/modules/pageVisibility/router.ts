import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

/**
 * Publication par page (mode « En construction »).
 *
 * `publishedKeys` est PUBLIC : c'est la porte (middleware) qui décide, pour un
 * non-admin, si une route est servie ou renvoyée vers « en construction ».
 * Le reste est réservé aux admins (centre de contrôle).
 */
export const pageVisibilityRouter = router({
  publishedKeys: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.pageVisibility.findMany({
      where: { published: true },
      select: { key: true },
    });
    return rows.map((r) => r.key);
  }),

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

  setAll: protectedProcedure
    .use(isAdmin)
    .input(z.object({ keys: z.array(z.string().min(1)), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(
        input.keys.map((key) =>
          ctx.prisma.pageVisibility.upsert({
            where: { key },
            create: { key, published: input.published },
            update: { published: input.published },
          }),
        ),
      );
      return { count: input.keys.length };
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
