import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";

import { pageContentSchemaV1 } from "@contracts/page";

/**
 * posts/router.ts — refactor v2.
 *
 * Aligne Post sur le pattern des autres composites (Stage/Event) :
 *
 *   - **`content` en `pageContentSchemaV1`** (PageBuilder) au lieu de la
 *     string brute de la v1 — un article a du contenu riche (texte,
 *     images, documents).
 *   - **`publicationDate?`** pour le cycle brouillon/publié, identique à
 *     Event : `null` = brouillon, date passée = publié, future = programmé.
 *   - **Sync transactionnelle** des références médias (`pageType: "POST"`)
 *     sur create/update/delete.
 *   - **`authorId` = utilisateur courant** au create (pas un input) —
 *     l'auteur est celui qui écrit.
 *
 * Lectures publiques (`getAll` published, `getById`), écritures sous
 * `requirePermission("manage_posts")`.
 *
 * Le `delete` nettoie aussi les réactions polymorphes (du post + de ses
 * commentaires), puisque `Reaction` n'a pas de FK DB.
 */

/* -------------------------------------------------------------------------- */
/*                                  SCHEMAS                                   */
/* -------------------------------------------------------------------------- */

const createInput = z.object({
  title: z.string().trim().min(1).max(255),
  content: pageContentSchemaV1,
  publicationDate: z.coerce.date().nullable().optional(),
});

const updateInput = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1).max(255).optional(),
  content: pageContentSchemaV1.optional(),
  publicationDate: z.coerce.date().nullable().optional(),
});

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const postRouter = router({
  /** Posts publiés uniquement (pages publiques). */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.post.findMany({
      where: { publicationDate: { not: null, lte: new Date() } },
      orderBy: { publicationDate: "desc" },
    });
  }),

  /** Tous les posts, brouillons inclus (back-office). */
  getAllAdmin: protectedProcedure
    .use(requirePermission("manage_posts"))
    .query(async ({ ctx }) => {
      return ctx.prisma.post.findMany({
        orderBy: [
          { publicationDate: { sort: "desc", nulls: "first" } },
          { createdAt: "desc" },
        ],
      });
    }),

  /**
   * Lookup public par id — seuls les posts PUBLIÉS (publicationDate non
   * null et passée). Un brouillon/programmé renvoie NOT_FOUND.
   */
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findFirst({
        where: {
          id: input.id,
          publicationDate: { not: null, lte: new Date() },
        },
      });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      }
      return post;
    }),

  /**
   * Lookup admin par id — brouillons/programmés inclus.
   * Alimente la fiche et l'édition admin.
   */
  getByIdAdmin: protectedProcedure
    .use(requirePermission("manage_posts"))
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      }
      return post;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_posts"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        const created = await tx.post.create({
          data: {
            title: input.title,
            content: input.content as Prisma.InputJsonValue,
            authorId: ctx.sessionClient.user.id,
            publicationDate: input.publicationDate ?? null,
          },
        });

        await syncPageMediaReferences(tx, {
          pageType: "POST",
          pageId: String(created.id),
          newContent: input.content,
        });

        return created;
      });
    }),

  update: protectedProcedure
    .use(requirePermission("manage_posts"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, content, ...rest } = input;

      return await ctx.prisma.$transaction(async (tx) => {
        let updated;
        try {
          const data: Prisma.PostUncheckedUpdateInput = {
            title: rest.title,
            publicationDate: rest.publicationDate,
            content:
              content === undefined
                ? undefined
                : (content as Prisma.InputJsonValue),
          };
          updated = await tx.post.update({ where: { id }, data });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
          ) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
          }
          throw err;
        }

        if (content !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "POST",
            pageId: String(id),
            newContent: content,
          });
        }

        return updated;
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_posts"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Ids des commentaires (pour nettoyer leurs réactions polymorphes).
      const comments = await ctx.prisma.comment.findMany({
        where: { postId: input.id },
        select: { id: true },
      });
      const commentIds = comments.map((c) => c.id);

      return await ctx.prisma.$transaction(async (tx) => {
        // Libère les médias référencés par le composite.
        await syncPageMediaReferences(tx, {
          pageType: "POST",
          pageId: String(input.id),
          newContent: null,
        });

        // Réactions polymorphes (pas de cascade DB).
        await tx.reaction.deleteMany({
          where: { targetType: "POST", targetId: input.id },
        });
        await tx.reaction.deleteMany({
          where: { targetType: "COMMENT", targetId: { in: commentIds } },
        });

        // Commentaires et sondage cascadent en DB.
        try {
          return await tx.post.delete({ where: { id: input.id } });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
          ) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
          }
          throw err;
        }
      });
    }),
});

export default postRouter;