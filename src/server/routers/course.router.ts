import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "@server/trpc/core";
import { requirePermission } from "./middleware";

export const courseRouter = router({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.course.findMany({ orderBy: { id: "asc" } });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.course.findUnique({
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .use(requirePermission("manage_courses"))
    .input(z.object({
      label: z.string().min(1),
      content: z.json(),
      beginTime: z.number(),
      endTime: z.number(),
      day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
      requisites: z.array(z.string()),
      coachId: z.string(),
      createsAt: z.date(),
      updatedAt: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.course.findUnique({
        where: { label: input.label },
      });

      if (exists) {
        throw new Error("This course already exists. Please choose another label.");
      }

      return ctx.prisma.course.create({
        data: {
          label: input.label,
          content: input.content!,
          beginTime: input.beginTime,
          endTime: input.endTime,
          day: input.day,
          requisites: input.requisites,
          coachId: input.coachId,
          createdAt: input.createsAt,
          updatedAt: input.updatedAt,
        },
      });
    })

  
});

