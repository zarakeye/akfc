import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure } from "../../trpc/core";
import { requirePermission } from "../../trpc/middleware";

export const permissionRouter = router({
  getAll: protectedProcedure
    .use(requirePermission("manage_permissions"))
    .query(async ({ ctx }) => {
      return ctx.prisma.permission.findMany({
        include: {
          roles: {
            include: { role: true },
          },
        },
        orderBy: { id: "asc" },
      });
    }),

  getById: protectedProcedure
    .use(requirePermission("manage_permissions"))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const permission = await ctx.prisma.permission.findUnique({
        where: { id: input.id },
      });

      if (!permission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Permission not found",
        });
      }

      return permission;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_permissions"))
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.permission.findUnique({
        where: { name: input.name },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Permission already exists",
        });
      }

      return ctx.prisma.permission.create({
        data: {
          name: input.name,
        },
      });
    }),

  update: protectedProcedure
    .use(requirePermission("manage_permissions"))
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.permission.findUnique({
        where: { name: input.name },
        select: { id: true },
      });

      if (exists && exists.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Another permission with that name already exists.",
        });
      }

      return ctx.prisma.permission.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_permissions"))
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const linked = await ctx.prisma.rolePermissions.count({
        where: { permissionId: input.id },
      });

      if (linked > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cannot delete a permission that is assigned to roles.",
        });
      }

      return ctx.prisma.permission.delete({
        where: { id: input.id },
      });
    }),

  assignToRole: protectedProcedure
    .use(requirePermission("manage_permissions"))
    .input(z.object({ permissionId: z.number(), roleId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.rolePermissions.upsert({
        where: {
          roleId_permissionId: {
            roleId: input.roleId,
            permissionId: input.permissionId,
          },
        },
        update: {},
        create: {
          roleId: input.roleId,
          permissionId: input.permissionId,
        },
      });

      return { success: true };
    }),

  removeFromRole: protectedProcedure
    .use(requirePermission("manage_permissions"))
    .input(z.object({ permissionId: z.number(), roleId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.rolePermissions.deleteMany({
        where: {
          roleId: input.roleId,
          permissionId: input.permissionId,
        },
      });

      return { success: true };
    }),
});

export default permissionRouter;