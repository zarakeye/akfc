import { protectedProcedure, router } from "@/server/trpc/core";
import { requirePermission } from "./middleware";
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
    .use(requirePermission("manage_roles"))
    .input(z.object({ id: z.number(), name: z.string().min(1), description: z.string(), permissions: z.array(z.number().int().positive()).min(1, "Vous devez choisir au moins une permission"), }))
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findUnique({
        where: { id: input.id },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      return ctx.prisma.role.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          permissions: {
            set: input.permissions.map((id) => ({ permissionId: id })),
          },
        }
      })
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