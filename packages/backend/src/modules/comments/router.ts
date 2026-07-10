import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { proseMirrorContentSchema } from "@contracts/shared/prosemirror";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";

/**
 * Router des commentaires (arborescents).
 *
 * - Lecture publique (`getByPost`) : les commentaires d'un post sont
 *   visibles par tous. Renvoyés à plat avec leur auteur ; le frontend
 *   reconstruit l'arbre via `parentId` (plus souple qu'un arbre figé
 *   côté serveur).
 * - Écriture protégée : tout utilisateur connecté peut commenter et
 *   répondre. L'édition/suppression est réservée à l'auteur (la
 *   modération admin pourra être ajoutée via un endpoint dédié).
 *
 * `content` est un document ProseMirror (Json, schéma opaque partagé —
 * cf. contracts/shared/prosemirror.ts). Les garanties de non-vacuité et
 * de taille sont portées par l'éditeur bridé côté front.
 *
 * `Reaction` étant polymorphe (pas de FK), la suppression d'un
 * commentaire nettoie explicitement les réactions de toute sa
 * sous-arborescence (le commentaire + ses réponses, qui cascadent en DB).
 */

const authorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  pseudo: true,
  email: true,
  avatar: true,
  image: true,
} as const;

export const commentRouter = router({
  /** Tous les commentaires d'un post (à plat, triés du plus ancien). */
  getByPost: publicProcedure
    .input(z.object({ postId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.comment.findMany({
        where: { postId: input.postId },
        orderBy: { createdAt: "asc" },
        include: { author: { select: authorSelect } },
      });
    }),

  /** Crée un commentaire ou une réponse (si `parentId` fourni). */
  create: protectedProcedure
    .input(
      z.object({
        postId: z.number().int(),
        parentId: z.number().int().nullable().optional(),
        content: proseMirrorContentSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        select: { id: true },
      });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post introuvable." });
      }

      // Une réponse doit cibler un commentaire du même post.
      if (input.parentId != null) {
        const parent = await ctx.prisma.comment.findUnique({
          where: { id: input.parentId },
          select: { id: true, postId: true },
        });
        if (!parent || parent.postId !== input.postId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Commentaire parent invalide.",
          });
        }
      }

      return ctx.prisma.comment.create({
        data: {
          postId: input.postId,
          parentId: input.parentId ?? null,
          content: input.content as Prisma.InputJsonValue,
          authorId: ctx.sessionClient.user.id,
        },
        include: { author: { select: authorSelect } },
      });
    }),

  /** Édite son propre commentaire. */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        content: proseMirrorContentSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });
      if (!comment) throw new TRPCError({ code: "NOT_FOUND" });
      if (comment.authorId !== ctx.sessionClient.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous ne pouvez éditer que vos propres commentaires.",
        });
      }
      return ctx.prisma.comment.update({
        where: { id: input.id },
        data: { content: input.content as Prisma.InputJsonValue },
        include: { author: { select: authorSelect } },
      });
    }),

  /**
   * Supprime un commentaire et toute sa sous-arborescence. Les réponses
   * cascadent en DB ; on supprime au préalable les réactions polymorphes
   * de tous les commentaires concernés (récupérés par requête récursive).
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });
      if (!comment) throw new TRPCError({ code: "NOT_FOUND" });
      if (comment.authorId !== ctx.sessionClient.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous ne pouvez supprimer que vos propres commentaires.",
        });
      }

      // Sous-arborescence (le commentaire + tous ses descendants).
      const descendants = await ctx.prisma.$queryRaw<{ id: number }[]>`
        WITH RECURSIVE tree AS (
          SELECT id FROM "Comment" WHERE id = ${input.id}
          UNION ALL
          SELECT c.id FROM "Comment" c JOIN tree t ON c."parentId" = t.id
        )
        SELECT id FROM tree
      `;
      const ids = descendants.map((d) => d.id);

      await ctx.prisma.$transaction([
        ctx.prisma.reaction.deleteMany({
          where: { targetType: "COMMENT", targetId: { in: ids } },
        }),
        // Supprime la racine ; les réponses cascadent (onDelete: Cascade).
        ctx.prisma.comment.delete({ where: { id: input.id } }),
      ]);

      return { id: input.id, deletedCount: ids.length };
    }),
});