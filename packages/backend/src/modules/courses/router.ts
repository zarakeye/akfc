import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";

import { pageContentSchemaV1 } from "@contracts/page";
import { hhmmSchema, END_AFTER_BEGIN_MESSAGE } from "@contracts/time/hhmm.schema";
import { COURSES_SEGMENT, categorySegment } from "@backend/modules/storage/storageSegments";
import { assertOwnAvatars } from "@backend/modules/media/services/assertOwnAvatars.service";

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
 *   - Lectures   : `publicProcedure` (les cours alimentent le site public). Un créneau n'est
 *                  public que si sa discipline l'est (`visibleTo`) : les créneaux d'une
 *                  discipline en brouillon ne sortent que pour un administrateur.
 *   - Écritures  : `protectedProcedure.use(isAdmin)`.
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

// Format HHMM (1830 = 18h30) : schéma partagé avec les séances, dans packages/contracts.
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
    message: END_AFTER_BEGIN_MESSAGE,
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
      message: END_AFTER_BEGIN_MESSAGE,
      path: ["endTime"],
    }
  );

/**
 * Créneaux visibles par l'appelant : tous pour un administrateur ; sinon ceux dont la discipline
 * est publiée (date renseignée et passée), la même règle que `discipline.*`.
 */
function visibleTo(ctx: { sessionClient: { user?: { isAdmin?: boolean } | null } | null }): Prisma.CourseWhereInput {
  if (ctx.sessionClient?.user?.isAdmin) return {};
  return { discipline: { publicationDate: { not: null, lte: new Date() } } };
}

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const courseRouter = router({
  /**
   * Liste tous les cours, triés par discipline puis jour puis heure.
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.course.findMany({
      where: visibleTo(ctx),
      orderBy: [
        { disciplineId: "asc" },
        { day: "asc" },
        { beginTime: "asc" },
      ],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findFirst({
        where: { id: input.id, ...visibleTo(ctx) },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Créneau introuvable.",
        });
      }

      return course;
    }),

  create: protectedProcedure
    .use(isAdmin)
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      assertOwnAvatars(ctx.sessionClient.user.id, input.content);
      // ─── Validations pré-transaction (lectures simples) ────────────────
      //
      // On fait ces lectures hors transaction pour ne pas tenir un lock
      // pendant le temps qu'elles prennent. Les inserts qui suivent sont
      // tous dans une transaction commune.

      const discipline = await ctx.prisma.discipline.findUnique({
        where: { id: input.disciplineId },
        select: {
          id: true,
          category: { select: { type: true, storageSegment: true } },
        },
      });
      if (!discipline) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Discipline introuvable (id=${input.disciplineId}).`,
        });
      }
      // La catégorie des cours se reconnaît à son segment de dossier, figé (`courses`), et non à
      // son libellé, que l'on peut renommer.
      if (categorySegment(discipline.category) !== COURSES_SEGMENT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `La discipline ${input.disciplineId} n’est pas dans la catégorie des cours.`,
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
            message: `Instructeur introuvable (id=${input.instructorId}).`,
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
                "Un créneau existe déjà pour cette discipline, ce jour, cette heure de début et ce public.",
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
    .use(isAdmin)
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      assertOwnAvatars(ctx.sessionClient.user.id, input.content);
      const { id, ...rest } = input;

      // ─── Horaires : la règle « fin après début » porte sur le résultat ──
      //
      // Le schéma ne la vérifie que si les deux heures sont fournies. Si une seule change, l'autre
      // est en base : on relit, et l'on vérifie la combinaison qui sera réellement enregistrée.
      if ((rest.beginTime === undefined) !== (rest.endTime === undefined)) {
        const current = await ctx.prisma.course.findUnique({
          where: { id },
          select: { beginTime: true, endTime: true },
        });
        if (!current) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Créneau introuvable." });
        }
        const begin = rest.beginTime ?? current.beginTime;
        const end = rest.endTime ?? current.endTime;
        if (end <= begin) {
          throw new TRPCError({ code: "BAD_REQUEST", message: END_AFTER_BEGIN_MESSAGE });
        }
      }

      // ─── Validation pré-transaction (instructeur) ──────────────────────

      if (rest.instructorId !== undefined && rest.instructorId !== null) {
        const instructor = await ctx.prisma.user.findUnique({
          where: { id: rest.instructorId },
          select: { id: true },
        });
        if (!instructor) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Instructeur introuvable (id=${rest.instructorId}).`,
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
                  "Un créneau existe déjà pour cette discipline, ce jour, cette heure de début et ce public.",
              });
            }
            if (err.code === "P2025") {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Créneau introuvable.",
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
    .use(isAdmin)
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
              message: "Créneau introuvable.",
            });
          }
          throw err;
        }
      });
    }),
});

export default courseRouter;
