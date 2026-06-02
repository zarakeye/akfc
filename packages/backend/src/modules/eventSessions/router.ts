import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";

/**
 * eventSessions/router.ts
 *
 * CRUD EventSession — une séance concrète d'un Event. Un Event peut
 * comporter plusieurs sessions si son programme s'étale sur plusieurs
 * journées (conférence en deux soirées, week-end culturel, etc.).
 *
 * Cloné fidèlement sur `stageSession` :
 *   - Mêmes conventions d'unicité `(eventId, date, beginTime)`
 *   - `beginTime`/`endTime` en minutes depuis minuit (0-1439 / 0-1440),
 *     pas en HHMM — cohérent avec courses et stageSession
 *   - `onDelete: Cascade` côté schéma : supprimer un Event supprime ses
 *     sessions
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les sessions d'un event public
 *                  doivent être visibles).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_events"))`.
 *                  Réutilise la permission du domaine Event — une session
 *                  n'est rien sans son event parent.
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

/**
 * Même logique que les routers `course` et `stageSession` :
 * `beginTime` / `endTime` au format **HHMM** (1830 = 18h30, 905 = 9h05).
 * La `.refine()` rejette les minutes invalides (≥ 60).
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
    eventId: z.number().int().positive(),
    date: z.coerce.date(),
    beginTime: beginTimeSchema,
    endTime: endTimeSchema,
    location: z.string().trim().min(1).max(255).nullable().optional(),
    notes: z.string().trim().min(1).max(2000).nullable().optional(),
  })
  .refine((data) => data.endTime > data.beginTime, {
    message: "endTime must be strictly greater than beginTime.",
    path: ["endTime"],
  });

const updateInput = z
  .object({
    id: z.number().int().positive(),
    date: z.coerce.date().optional(),
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
      message: "endTime must be strictly greater than beginTime.",
      path: ["endTime"],
    },
  );

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const eventSessionRouter = router({
  /**
   * Liste toutes les sessions d'un event donné, triées par date puis heure.
   */
  getAllByEvent: publicProcedure
    .input(z.object({ eventId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.eventSession.findMany({
        where: { eventId: input.eventId },
        orderBy: [{ date: "asc" }, { beginTime: "asc" }],
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.prisma.eventSession.findUnique({
        where: { id: input.id },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event session not found.",
        });
      }

      return session;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_events"))
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
          message: `Event not found (id=${input.eventId}).`,
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
              "A session already exists for this event at this date and beginTime.",
          });
        }
        throw err;
      }
    }),

  update: protectedProcedure
    .use(requirePermission("manage_events"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;

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
                "A session already exists for this event at this date and beginTime.",
            });
          }
          if (err.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Event session not found.",
            });
          }
        }
        throw err;
      }
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_events"))
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
            message: "Event session not found.",
          });
        }
        throw err;
      }
    }),
});

export default eventSessionRouter;