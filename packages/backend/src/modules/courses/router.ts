import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";

import { pageContentSchemaV1 } from "@contracts/page";

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
 *
 * ─── Composite de page et intégrité référentielle ────────────────────────
 *
 * Le champ `content` n'est plus un `z.json()` opaque mais un
 * `pageContentSchemaV1` typé — la silhouette d'un composite de blocs
 * définie au sous-chantier 1. Toute mutation qui touche ce champ
 * (create, update avec content fourni, delete) s'exécute désormais dans
 * une transaction qui appelle `syncPageMediaReferences` pour maintenir
 * la table `PageMediaReference` à jour.
 *
 * Conséquences :
 *   - Si le composite référence un mediaId qui n'existe pas ou qui n'est
 *     pas en `published`, la mutation roll-back avec un BAD_REQUEST
 *     précis (cf. `syncPageMediaReferences`).
 *   - Si la mutation parente (course.create/update) plante pour une
 *     autre raison (P2002 par exemple), la sync ne s'exécute pas — c'est
 *     le contrat de la transaction.
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
 * `beginTime` / `endTime` au format **HHMM** — entier compact où les
 * deux derniers digits sont les minutes, les autres les heures.
 *   - 0    = 00:00
 *   - 905  = 09:05
 *   - 1830 = 18:30
 *   - 2359 = 23:59
 *
 * La `.refine()` rejette les valeurs structurellement invalides comme
 * `1860` (60 minutes inexistantes) que `max(2359)` laisserait passer.
 * Pas de timezone — heure locale du club.
 */
const hhmmSchema = z
  .number()
  .int()
  .min(0)
  .max(2359)
  .refine((v) => v % 100 < 60, {
    message: "Minutes part must be 0-59 (e.g. 1860 is not a valid time).",
  });

const beginTimeSchema = hhmmSchema;
const endTimeSchema = hhmmSchema;

const createInput = z
  .object({
    disciplineId: z.number().int().positive(),
    audience: audienceEnum,
    day: dayEnum,
    beginTime: beginTimeSchema,
    endTime: endTimeSchema,
    instructorId: z.string().trim().min(1).nullable().optional(),
    requisites: z.array(z.string().trim().min(1)).default([]),
    content: pageContentSchemaV1,
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
    content: pageContentSchemaV1.optional(),
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
      // ─── Validations pré-transaction (lectures simples) ────────────────
      //
      // On fait ces lectures hors transaction pour ne pas tenir un lock
      // pendant le temps qu'elles prennent. Les inserts qui suivent sont
      // tous dans une transaction commune.

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

      // ─── Transaction : create course + sync references ─────────────────

      return await ctx.prisma.$transaction(async (tx) => {
        let created;
        try {
          created = await tx.course.create({
            data: {
              disciplineId: input.disciplineId,
              audience: input.audience,
              day: input.day,
              beginTime: input.beginTime,
              endTime: input.endTime,
              instructorId: input.instructorId ?? null,
              requisites: input.requisites,
              content: input.content as Prisma.InputJsonValue,
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

        await syncPageMediaReferences(tx, {
          pageType: "COURSE",
          pageId: String(created.id),
          newContent: input.content,
        });

        return created;
      });
    }),

  update: protectedProcedure
    .use(requirePermission("manage_courses"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;

      // ─── Validation pré-transaction (instructeur) ──────────────────────

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

      // ─── Transaction : update course + sync references si content fourni

      return await ctx.prisma.$transaction(async (tx) => {
        let updated;
        try {
          const data: Prisma.CourseUncheckedUpdateInput = {
            audience: rest.audience,
            day: rest.day,
            beginTime: rest.beginTime,
            endTime: rest.endTime,
            instructorId: rest.instructorId,
            requisites: rest.requisites,
            content:
              rest.content === undefined
                ? undefined
                : (rest.content as Prisma.InputJsonValue),
          };

          updated = await tx.course.update({
            where: { id },
            data, // content undefined → Prisma ne touche pas au champ
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

        // La sync n'est appelée que si l'update a effectivement touché au
        // content. Si l'admin met juste à jour `audience` ou `requisites`,
        // les références médias n'ont pas changé.
        if (rest.content !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "COURSE",
            pageId: String(id),
            newContent: rest.content,
          });
        }

        return updated;
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_courses"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        // On nettoie les références AVANT le delete du Course, pour ne
        // pas laisser de rows orphelines dans `PageMediaReference` (qui
        // n'a pas de FK DB sur `pageId` — c'est l'application qui tient
        // l'intégrité côté référenceur, cf. PATCH-schema.md).
        await syncPageMediaReferences(tx, {
          pageType: "COURSE",
          pageId: String(input.id),
          newContent: null,
        });

        try {
          return await tx.course.delete({
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
      });
    }),
});

export default courseRouter;
