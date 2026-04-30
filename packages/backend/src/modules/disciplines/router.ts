import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

/**
 * discipline/router.ts
 *
 * CRUD Discipline (modèle 2-niveaux : Category → Discipline).
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les disciplines alimentent potentiellement
 *                  le site public, au même titre que les catégories).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_disciplines"))`.
 *                  La permission est à ajouter au seed.
 *
 * Règles métier :
 *   - `categoryId` N'EST PAS modifiable via `update`. Déplacer une discipline
 *     de catégorie briserait la cohérence des chemins Cloudinary existants
 *     (qui encodent `category.type` slugifié dans leurs segments).
 *   - `delete` est un hard delete : avant de supprimer, on vérifie qu'aucune
 *     dépendance ne subsiste (Course, Stage, MediaAsset). Si oui, CONFLICT.
 *   - L'unicité `(categoryId, name)` est portée par le schéma Prisma ; une
 *     violation renvoie une erreur CONFLICT explicite.
 */

const disciplineTypeEnum = z.enum(["MARTIAL_ART", "CALLIGRAPHY"]);

const createInput = z.object({
  name: z.string().trim().min(1).max(120),
  type: disciplineTypeEnum,
  family: z.string().trim().min(1).max(120).nullable().optional(),
  school: z.string().trim().min(1).max(120).nullable().optional(),
  classification: z.string().trim().min(1).max(120).nullable().optional(),
  origin: z.string().trim().min(1).max(120).nullable().optional(),
  description: z.string().trim().min(1).max(2000).nullable().optional(),
  categoryId: z.number().int().positive(),
  instructorId: z.string().trim().min(1),
});

const updateInput = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(120).optional(),
  type: disciplineTypeEnum.optional(),
  family: z.string().trim().min(1).max(120).nullable().optional(),
  school: z.string().trim().min(1).max(120).nullable().optional(),
  classification: z.string().trim().min(1).max(120).nullable().optional(),
  origin: z.string().trim().min(1).max(120).nullable().optional(),
  description: z.string().trim().min(1).max(2000).nullable().optional(),
  instructorId: z.string().trim().min(1).optional(),
  // Note : `categoryId` volontairement absent — non modifiable.
});

export const disciplineRouter = router({
  /**
   * Liste toutes les disciplines d'une catégorie donnée.
   * Usage typique : formulaire d'upload (sélecteur de discipline après choix
   * de catégorie).
   */
  getAllByCategory: publicProcedure
    .input(z.object({ categoryId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.discipline.findMany({
        where: { categoryId: input.categoryId },
        orderBy: { name: "asc" },
      });
    }),

  /**
   * Liste toutes les disciplines toutes catégories confondues.
   * Utile pour les vues d'administration synthétiques.
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.discipline.findMany({
      orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const discipline = await ctx.prisma.discipline.findUnique({
        where: { id: input.id },
      });

      if (!discipline) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Discipline not found.",
        });
      }

      return discipline;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_disciplines"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      // Vérifie que la catégorie existe (la FK le ferait, mais le message est plus clair ici).
      const category = await ctx.prisma.category.findUnique({
        where: { id: input.categoryId },
        select: { id: true },
      });
      if (!category) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Category not found (id=${input.categoryId}).`,
        });
      }

      // Vérifie que l'instructeur existe.
      const instructor = await ctx.prisma.user.findUnique({
        where: { id: input.instructorId },
        select: { id: true },
      });
      if (!instructor) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Instructor not found (id=${input.instructorId}).`,
        });
      }

      try {
        return await ctx.prisma.discipline.create({
          data: {
            name: input.name,
            type: input.type,
            family: input.family ?? null,
            school: input.school ?? null,
            classification: input.classification ?? null,
            origin: input.origin ?? null,
            description: input.description ?? null,
            categoryId: input.categoryId,
            instructorId: input.instructorId,
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A discipline with this name already exists in this category.",
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

      // Si on change l'instructeur, on vérifie qu'il existe.
      if (rest.instructorId !== undefined) {
        const instructor = await ctx.prisma.user.findUnique({
          where: { id: rest.instructorId },
          select: { id: true },
        });
        if (!instructor) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Instructor not found (id=${rest.instructorId}).`,
          });
        }
      }

      try {
        return await ctx.prisma.discipline.update({
          where: { id },
          data: rest,
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "A discipline with this name already exists in this category.",
            });
          }
          if (err.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Discipline not found.",
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
      // Pré-vérification des dépendances — on refuse plutôt que de cascader.
      const [courseCount, stageCount, mediaAssetCount] = await Promise.all([
        ctx.prisma.course.count({ where: { disciplineId: input.id } }),
        ctx.prisma.stage.count({ where: { disciplineId: input.id } }),
        ctx.prisma.mediaAsset.count({ where: { disciplineId: input.id } }),
      ]);

      const deps: string[] = [];
      if (courseCount > 0) deps.push(`${courseCount} course(s)`);
      if (stageCount > 0) deps.push(`${stageCount} stage(s)`);
      if (mediaAssetCount > 0) deps.push(`${mediaAssetCount} media asset(s)`);

      if (deps.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Cannot delete discipline: ${deps.join(
            ", "
          )} still reference it. Migrate or delete them first.`,
        });
      }

      try {
        return await ctx.prisma.discipline.delete({
          where: { id: input.id },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Discipline not found.",
          });
        }
        throw err;
      }
    }),
});

export default disciplineRouter;