import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

const HOME_ID = "home";

/**
 * Hero de la page d'accueil (titre + corps). Lecture publique (la page / le
 * consomme) ; écriture réservée aux administrateurs, comme sitePage.save et
 * siteStyle.save.
 */
export const homeHeroRouter = router({
  get: publicProcedure.query(({ ctx }) =>
    ctx.prisma.homeHero.findUnique({ where: { id: HOME_ID } }),
  ),

  save: protectedProcedure
    .use(isAdmin)
    .input(
      z.object({
        title: z.string().trim().min(1).max(120),
        body: z.string().trim().max(2000),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.homeHero.upsert({
        where: { id: HOME_ID },
        create: { id: HOME_ID, title: input.title, body: input.body },
        update: { title: input.title, body: input.body },
      }),
    ),
});
