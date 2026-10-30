import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { hhmmSchema, END_AFTER_BEGIN_MESSAGE } from "@contracts/time/hhmm.schema";
import { sessionDateSchema } from "@contracts/time/sessionDate.schema";

/**
 * eventSessions/router.ts
 *
 * CRUD EventSession — une séance concrète d'un Event. Un Event peut
 * comporter plusieurs sessions si son programme s'étale sur plusieurs
 * journées (conférence en deux soirées, week-end culturel, etc.).
 *
 * Même structure que `seminarSession` :
 *   - unicité `(eventId, date, beginTime)` ;
 *   - `beginTime`/`endTime` au format HHMM (1830 = 18h30), comme les créneaux ;
 *   - `onDelete: Cascade` côté schéma : supprimer un Event supprime ses séances.
 *
 * Conventions :
 *   - Lectures   : `publicProcedure`, filtrées par `visibleTo` : les séances d'un
 *                  évènement publié pour tous, toutes pour un administrateur.
 *   - Écritures  : `protectedProcedure.use(isAdmin)`.
 *                  Réutilise la permission du domaine Event — une session
 *                  n'est rien sans son event parent.
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

// Format HHMM (1830 = 18h30) : schéma partagé avec les créneaux, dans packages/contracts.
const beginTimeSchema = hhmmSchema;
const endTimeSchema = hhmmSchema;

const createInput = z
  .object({
    eventId: z.number().int().positive(),
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
    // Note : `eventId` volontairement absent — non modifiable.
    // Une session orpheline n'a pas de sens ; pour changer d'event, on
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
    },
  );

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

/**
 * Séances visibles par l'appelant : toutes pour un administrateur ; sinon celles d'un évènement publié
 * (date de publication renseignée et passée), la même règle que la fiche du évènement. Les dates et
 * lieux d'un brouillon ne sortent pas plus que le brouillon lui-même.
 */
function visibleTo(ctx: { sessionClient: { user?: { isAdmin?: boolean } | null } | null }): Prisma.EventSessionWhereInput {
  if (ctx.sessionClient?.user?.isAdmin) return {};
  return { event: { publicationDate: { not: null, lte: new Date() } } };
}

export const eventSessionRouter = router({
  /**
   * Liste toutes les sessions d'un event donné, triées par date puis heure.
   */
  getAllByEvent: publicProcedure
    .input(z.object({ eventId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.eventSession.findMany({
        where: { eventId: input.eventId, ...visibleTo(ctx) },
        orderBy: [{ date: "asc" }, { beginTime: "asc" }],
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.prisma.eventSession.findFirst({
        where: { id: input.id, ...visibleTo(ctx) },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Séance introuvable.",
        });
      }

      return session;
    }),

  create: protectedProcedure
    .use(isAdmin)
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      // Vérifie que l'event parent existe.
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.eventId },
        select: { id: true },
      });
      if (!event) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Évènement introuvable (id=${input.eventId}).`,
        });
      }

      try {
        return await ctx.prisma.eventSession.create({
          data: {
            eventId: input.eventId,
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
              "Une séance existe déjà pour cet évènement à cette date et à cette heure de début.",
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
        const current = await ctx.prisma.eventSession.findUnique({
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
        return await ctx.prisma.eventSession.update({
          where: { id },
          data: rest,
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "Une séance existe déjà pour cet évènement à cette date et à cette heure de début.",
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
        return await ctx.prisma.eventSession.delete({
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

export default eventSessionRouter;