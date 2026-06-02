import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";

/**
 * Router des sondages rattachés aux posts.
 *
 * Un post a **au plus un** sondage (`Poll.postId @unique`) ; sa présence
 * = « vote activé ». `multiple` autorise plusieurs choix par votant,
 * sinon un seul (le vote remplace alors le précédent). `closesAt`
 * permet une clôture optionnelle après laquelle on ne peut plus voter.
 *
 * - `getByPost` (public) : options + décompte + total + les votes de
 *   l'utilisateur courant (s'il est connecté).
 * - `create` / `delete` (admin `manage_posts`).
 * - `vote` (connecté) : enregistre/remplace les votes.
 */

export const pollRouter = router({
  /** Sondage d'un post avec résultats et votes de l'utilisateur courant. */
  getByPost: publicProcedure
    .input(z.object({ postId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const poll = await ctx.prisma.poll.findUnique({
        where: { postId: input.postId },
        include: {
          options: {
            orderBy: { sortOrder: "asc" },
            include: { _count: { select: { votes: true } } },
          },
        },
      });
      if (!poll) return null;

      const userId = ctx.sessionClient?.user?.id;
      let myVotes: number[] = [];
      if (userId) {
        const votes = await ctx.prisma.pollVote.findMany({
          where: { pollId: poll.id, userId },
          select: { optionId: true },
        });
        myVotes = votes.map((v) => v.optionId);
      }

      const options = poll.options.map((o) => ({
        id: o.id,
        label: o.label,
        sortOrder: o.sortOrder,
        count: o._count.votes,
      }));

      return {
        id: poll.id,
        question: poll.question,
        multiple: poll.multiple,
        closesAt: poll.closesAt,
        isClosed: poll.closesAt != null && poll.closesAt.getTime() < Date.now(),
        options,
        myVotes,
        totalVotes: options.reduce((sum, o) => sum + o.count, 0),
      };
    }),

  /** Crée le sondage d'un post (refuse si le post en a déjà un). */
  create: protectedProcedure
    .use(requirePermission("manage_posts"))
    .input(
      z.object({
        postId: z.number().int(),
        question: z.string().trim().min(1).max(300),
        multiple: z.boolean().default(false),
        closesAt: z.coerce.date().nullable().optional(),
        options: z
          .array(z.string().trim().min(1).max(200))
          .min(2, "Au moins deux options.")
          .max(20),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        select: { id: true, poll: { select: { id: true } } },
      });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post introuvable." });
      }
      if (post.poll) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ce post a déjà un sondage.",
        });
      }

      return ctx.prisma.poll.create({
        data: {
          postId: input.postId,
          question: input.question,
          multiple: input.multiple,
          closesAt: input.closesAt ?? null,
          options: {
            create: input.options.map((label, index) => ({
              label,
              sortOrder: index,
            })),
          },
        },
        include: { options: { orderBy: { sortOrder: "asc" } } },
      });
    }),

  /**
   * Enregistre les votes de l'utilisateur courant. Remplace tout vote
   * antérieur sur ce sondage (cohérent en mode simple comme multiple).
   */
  vote: protectedProcedure
    .input(
      z.object({
        pollId: z.number().int(),
        optionIds: z.array(z.number().int()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;

      const poll = await ctx.prisma.poll.findUnique({
        where: { id: input.pollId },
        include: { options: { select: { id: true } } },
      });
      if (!poll) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sondage introuvable." });
      }
      if (poll.closesAt != null && poll.closesAt.getTime() < Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ce sondage est clôturé.",
        });
      }
      if (!poll.multiple && input.optionIds.length > 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ce sondage n'autorise qu'un seul choix.",
        });
      }

      const validIds = new Set(poll.options.map((o) => o.id));
      for (const optionId of input.optionIds) {
        if (!validIds.has(optionId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Option ${optionId} invalide pour ce sondage.`,
          });
        }
      }

      await ctx.prisma.$transaction([
        ctx.prisma.pollVote.deleteMany({
          where: { pollId: input.pollId, userId },
        }),
        ctx.prisma.pollVote.createMany({
          data: input.optionIds.map((optionId) => ({
            pollId: input.pollId,
            optionId,
            userId,
          })),
        }),
      ]);

      return { ok: true };
    }),

  /** Supprime un sondage (et ses options/votes en cascade). */
  delete: protectedProcedure
    .use(requirePermission("manage_posts"))
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.poll.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
});