import { z } from "zod";
import { ReactionTarget } from "@prisma/client";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";

/**
 * Router des réactions emoji (polymorphe Post / Comment).
 *
 * Un « pouce levé » n'est qu'une réaction `emoji = "👍"`. La lecture
 * renvoie les réactions **groupées par emoji**, chaque groupe portant
 * la liste des utilisateurs (avec portrait + nom) pour l'affichage au
 * survol, et un drapeau `reactedByMe` pour surligner les emojis que
 * l'utilisateur courant a posés.
 */

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  pseudo: true,
  email: true,
  avatar: true,
  image: true,
} as const;

type ReactionUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  email: string;
  avatar: string | null;
  image: string | null;
};

interface ReactionWithUser {
  emoji: string;
  userId: string;
  user: ReactionUser;
}

export interface GroupedReaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  users: ReactionUser[];
}

/**
 * Regroupe une liste plate de réactions par emoji, en conservant l'ordre
 * d'apparition des emojis (premier réagi = premier affiché) et la liste
 * ordonnée des utilisateurs.
 */
function groupReactions(
  reactions: ReactionWithUser[],
  currentUserId: string | undefined,
): GroupedReaction[] {
  const groups = new Map<string, GroupedReaction>();
  for (const r of reactions) {
    let g = groups.get(r.emoji);
    if (!g) {
      g = { emoji: r.emoji, count: 0, reactedByMe: false, users: [] };
      groups.set(r.emoji, g);
    }
    g.count += 1;
    g.users.push(r.user);
    if (currentUserId && r.userId === currentUserId) g.reactedByMe = true;
  }
  return Array.from(groups.values());
}

export const reactionRouter = router({
  /** Réactions d'une cible, groupées par emoji avec leurs auteurs. */
  getByTarget: publicProcedure
    .input(
      z.object({
        targetType: z.nativeEnum(ReactionTarget),
        targetId: z.number().int(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const reactions = await ctx.prisma.reaction.findMany({
        where: { targetType: input.targetType, targetId: input.targetId },
        orderBy: { createdAt: "asc" },
        include: { user: { select: userSelect } },
      });
      return groupReactions(reactions, ctx.sessionClient?.user?.id);
    }),

  /**
   * Variante batch : réactions de plusieurs cibles d'un même type (ex.
   * tous les commentaires d'un post), pour éviter le N+1. Renvoie un
   * dictionnaire `{ [targetId]: GroupedReaction[] }`.
   */
  getByTargets: publicProcedure
    .input(
      z.object({
        targetType: z.nativeEnum(ReactionTarget),
        targetIds: z.array(z.number().int()).max(500),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result: Record<number, GroupedReaction[]> = {};
      for (const id of input.targetIds) result[id] = [];
      if (input.targetIds.length === 0) return result;

      const reactions = await ctx.prisma.reaction.findMany({
        where: {
          targetType: input.targetType,
          targetId: { in: input.targetIds },
        },
        orderBy: { createdAt: "asc" },
        include: { user: { select: userSelect } },
      });

      const byTarget = new Map<number, ReactionWithUser[]>();
      for (const r of reactions) {
        if (!byTarget.has(r.targetId)) byTarget.set(r.targetId, []);
        byTarget.get(r.targetId)!.push(r);
      }
      const currentUserId = ctx.sessionClient?.user?.id;
      for (const [targetId, list] of byTarget) {
        result[targetId] = groupReactions(list, currentUserId);
      }
      return result;
    }),

  /**
   * Bascule la réaction (userId, target, emoji) : la crée si absente,
   * la retire si présente. Renvoie l'état final (`active`).
   */
  toggle: protectedProcedure
    .input(
      z.object({
        targetType: z.nativeEnum(ReactionTarget),
        targetId: z.number().int(),
        emoji: z.string().min(1).max(32),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;

      const existing = await ctx.prisma.reaction.findUnique({
        where: {
          userId_targetType_targetId_emoji: {
            userId,
            targetType: input.targetType,
            targetId: input.targetId,
            emoji: input.emoji,
          },
        },
        select: { id: true },
      });

      if (existing) {
        await ctx.prisma.reaction.delete({ where: { id: existing.id } });
        return { active: false };
      }

      await ctx.prisma.reaction.create({
        data: {
          userId,
          targetType: input.targetType,
          targetId: input.targetId,
          emoji: input.emoji,
        },
      });
      return { active: true };
    }),
});