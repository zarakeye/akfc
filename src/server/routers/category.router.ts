import { router, protectedProcedure, publicProcedure } from "@server/trpc/core";
import { z } from "zod";
import { requirePermission } from "./middleware";

export const categoryRouter = router({
  getAll: publicProcedure //protectedProcedure
    // .use(requirePermission("manage_categories"))
    .query(async ({ ctx }) => {
      try {
        return await ctx.prisma.category.findMany({ orderBy: { id: "asc" } });
      } catch (error) {
        console.log('Error fetching categories:', error);
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.category.findUnique({
        where: { id: input.id },
      });
    }),

  getByType: protectedProcedure
    .input(z.object({ type: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.category.findUnique({
        where: { type: input.type },
      });
    }),

  create: protectedProcedure
    .use(requirePermission("manage_categories"))
    .input(z.object({ type: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.category.findUnique({
        where: { type: input.type },
      });

      if (exists) {
        throw new Error("Cette categorie existe déjà. Veuillez choisir un autre nom.");
      }

      return ctx.prisma.category.create({
        data: {
          type: input.type,
        },
      });
    }),

  // rename / update
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
      if (exists) throw new Error("Une catégorie de ce type existe déjà. Veuillez choisir un autre type.");

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