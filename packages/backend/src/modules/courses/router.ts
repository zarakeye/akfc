import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";

/**
 * courses/router.ts
 *
 * CRUD Course — une occurrence hebdomadaire d'une Discipline dans la catégorie
 * "Cours". Chaque ligne DB = un créneau (discipline, jour, heure, public) unique.
 *
 * Unicité naturelle : `(disciplineId, day, beginTime, audience)`. Deux cours
 * "Tchoy-Lee-Fut adultes" aux mêmes jour/heure ne peuvent pas coexister, mais
 * "Tchoy-Lee-Fut adultes mercredi 18h" et "Tchoy-Lee-Fut teenagers mercredi 18h"
 * sont deux cours légitimes.
 *
 * Champ `instructorId` optionnel : si null, le coach à afficher est
 * `discipline.instructor` (hérité). Permet de couvrir le cas des
 * remplacements ponctuels ou des co-enseignements.
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les cours alimentent le site public).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_courses"))`.
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

const dayEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const audienceEnum = z.enum([
  "KIDS",
  "TEENAGERS",
  "ADULTS",
  "ALL_AGES",
]);

/**
 * `beginTime` / `endTime` sont des entiers : minutes depuis minuit.
 * - 0 = 00:00, 1439 = 23:59, 1440 = 24:00 (borne sup exclusive pour begin,
 *   inclusive pour end pour couvrir un cours qui finit à minuit pile).
 */
const beginTimeSchema = z.number().int().min(0).max(1439);
const endTimeSchema = z.number().int().min(1).max(1440);

const createInput = z
  .object({
    disciplineId: z.number().int().positive(),
    audience: audienceEnum,
    day: dayEnum,
    beginTime: beginTimeSchema,
    endTime: endTimeSchema,
    instructorId: z.string().trim().min(1).nullable().optional(),
    requisites: z.array(z.string().trim().min(1)).default([]),
    content: z.json(),
  })
  .refine((data) => data.endTime > data.beginTime, {
    message: "endTime must be strictly greater than beginTime.",
    path: ["endTime"],
  });

const updateInput = z
  .object({
    id: z.number().int().positive(),
    audience: audienceEnum.optional(),
    day: dayEnum.optional(),
    beginTime: beginTimeSchema.optional(),
    endTime: endTimeSchema.optional(),
    instructorId: z.string().trim().min(1).nullable().optional(),
    requisites: z.array(z.string().trim().min(1)).optional(),
    content: z.json().optional(),
    // Note : `disciplineId` volontairement absent — non modifiable en update.
    // Changer de discipline reviendrait à recréer un cours (et à invalider
    // l'éventuelle unicité composée déjà établie).
  })
  .refine(
    (data) =>
      data.beginTime === undefined ||
      data.endTime === undefined ||
      data.endTime > data.beginTime,
    {
      message: "endTime must be strictly greater than beginTime.",
      path: ["endTime"],
    }
  );

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const courseRouter = router({
  /**
   * Liste tous les cours, triés par discipline puis jour puis heure.
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.course.findMany({
      orderBy: [
        { disciplineId: "asc" },
        { day: "asc" },
        { beginTime: "asc" },
      ],
    });
  }),

  /**
   * Liste les cours d'une discipline donnée.
   * Usage typique : page "Cours de Tchoy-Lee-Fut" sur le site public.
   */
  getAllByDiscipline: publicProcedure
    .input(z.object({ disciplineId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.course.findMany({
        where: { disciplineId: input.disciplineId },
        orderBy: [{ day: "asc" }, { beginTime: "asc" }],
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findUnique({
        where: { id: input.id },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found.",
        });
      }

      return course;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_courses"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      // Vérifie que la discipline existe ET qu'elle appartient à la catégorie "Cours".
      const discipline = await ctx.prisma.discipline.findUnique({
        where: { id: input.disciplineId },
        select: {
          id: true,
          category: { select: { type: true } },
        },
      });
      if (!discipline) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Discipline not found (id=${input.disciplineId}).`,
        });
      }
      if (discipline.category.type !== "Cours") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Discipline ${input.disciplineId} is not in the "Cours" category.`,
        });
      }

      // Si un instructeur est spécifié, on vérifie qu'il existe.
      if (input.instructorId) {
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
      }

      try {
        return await ctx.prisma.course.create({
          data: {
            disciplineId: input.disciplineId,
            audience: input.audience,
            day: input.day,
            beginTime: input.beginTime,
            endTime: input.endTime,
            instructorId: input.instructorId ?? null,
            requisites: input.requisites,
            content:
              input.content === null ? Prisma.JsonNull : input.content,
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
              "A course already exists at this discipline/day/beginTime/audience.",
          });
        }
        throw err;
      }
    }),

  update: protectedProcedure
    .use(requirePermission("manage_courses"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;

      // Si on change l'instructeur, on vérifie qu'il existe.
      if (rest.instructorId !== undefined && rest.instructorId !== null) {
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
        return await ctx.prisma.course.update({
          where: { id },
          data: {
            ...rest,
            content:
              rest.content === undefined
                ? undefined
                : rest.content === null
                ? Prisma.JsonNull
                : rest.content,
          },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "A course already exists at this discipline/day/beginTime/audience.",
            });
          }
          if (err.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Course not found.",
            });
          }
        }
        throw err;
      }
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_courses"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.course.delete({
          where: { id: input.id },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found.",
          });
        }
        throw err;
      }
    }),
});

export default courseRouter;