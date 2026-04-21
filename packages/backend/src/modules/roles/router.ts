import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../../trpc/core";
import { requirePermission } from "../../trpc/middleware";

export const roleRouter = router({
  getAll: protectedProcedure
    .use(requirePermission("manage_roles"))
    .query(async ({ ctx }) => {
      return ctx.prisma.role.findMany({
        orderBy: { id: "asc" },
      });
    }),

  getById: protectedProcedure
    .use(requirePermission("manage_roles"))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findUnique({
        where: { id: input.id },
      });

      if (!role) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Role not found",
        });
      }

      return role;
    }),

  getByIdWithPermissions: protectedProcedure
    .use(requirePermission("manage_roles"))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findUnique({
        where: { id: input.id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Role not found",
        });
      }

      return role;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_roles"))
    .input(
      z.object({
        name: z.string().min(1),
        permissionIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.role.findUnique({
        where: { name: input.name },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Role already exists",
        });
      }

      return ctx.prisma.role.create({
        data: {
          name: input.name,
          permissions: input.permissionIds
            ? {
                create: input.permissionIds.map((id) => ({
                  permissionId: id,
                })),
              }
            : undefined,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .use(requirePermission("manage_roles"))
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(1),
        permissions: z.array(z.number().int()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.role.findUnique({
        where: { name: input.name },
        select: { id: true },
      });

      if (exists && exists.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Another role with this name already exists.",
        });
      }

      const roleId = input.id;

      return ctx.prisma.role.update({
        where: { id: roleId },
        data: {
          name: input.name,
          permissions: {
            set: input.permissions.map((permissionId) => ({
              roleId_permissionId: { roleId, permissionId },
            })),
          },
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_roles"))
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.role.delete({
        where: { id: input.id },
      });
    }),
});