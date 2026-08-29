import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";

/** Réserve l'action aux administrateurs (role.name === "ADMIN"). */
async function assertAdmin(ctx: {
  prisma: PrismaClient;
  user: { id: string };
}): Promise<void> {
  if (!(await isAdminByGroup(ctx.prisma, ctx.user.id))) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Réservé aux administrateurs." });
  }
}

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

  all: protectedProcedure.query(async ({ ctx }) => {
    await assertAdmin(ctx);
    return ctx.prisma.pageVisibility.findMany({
      select: { key: true, published: true },
    });
  }),

  setPublished: protectedProcedure
    .input(z.object({ key: z.string().min(1), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx);
      return ctx.prisma.pageVisibility.upsert({
        where: { key: input.key },
        create: { key: input.key, published: input.published },
        update: { published: input.published },
      });
    }),

  setAll: protectedProcedure
    .input(z.object({ keys: z.array(z.string().min(1)), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx);
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
  entityDraftCounts: protectedProcedure.query(async ({ ctx }) => {
    await assertAdmin(ctx);
    const [disciplines, events, stages] = await Promise.all([
      ctx.prisma.discipline.count({ where: { publicationDate: null } }),
      ctx.prisma.event.count({ where: { publicationDate: null } }),
      ctx.prisma.stage.count({ where: { publicationDate: null } }),
    ]);
    return { disciplines, events, stages };
  }),
});
