import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../../trpc/core";
import { requirePermission } from "../../trpc/middleware";

/**
 * stage.router.ts
 *
 * PROBLÈME:
 * - Prisma `Json` NON NULL n'accepte ni `undefined` ni `null`.
 * - `z.json()` renvoie un type `JSONType` qui inclut `null`.
 * - `.refine(v => v !== null)` valide au runtime, MAIS ne "narrow" pas le type TS de sortie.
 *   => TypeScript voit encore "program peut être null" => erreur Prisma.
 *
 * FIX:
 * - Utiliser `z.any()` + refine runtime + transform => sortie typée `Prisma.InputJsonValue`
 * - `description` optionnel côté API, mais NON NULL en DB => fallback `{}` (InputJsonValue)
 */

const prismaJsonNonNull = z
  .any()
  .refine((v) => v !== null && v !== undefined, {
    message: "JSON value cannot be null or undefined",
  })
  .transform((v) => v as Prisma.InputJsonValue);

const prismaJsonOptionalWithFallback = z
  .any()
  .optional()
  .transform((v) => (v ?? {}) as Prisma.InputJsonValue);

export const stageRouter = router({
  getAll: protectedProcedure
    .use(requirePermission("manage_stages"))
    .query(async ({ ctx }) => {
      return ctx.prisma.stage.findMany({
        orderBy: { id: "asc" },
      });
    }),

  getById: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const stage = await ctx.prisma.stage.findUnique({
        where: { id: input.id },
      });

      if (!stage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stage not found",
        });
      }

      return stage;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(
      z.object({
        label: z.string().min(1),
        date: z.coerce.date(),
        beginTime: z.number(),
        endTime: z.number(),
        program: prismaJsonNonNull,
        description: prismaJsonOptionalWithFallback,
        animatorId: z.string(),
        preRegistered: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.stage.create({
        data: {
          label: input.label,
          date: input.date,
          beginTime: input.beginTime,
          endTime: input.endTime,
          program: input.program,
          description: input.description,
          animatorId: input.animatorId,
          preRegistered: input.preRegistered,
        },
      });
    }),
});