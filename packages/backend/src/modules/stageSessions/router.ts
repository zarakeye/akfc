import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";

/**
 * stageSessions/router.ts
 *
 * CRUD StageSession — une session concrète d'un Stage (un jour, des horaires,
 * éventuellement un lieu). Un Stage peut avoir plusieurs sessions si son
 * programme s'étale sur plusieurs journées.
 *
 * Unicité : `(stageId, date, beginTime)`. Deux sessions du même stage à
 * la même date et la même heure ne sont pas autorisées.
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les sessions d'un stage public doivent
 *                  être visibles pour que le site public puisse les afficher).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_stages"))`.
 *                  On réutilise la permission du domaine Stage — une session
 *                  n'est rien sans son stage parent.
 *
 * Note cascade : la suppression d'un Stage efface toutes ses sessions
 * automatiquement (onDelete: Cascade défini dans le schéma Prisma).
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

/**
 * Même logique que dans le router `course` : `beginTime`/`endTime` sont des
 * entiers représentant des minutes depuis minuit.
 */
const beginTimeSchema = z.number().int().min(0).max(1439);
const endTimeSchema = z.number().int().min(1).max(1440);

const createInput = z
  .object({
    stageId: z.number().int().positive(),
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
    // Note : `stageId` volontairement absent — non modifiable.
    // Une session orpheline n'a pas de sens ; pour changer de stage, on
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

export const stageSessionRouter = router({
  /**
   * Liste toutes les sessions d'un stage donné, triées par date puis heure.
   */
  getAllByStage: publicProcedure
    .input(z.object({ stageId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.stageSession.findMany({
        where: { stageId: input.stageId },
        orderBy: [{ date: "asc" }, { beginTime: "asc" }],
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.prisma.stageSession.findUnique({
        where: { id: input.id },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stage session not found.",
        });
      }

      return session;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      // Vérifie que le stage parent existe.
      const stage = await ctx.prisma.stage.findUnique({
        where: { id: input.stageId },
        select: { id: true },
      });
      if (!stage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Stage not found (id=${input.stageId}).`,
        });
      }

      try {
        return await ctx.prisma.stageSession.create({
          data: {
            stageId: input.stageId,
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
              "A session already exists for this stage at this date and beginTime.",
          });
        }
        throw err;
      }
    }),

  update: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;

      try {
        return await ctx.prisma.stageSession.update({
          where: { id },
          data: rest,
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "A session already exists for this stage at this date and beginTime.",
            });
          }
          if (err.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Stage session not found.",
            });
          }
        }
        throw err;
      }
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.stageSession.delete({
          where: { id: input.id },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Stage session not found.",
          });
        }
        throw err;
      }
    }),
});

export default stageSessionRouter;