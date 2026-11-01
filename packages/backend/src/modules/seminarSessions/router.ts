import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { hhmmSchema, END_AFTER_BEGIN_MESSAGE } from "@contracts/time/hhmm.schema";
import { sessionDateSchema } from "@contracts/time/sessionDate.schema";

/**
 * seminarSessions/router.ts
 *
 * CRUD SeminarSession — une session concrète d'un Seminar (un jour, des horaires,
 * éventuellement un lieu). Un Seminar peut avoir plusieurs sessions si son
 * programme s'étale sur plusieurs journées.
 *
 * Unicité : `(seminarId, date, beginTime)`. Deux sessions du même seminar à
 * la même date et la même heure ne sont pas autorisées.
 *
 * Conventions :
 *   - Lectures   : `publicProcedure`, filtrées par `visibleTo` : les séances d'un
 *                  stage publié pour tous, toutes pour un administrateur.
 *   - Écritures  : `protectedProcedure.use(isAdmin)`.
 *                  On réutilise la permission du domaine Seminar — une session
 *                  n'est rien sans son seminar parent.
 *
 * Note cascade : la suppression d'un Seminar efface toutes ses sessions
 * automatiquement (onDelete: Cascade défini dans le schéma Prisma).
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

// Format HHMM (1830 = 18h30) : schéma partagé avec les créneaux, dans packages/contracts.
const beginTimeSchema = hhmmSchema;
const endTimeSchema = hhmmSchema;

const createInput = z
  .object({
    seminarId: z.number().int().positive(),
    date: sessionDateSchema, // jour pur, ramené à midi UTC
    beginTime: beginTimeSchema,
    endTime: endTimeSchema,
    location: z.string().trim().min(1).max(255).nullable().optional(),
    notes: z.string().trim().min(1).max(2000).nullable().optional(),
  })
  .refine((data) => data.endTime > data.beginTime, {
    message: END_AFTER_BEGIN_MESSAGE,
    path: ["endTime"],
  });

const updateInput = z
  .object({
    id: z.number().int().positive(),
    date: sessionDateSchema.optional(),
    beginTime: beginTimeSchema.optional(),
    endTime: endTimeSchema.optional(),
    location: z.string().trim().min(1).max(255).nullable().optional(),
    notes: z.string().trim().min(1).max(2000).nullable().optional(),
    // Note : `seminarId` volontairement absent — non modifiable.
    // Une session orpheline n'a pas de sens ; pour changer de seminar, on
    // supprime et on recrée.
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

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

/**
 * Séances visibles par l'appelant : toutes pour un administrateur ; sinon celles d'un stage publié
 * (date de publication renseignée et passée), la même règle que la fiche du stage. Les dates et
 * lieux d'un brouillon ne sortent pas plus que le brouillon lui-même.
 */
function visibleTo(ctx: { sessionClient: { user?: { isAdmin?: boolean } | null } | null }): Prisma.SeminarSessionWhereInput {
  if (ctx.sessionClient?.user?.isAdmin) return {};
  return { seminar: { publicationDate: { not: null, lte: new Date() } } };
}

export const seminarSessionRouter = router({
  /**
   * Liste toutes les sessions d'un seminar donné, triées par date puis heure.
   */
  getAllBySeminar: publicProcedure
    .input(z.object({ seminarId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.seminarSession.findMany({
        where: { seminarId: input.seminarId, ...visibleTo(ctx) },
        orderBy: [{ date: "asc" }, { beginTime: "asc" }],
      });
    }),

  create: protectedProcedure
    .use(isAdmin)
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      // Vérifie que le seminar parent existe.
      const seminar = await ctx.prisma.seminar.findUnique({
        where: { id: input.seminarId },
        select: { id: true },
      });
      if (!seminar) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Stage introuvable (id=${input.seminarId}).`,
        });
      }

      try {
        return await ctx.prisma.seminarSession.create({
          data: {
            seminarId: input.seminarId,
            date: input.date,
            beginTime: input.beginTime,
            endTime: input.endTime,
            location: input.location ?? null,
            notes: input.notes ?? null,
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
              "Une séance existe déjà pour ce stage à cette date et à cette heure de début.",
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

      // « Fin après début » porte sur le résultat : si une seule des deux heures change, l'autre est
      // en base, et c'est la combinaison enregistrée qu'il faut vérifier.
      if ((rest.beginTime === undefined) !== (rest.endTime === undefined)) {
        const current = await ctx.prisma.seminarSession.findUnique({
          where: { id },
          select: { beginTime: true, endTime: true },
        });
        if (!current) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Séance introuvable." });
        }
        if ((rest.endTime ?? current.endTime) <= (rest.beginTime ?? current.beginTime)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: END_AFTER_BEGIN_MESSAGE });
        }
      }

      try {
        return await ctx.prisma.seminarSession.update({
          where: { id },
          data: rest,
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "Une séance existe déjà pour ce stage à cette date et à cette heure de début.",
            });
          }
          if (err.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Séance introuvable.",
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
      try {
        return await ctx.prisma.seminarSession.delete({
          where: { id: input.id },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Séance introuvable.",
          });
        }
        throw err;
      }
    }),
});

export default seminarSessionRouter;