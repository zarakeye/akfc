import { router, protectedProcedure } from "@server/trpc/core";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const activityTypeRouter = router({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.activityType.findMany({
        orderBy: { type: "asc" }
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.activityType.findUnique({
        where: { type: input.type },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${input.type} activity type already exists`,
        });
      }

      return ctx.prisma.activityType.create({
        data: {
          type: input.type,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.activityType.update({
        where: { id: input.id },
        data: {
          type: input.type,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.activityType.delete({
        where: { id: input.id },
      });
    }),
});