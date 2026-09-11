import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

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
 *   - Lectures   : `publicProcedure` (les sessions d'un seminar public doivent
 *                  être visibles pour que le site public puisse les afficher).
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

/**
 * Même logique que dans le router `course` : `beginTime` / `endTime`
 * au format **HHMM** (1830 = 18h30, 905 = 9h05). La `.refine()` rejette
 * les minutes invalides (≥ 60).
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
    seminarId: z.number().int().positive(),
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
      message: "endTime must be strictly greater than beginTime.",
      path: ["endTime"],
    }
  );

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const seminarSessionRouter = router({
  /**
   * Liste toutes les sessions d'un seminar donné, triées par date puis heure.
   */
  getAllBySeminar: publicProcedure
    .input(z.object({ seminarId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.seminarSession.findMany({
        where: { seminarId: input.seminarId },
        orderBy: [{ date: "asc" }, { beginTime: "asc" }],
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.prisma.seminarSession.findUnique({
        where: { id: input.id },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Seminar session not found.",
        });
      }

      return session;
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
          message: `Seminar not found (id=${input.seminarId}).`,
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
              "A session already exists for this seminar at this date and beginTime.",
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
                "A session already exists for this seminar at this date and beginTime.",
            });
          }
          if (err.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Seminar session not found.",
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
            message: "Seminar session not found.",
          });
        }
        throw err;
      }
    }),
});

export default seminarSessionRouter;