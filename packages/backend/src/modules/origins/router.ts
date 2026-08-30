import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

/**
 * origins/router.ts
 *
 * CRUD Origin — racine culturelle d'une discipline, d'un stage ou
 * d'un événement (« Japon », « Okinawa », « Chine », « Philippines »).
 *
 * Introduit par la migration v2 pour remplacer l'ancien champ
 * `Discipline.origin: String?` libre. Une entité dédiée permet de :
 *   - Éliminer les doublons orthographiques (contrainte `@unique` sur
 *     `name` et `slug`)
 *   - Ajouter des métadonnées culturelles riches (région, période
 *     historique, drapeau)
 *   - Regrouper transversalement disciplines / stages / events
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les origines alimentent le site
 *                  public, comme les disciplines).
 *   - Écritures  : `protectedProcedure.use(isAdmin)`.
 *                  Pas de permission dédiée pour la v1 — les origines
 *                  sont logiquement liées au domaine de gestion des
 *                  disciplines. À séparer en `manage_origins` si besoin.
 *
 * Règles métier :
 *   - `delete` est un hard delete : avant suppression, vérification qu'aucune
 *     dépendance ne subsiste (Discipline, Stage, Event). Si oui, CONFLICT.
 *   - L'unicité `(name)` et `(slug)` est portée par le schéma. Une violation
 *     renvoie CONFLICT avec un message précisant le champ fautif.
 *
 * Pas de PageBuilder ici : `description` reste un `String?` simple.
 * Si on veut une page riche par origine plus tard, on migrera ce champ
 * en `Json` (comme on l'a fait pour Discipline).
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

// Slug : minuscules + chiffres + tirets uniquement, pas de tirets aux
// extrémités. Convention URL-safe stricte.
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      "Slug must be lowercase alphanumeric with single hyphens (no leading/trailing hyphen).",
  });

const createInput = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  description: z.string().trim().min(1).max(2000).nullable().optional(),
  country: z.string().trim().min(1).max(120).nullable().optional(),
  region: z.string().trim().min(1).max(120).nullable().optional(),
  flag: z.string().trim().min(1).max(16).nullable().optional(),
  historicalPeriod: z.string().trim().min(1).max(120).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

const updateInput = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(120).optional(),
  slug: slugSchema.optional(),
  description: z.string().trim().min(1).max(2000).nullable().optional(),
  country: z.string().trim().min(1).max(120).nullable().optional(),
  region: z.string().trim().min(1).max(120).nullable().optional(),
  flag: z.string().trim().min(1).max(16).nullable().optional(),
  historicalPeriod: z.string().trim().min(1).max(120).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

/* -------------------------------------------------------------------------- */
/*                          INTERNAL ERROR MAPPING                            */
/* -------------------------------------------------------------------------- */

/**
 * Mapping P2002 → message précisant le champ unique violé (name ou slug),
 * basé sur le `meta.target` de l'erreur Prisma. Fallback générique si la
 * meta n'est pas renseignée.
 */
function uniqueViolationMessage(err: Prisma.PrismaClientKnownRequestError): string {
  const target = err.meta?.target;
  if (Array.isArray(target)) {
    if (target.includes("name")) {
      return "An origin with this name already exists.";
    }
    if (target.includes("slug")) {
      return "An origin with this slug already exists.";
    }
  }
  return "An origin with this name or slug already exists.";
}

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const originRouter = router({
  /**
   * Liste toutes les origines, triées par sortOrder puis name.
   * Sert à peupler les sélecteurs dans les forms admin (DisciplineForm,
   * StageForm, EventForm) et la future page publique `/origines`.
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.origin.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const origin = await ctx.prisma.origin.findUnique({
        where: { id: input.id },
      });

      if (!origin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Origin not found.",
        });
      }

      return origin;
    }),

  /**
   * Lookup par slug — utile pour les futures pages publiques
   * `/origines/[slug]`.
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: slugSchema }))
    .query(async ({ ctx, input }) => {
      const origin = await ctx.prisma.origin.findUnique({
        where: { slug: input.slug },
      });

      if (!origin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Origin not found.",
        });
      }

      return origin;
    }),

  create: protectedProcedure
    .use(isAdmin)
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.origin.create({
          data: {
            name: input.name,
            slug: input.slug,
            description: input.description ?? null,
            country: input.country ?? null,
            region: input.region ?? null,
            flag: input.flag ?? null,
            historicalPeriod: input.historicalPeriod ?? null,
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
    .use(isAdmin)
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;

      try {
        return await ctx.prisma.origin.update({
          where: { id },
          data: rest,
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
              message: "Origin not found.",
            });
          }
        }
        throw err;
      }
    }),

  delete: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Pré-vérification des dépendances — on refuse plutôt que de
      // cascader. Une origine référencée par une discipline, un stage
      // ou un event ne peut pas être supprimée sans détacher d'abord
      // ces entités.
      const [disciplineCount, stageCount, eventCount] = await Promise.all([
        ctx.prisma.discipline.count({ where: { originId: input.id } }),
        ctx.prisma.stage.count({ where: { originId: input.id } }),
        ctx.prisma.event.count({ where: { originId: input.id } }),
      ]);

      const deps: string[] = [];
      if (disciplineCount > 0) deps.push(`${disciplineCount} discipline(s)`);
      if (stageCount > 0) deps.push(`${stageCount} stage(s)`);
      if (eventCount > 0) deps.push(`${eventCount} event(s)`);

      if (deps.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Cannot delete origin: ${deps.join(
            ", ",
          )} still reference it. Detach them first.`,
        });
      }

      try {
        return await ctx.prisma.origin.delete({
          where: { id: input.id },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Origin not found.",
          });
        }
        throw err;
      }
    }),
});

export default originRouter;