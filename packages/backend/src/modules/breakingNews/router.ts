import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  router,
  protectedProcedure,
  publicProcedure,
} from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

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
/*                                  SCHEMAS                                   */
/* -------------------------------------------------------------------------- */

const fields = {
  title: z.string().trim().min(1).max(150),
  /** Texte brut court — le ruban défile mal du texte riche. */
  body: z.string().trim().min(1).max(600),
  /**
   * Lien optionnel : interne (« /#post-12 » — un vote sur le mur) ou
   * externe. Pas de `.url()` : il doit accepter les chemins relatifs.
   */
  href: z.string().trim().min(1).max(500).nullable().optional(),
  publicationDate: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
};

/** L'expiration, si présente avec une publication, doit lui être postérieure. */
const assertCoherentDates = (
  data: { publicationDate?: Date | null; expiresAt?: Date | null },
  ctx: z.RefinementCtx,
) => {
  if (
    data.publicationDate &&
    data.expiresAt &&
    data.expiresAt <= data.publicationDate
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["expiresAt"],
      message: "L'expiration doit être postérieure à la publication.",
    });
  }
};

const createInput = z.object(fields).superRefine(assertCoherentDates);

const updateInput = z
  .object({ id: z.number().int().positive(), ...fields })
  .superRefine(assertCoherentDates);

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
          message: "BreakingNews not found.",
        });
      }
      return news;
    }),

  create: protectedProcedure
    .use(isAdmin)
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.breakingNews.create({
        data: {
          title: input.title,
          body: input.body,
          href: input.href ?? null,
          publicationDate: input.publicationDate ?? null,
          expiresAt: input.expiresAt ?? null,
        },
      });
    }),

  update: protectedProcedure
    .use(isAdmin)
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      try {
        return await ctx.prisma.breakingNews.update({
          where: { id },
          data: {
            title: data.title,
            body: data.body,
            href: data.href ?? null,
            publicationDate: data.publicationDate ?? null,
            expiresAt: data.expiresAt ?? null,
          },
        });
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "BreakingNews not found.",
        });
      }
    }),

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
          message: "BreakingNews not found.",
        });
      }
    }),
});
