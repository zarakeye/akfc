import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const categoryRouter = router({
  /** Les catégories, pour les sélecteurs : la clé (lue par le code) et le libellé (affiché). */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.category.findMany({
      select: { id: true, key: true, type: true },
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
          message: "Catégorie introuvable.",
        });
      }

      return category;
    }),

  delete: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Garde : on refuse la suppression tant que des entités y sont
      // rattachées (categoryId est obligatoire sur Discipline → un delete
      // sec lèverait un P2003 brut). Message explicite pour que l'admin
      // sache quoi réassigner d'abord.
      const [disciplineCount, mediaCount] = await Promise.all([
        ctx.prisma.discipline.count({ where: { categoryId: input.id } }),
        ctx.prisma.mediaAsset.count({ where: { categoryId: input.id } }),
      ]);

      if (disciplineCount > 0 || mediaCount > 0) {
        const parts: string[] = [];
        if (disciplineCount > 0) {
          parts.push(
            `${disciplineCount} discipline(s)`,
          );
        }
        if (mediaCount > 0) {
          parts.push(`${mediaCount} média(s)`);
        }
        throw new TRPCError({
          code: "CONFLICT",
          message: `Cette catégorie est encore utilisée par ${parts.join(
            " et ",
          )}. Réassignez-les avant de la supprimer.`,
        });
      }

      return ctx.prisma.category.delete({
        where: { id: input.id },
      });
    }),
});

export default categoryRouter;