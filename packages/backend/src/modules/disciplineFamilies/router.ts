import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";

import { slugSchema } from "@contracts/slug/slug.schema";

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
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_disciplines"))`.
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

const createInput = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  sortOrder: z.number().int().min(0).default(0),
});

const updateInput = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(120).optional(),
  slug: slugSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
});

/* -------------------------------------------------------------------------- */
/*                          INTERNAL ERROR MAPPING                            */
/* -------------------------------------------------------------------------- */

function uniqueViolationMessage(
  err: Prisma.PrismaClientKnownRequestError,
): string {
  const target = err.meta?.target;
  if (Array.isArray(target)) {
    if (target.includes("name")) {
      return "A discipline family with this name already exists.";
    }
    if (target.includes("slug")) {
      return "A discipline family with this slug already exists.";
    }
  }
  return "A discipline family with this name or slug already exists.";
}

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
          message: "Discipline family not found.",
        });
      }
      return family;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: slugSchema }))
    .query(async ({ ctx, input }) => {
      const family = await ctx.prisma.disciplineFamily.findUnique({
        where: { slug: input.slug },
      });
      if (!family) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Discipline family not found.",
        });
      }
      return family;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_disciplines"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.disciplineFamily.create({
          data: {
            name: input.name,
            slug: input.slug,
            sortOrder: input.sortOrder,
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: uniqueViolationMessage(err),
          });
        }
        throw err;
      }
    }),

  update: protectedProcedure
    .use(requirePermission("manage_disciplines"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      try {
        return await ctx.prisma.disciplineFamily.update({
          where: { id },
          data: {
            name: rest.name,
            slug: rest.slug,
            sortOrder: rest.sortOrder,
          },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: uniqueViolationMessage(err),
            });
          }
          if (err.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Discipline family not found.",
            });
          }
        }
        throw err;
      }
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_disciplines"))
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
          message: `Cannot delete family: ${disciplineCount} discipline(s) still reference it. Reassign or detach them first.`,
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
            message: "Discipline family not found.",
          });
        }
        throw err;
      }
    }),
});

export default disciplineFamilyRouter;