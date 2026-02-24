import { protectedProcedure, router } from "@/server/trpc/core";
import { isAdmin, requirePermission } from "./middleware";
import { z } from "zod";

export const roleRouter = router({
  getAll: protectedProcedure
    .use(requirePermission("manage_roles"))
    .query(async ({ ctx }) => {
      return ctx.prisma.role.findMany({ orderBy: { id: "asc" } });
    }),

  getById: protectedProcedure
    .use(requirePermission("manage_roles"))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findUnique({
        where: { id: input.id },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      return role;
    }),

  getByIdWithPermissions: protectedProcedure
    .use(requirePermission("manage_roles"))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.role.findUnique({
        where: { id: input.id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .use(requirePermission("manage_roles"))
    .input(z.object({
      name: z.string().min(1),
      permissionIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.role.findUnique({
        where: { name: input.name },
      });

      if (exists) {
        throw new Error("Role already exists");
      }

      return ctx.prisma.role.create({
        data: {
          name: input.name,
          permissions: input.permissionIds
            ? {
                create: input.permissionIds.map((id) => ({ permissionId: id }))
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
    .use(isAdmin)
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(1),
        permissions: z.array(z.number().int()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const roleId = input.id;

      return ctx.prisma.role.update({
        where: { id: roleId },
        data: {
          name: input.name,
          permissions: {
            // ✅ compound unique key
            set: input.permissions.map((permissionId) => ({
              roleId_permissionId: { roleId, permissionId },
            })),
          },
        },
        include: {
          permissions: { include: { permission: true } },
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
    })
});