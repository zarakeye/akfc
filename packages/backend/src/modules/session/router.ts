import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

export const sessionRouter = router({
  getAll: protectedProcedure
    .use(isAdmin)
    .query(async ({ ctx }) => {
      return ctx.prisma.session.findMany({
        orderBy: { createdAt: "desc" },
      });
    }),

  updateExpiration: protectedProcedure
    .use(isAdmin)
    .input(
      z.object({
        id: z.string().min(1),
        expiresAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.session.findUnique({
        where: { id: input.id },
        select: { id: true },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      return ctx.prisma.session.update({
        where: { id: input.id },
        data: {
          expiresAt: input.expiresAt,
        },
      });
    }),
});