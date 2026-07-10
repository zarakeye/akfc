#!/bin/bash
# Chantier BreakingNews — B.2 : router tRPC + enregistrement.
# À lancer depuis la RACINE du monorepo : bash apply_b2_router.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

mkdir -p packages/backend/src/modules/breakingNews

echo "-> packages/backend/src/modules/breakingNews/router.ts"
echo "   NOUVEAU : router BreakingNews"
cat > 'packages/backend/src/modules/breakingNews/router.ts' << 'FILE_EOF'
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  router,
  protectedProcedure,
  publicProcedure,
} from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";

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
 *   - Tout le reste : `requirePermission("manage_breaking_news")`.
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
    .use(requirePermission("manage_breaking_news"))
    .query(async ({ ctx }) => {
      return ctx.prisma.breakingNews.findMany({
        orderBy: [
          { publicationDate: { sort: "desc", nulls: "first" } },
          { createdAt: "desc" },
        ],
      });
    }),

  getByIdAdmin: protectedProcedure
    .use(requirePermission("manage_breaking_news"))
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
    .use(requirePermission("manage_breaking_news"))
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
    .use(requirePermission("manage_breaking_news"))
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
    .use(requirePermission("manage_breaking_news"))
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
FILE_EOF

echo "-> packages/backend/src/modules/index.ts"
echo "   enregistrement dans appRouter"
cat > 'packages/backend/src/modules/index.ts' << 'FILE_EOF'
import { router } from "@backend/trpc/core";

import { authRouter } from "@backend/modules/auth/router";
import { userRouter } from "@backend/modules/users/router";
import { roleRouter } from "@backend/modules/roles/router";
import { sessionRouter } from "@backend/modules/session/router";
import { cloudinaryRouter } from "@backend/modules/cloudinary/router";
import { trashRouter } from "@backend/modules/trash/router";
import { permissionRouter } from "@backend/modules/permissions/router";
import { categoryRouter } from "@backend/modules/categories/router";
import { courseRouter } from "@backend/modules/courses/router";
import { disciplineRouter } from "@backend/modules/disciplines/router";
import { stageRouter } from "@backend/modules/stages/router";
import { stageSessionRouter } from "@backend/modules/stageSessions/router";
import { eventRouter } from "@backend/modules/events/router";
import { eventSessionRouter } from "@backend/modules/eventSessions/router";
import { postRouter } from "@backend/modules/posts/router";
import { storageRouter } from "@backend/modules/storage/router";
import { mediaRouter } from "@backend/modules/media/router";
import { originRouter } from "@backend/modules/origins/router";
import { commentRouter } from "@backend/modules/comments/router";
import { reactionRouter } from "@backend/modules/reactions/router";
import { pollRouter } from "@backend/modules/polls/router";
import { disciplineFamilyRouter } from "@backend/modules/disciplineFamilies/router";
import { galleryRouter } from "@backend/modules/galleries/router";
import { breakingNewsRouter } from "@backend/modules/breakingNews/router";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  role: roleRouter,
  session: sessionRouter,
  cloudinary: cloudinaryRouter,
  trash: trashRouter,
  permission: permissionRouter,
  category: categoryRouter,
  course: courseRouter,
  discipline: disciplineRouter,
  origin: originRouter,
  stage: stageRouter,
  stageSession: stageSessionRouter,
  event: eventRouter,
  eventSession: eventSessionRouter,
  post: postRouter,
  storage: storageRouter,
  media: mediaRouter,
  comment: commentRouter,
  reaction: reactionRouter,
  poll: pollRouter,
  disciplineFamily: disciplineFamilyRouter,
  gallery: galleryRouter,
  breakingNews: breakingNewsRouter,
});

export type AppRouter = typeof appRouter;
FILE_EOF

echo
echo "Validation :"
pnpm --filter backend typecheck && pnpm --filter web typecheck