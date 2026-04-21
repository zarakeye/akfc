import { router, protectedProcedure, publicProcedure } from "@workspace/backend/trpc/core";
import { requirePermission } from "@workspace/backend/trpc/middleware";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const categoryRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.category.findMany({
      orderBy: { id: "asc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.findUnique({
        where: { id: input.id },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  getByType: publicProcedure
    .input(z.object({ type: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.findUnique({
        where: { type: input.type },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_categories"))
    .input(z.object({ type: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.category.findUnique({
        where: { type: input.type },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This category already exists.",
        });
      }

      return ctx.prisma.category.create({
        data: {
          type: input.type,
        },
      });
    }),

  update: protectedProcedure
    .use(requirePermission("manage_categories"))
    .input(
      z.object({
        id: z.number(),
        type: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.category.findUnique({
        where: { type: input.type },
      });

      if (exists && exists.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Another category with this type already exists.",
        });
      }

      return ctx.prisma.category.update({
        where: { id: input.id },
        data: { type: input.type },
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_categories"))
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.delete({
        where: { id: input.id },
      });
    }),
});

export default categoryRouter;