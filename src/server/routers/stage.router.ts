import { protectedProcedure, router } from "@/server/trpc/core";
import { requirePermission } from "./middleware";
import { date, z } from "zod";

export const stageRouter = router({
  getAll: protectedProcedure
    .use(requirePermission("manage_stages"))
    .query(async ({ ctx }) => {
      return ctx.prisma.stage.findMany({ orderBy: { id: "asc" } });
    }),

  getById: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.stage.findUnique({
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(z.object({
      label: z.string().min(1),
      date: z.date(),
      description: z.json().nullable().optional(),
      beginTime: z.number(),
      endTime: z.number(),
      program: z.json(),
      animatorId: z.string(),
      createsAt: z.date(),
      updatedAt: z.date(),
      preRegistered: z.array(z.string()),  
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.stage.create({
        data: {
          label: input.label,
          date: input.date,
          description: input.description,
          beginTime: input.beginTime,
          endTime: input.endTime,
          program: input.program,
          animatorId: input.animatorId,
          preRegistered: input.preRegistered
        },
      });
    }),
});