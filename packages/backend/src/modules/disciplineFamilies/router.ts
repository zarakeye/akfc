import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";


/**
 * disciplineFamilies/router.ts
 *
 * CRUD DisciplineFamily — regroupement martial transverse des disciplines
 * (« Kung-fu », « Karaté », « Kali »). Sert d'axe de navigation dans le
 * menu public « Nos activités » (niveau intermédiaire entre le menu et la
 * discipline).
 *
 * Promu en entité (et non `Discipline.family: String?` libre) pour la même
 * raison qu'`Origin` : un axe de regroupement exposé au public ne doit pas
 * souffrir de doublons orthographiques. Modèle simple et stable :
 * `name`/`slug`/`sortOrder`.
 *
 * Conventions (calquées sur `origins`) :
 *   - Lectures   : `publicProcedure` (alimente le menu et les sélecteurs admin).
 *   - Écritures  : `protectedProcedure.use(isAdmin)`.
 *                  Pas de permission dédiée — les familles relèvent du domaine
 *                  de gestion des disciplines. À séparer en
 *                  `manage_discipline_families` si besoin un jour.
 *
 * Règles métier :
 *   - `delete` est un hard delete : refusé si des disciplines y sont encore
 *     rattachées (CONFLICT), plutôt que de casser leur `familyId`.
 *   - Unicité `(name)` et `(slug)` portée par le schéma ; P2002 → CONFLICT
 *     avec le champ fautif.
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                          INTERNAL ERROR MAPPING                            */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const disciplineFamilyRouter = router({
  /**
   * Liste toutes les familles, triées par sortOrder puis name.
   * Peuple le sélecteur `FamilySelect` (DisciplineForm) et le futur menu.
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.disciplineFamily.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const family = await ctx.prisma.disciplineFamily.findUnique({
        where: { id: input.id },
      });
      if (!family) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Famille de disciplines introuvable.",
        });
      }
      return family;
    }),

  delete: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Refus si des disciplines y sont encore rattachées — on ne casse
      // pas leur familyId par effet de bord.
      const disciplineCount = await ctx.prisma.discipline.count({
        where: { familyId: input.id },
      });
      if (disciplineCount > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Impossible de supprimer la famille : ${disciplineCount} discipline(s) y sont encore rattachées. Rattachez-les ailleurs ou détachez-les d’abord.`,
        });
      }

      try {
        return await ctx.prisma.disciplineFamily.delete({
          where: { id: input.id },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Famille de disciplines introuvable.",
          });
        }
        throw err;
      }
    }),
});

export default disciplineFamilyRouter;