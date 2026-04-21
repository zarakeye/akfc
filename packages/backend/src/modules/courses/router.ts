import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "../../trpc/core";
import { requirePermission } from "../../trpc/middleware";

export const courseRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.course.findMany({
      orderBy: { id: "asc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findUnique({
        where: { id: input.id },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return course;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_courses"))
    .input(
      z.object({
        label: z.string().min(1),
        content: z.json(),
        beginTime: z.number(),
        endTime: z.number(),
        day: z.enum([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ]),
        requisites: z.array(z.string()),
        coachId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.course.findUnique({
        where: { label: input.label },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A course with this label already exists.",
        });
      }

      const createData = {
        label: input.label,
        content: input.content === null ? Prisma.JsonNull : input.content,
        beginTime: input.beginTime,
        endTime: input.endTime,
        day: input.day,
        requisites: input.requisites,
        coach: {
          connect: { id: input.coachId },
        },
      } satisfies Prisma.CourseCreateInput;

      return ctx.prisma.course.create({
        data: createData,
      });
    }),
});