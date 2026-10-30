import { z } from "zod";
import { Prisma } from "@prisma/client";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";

import { pageContentSchemaV1 } from "@contracts/page";
import { assertOwnAvatars } from "@backend/modules/media/services/assertOwnAvatars.service";

/**
 * Pages de contenu éditoriales du site.
 *
 * Un titre, un composite PageBuilder, une URL stable. « L'association » en
 * est la première ; « L'histoire du club », « Le règlement » ou « Nous
 * rejoindre » sont le même besoin et n'en coûteront pas davantage.
 *
 * Lecture PUBLIQUE : ces pages sont la vitrine du club. Écriture protégée.
 */

/**
 * Slug d'une page de contenu.
 *
 * Contraint parce qu'il sert de clé primaire ET de segment d'URL : un slug
 * libre laisserait entrer des caractères qui casseraient l'un ou l'autre.
 */
const sitePageSlug = z
  .string()
  .regex(/^[a-z][a-z0-9-]{0,40}$/, "Slug de page non conforme");

export const sitePageRouter = router({
  /** La page demandée, ou `null` si elle n'a jamais été rédigée. */
  get: publicProcedure
    .input(z.object({ slug: sitePageSlug }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.sitePage.findUnique({ where: { slug: input.slug } });
    }),

  /**
   * Crée ou remplace une page.
   *
   * Réservé aux administrateurs (`isAdmin`) : une page de contenu est
   * publique, la modifier revient à parler au nom du club.
   */
  save: protectedProcedure
    .use(isAdmin)
    .input(
      z.object({
        slug: sitePageSlug,
        title: z.string().trim().min(1).max(120),
        content: pageContentSchemaV1,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      assertOwnAvatars(ctx.sessionClient.user.id, input.content);
      return ctx.prisma.$transaction(async (tx) => {
        const saved = await tx.sitePage.upsert({
          where: { slug: input.slug },
          create: {
            slug: input.slug,
            title: input.title,
            content: input.content as Prisma.InputJsonValue,
          },
          update: {
            title: input.title,
            content: input.content as Prisma.InputJsonValue,
          },
        });

        // Sans cette synchronisation, les images d'une page de contenu ne
        // seraient rattachées à rien et passeraient pour orphelines — donc
        // éligibles au nettoyage. Le piège déjà rencontré sur le résumé de
        // discipline.
        await syncPageMediaReferences(tx, {
          pageType: "SITE_PAGE",
          pageId: input.slug,
          newContent: input.content,
        });

        return saved;
      });
    }),
});
