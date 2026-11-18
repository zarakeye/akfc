import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  router,
  protectedProcedure,
  publicProcedure,
} from "#trpc/core.ts";
import { isAdmin } from "#trpc/middleware.ts";
import { saveBreakingNews } from "#modules/breakingNews/saveBreakingNews.service.ts";
import {
  createBreakingNewsSchema,
  updateBreakingNewsSchema,
} from "@akfc/contracts/breakingNews/breakingNews.schema.ts";

/**
 * Router des BreakingNews — les actualités courtes du club.
 *
 * La BreakingNews est la « voix du club » : diffusion UNIDIRECTIONNELLE
 * (ruban défilant + sidebar du site public), sans auteur affiché, sans
 * commentaires ni réactions — le pendant inverse de Post.
 *
 * Cycle de vie :
 *   - **`publicationDate?`** : pattern maison (Stage/Event/Post) —
 *     null = brouillon, future = programmée, passée = publiée.
 *   - **`expiresAt?`** : une actu est éphémère — passée cette échéance,
 *     elle disparaît du ruban et de la sidebar (null = sans expiration).
 *
 * Accès :
 *   - Lecture publique : `getActive` uniquement (publiées ET non
 *     expirées) — un brouillon ou une actu périmée n'existe pas
 *     publiquement.
 *   - Tout le reste : `isAdmin`.
 */

/* -------------------------------------------------------------------------- */
/*                                   ROUTER                                   */
/* -------------------------------------------------------------------------- */

export const breakingNewsRouter = router({
  /**
   * Actus actives = publiées ET non expirées, la plus récente d'abord.
   * Alimente le ruban et la sidebar sur toutes les pages publiques.
   * Cap défensif à 20 : le ruban n'a pas vocation à défiler l'histoire
   * du club.
   */
  getActive: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();
    return ctx.prisma.breakingNews.findMany({
      where: {
        publicationDate: { not: null, lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { publicationDate: "desc" },
      take: 20,
    });
  }),

  /** Liste admin complète — brouillons d'abord (nulls first), puis par date. */
  getAllAdmin: protectedProcedure
    .use(isAdmin)
    .query(async ({ ctx }) => {
      return ctx.prisma.breakingNews.findMany({
        orderBy: [
          { publicationDate: { sort: "desc", nulls: "first" } },
          { createdAt: "desc" },
        ],
      });
    }),

  getByIdAdmin: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const news = await ctx.prisma.breakingNews.findUnique({
        where: { id: input.id },
      });
      if (!news) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Brève introuvable.",
        });
      }
      return news;
    }),

  // Création et mise à jour : le service, partagé avec la server action du formulaire.
  // Le schéma vient de contracts, comme celui du formulaire.
  create: protectedProcedure
    .use(isAdmin)
    .input(createBreakingNewsSchema)
    .mutation(({ ctx, input }) => saveBreakingNews(ctx.prisma, input)),

  update: protectedProcedure
    .use(isAdmin)
    .input(updateBreakingNewsSchema)
    .mutation(({ ctx, input }) => saveBreakingNews(ctx.prisma, input)),

  delete: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.breakingNews.delete({ where: { id: input.id } });
        return { deleted: true };
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Brève introuvable.",
        });
      }
    }),
});
