import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure } from "../../trpc/core";
import { requirePermission } from "../../trpc/middleware";

export const postRouter = router({
  create: protectedProcedure
    .use(requirePermission("manage_posts"))
    .input(
      z.object({
        title: z.string().min(1, "Veuillez fournir un titre"),
        content: z.string().min(1, "Veuillez fournir du contenu"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.sessionClient.user.id;

      return ctx.prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          authorId,
        },
      });
    }),

  getAll: protectedProcedure
    .use(requirePermission("view_posts"))
    .query(async ({ ctx }) => {
      return ctx.prisma.post.findMany({
        include: {
          author: true,
        },
      });
    }),

  getById: protectedProcedure
    .use(requirePermission("view_posts"))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: {
          author: true,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return post;
    }),

  getByTitle: protectedProcedure
    .use(requirePermission("view_posts"))
    .input(z.object({ title: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.post.findMany({
        where: {
          title: { contains: input.title, mode: "insensitive" },
        },
        include: {
          author: true,
        },
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_posts"))
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.post.delete({
        where: { id: input.id },
      });
    }),

  update: protectedProcedure
    .use(requirePermission("manage_posts"))
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1, "Veuillez fournir un titre"),
        content: z.string().min(1, "Veuillez fournir du contenu"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.post.update({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
        },
      });
    }),
});