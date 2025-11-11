import { router, publicProcedure, protectedProcedure } from "@server/trpc";
import { z } from "zod";

export const permissionRouter = router({
   list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.permission.findMany({ orderBy: { id: "asc" } });
  }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // if (!ctx.user?.role?.permissions?.includes('manage_permissions')) {
      //   throw new Error('Forbidden');
      // }

      const exists = await ctx.prisma.permission.findUnique({
        where: { name: input.name },
      });

      if (exists) {
        throw new Error("Permission already exists");
      }

      return ctx.prisma.permission.create({
        data: {
          name: input.name,
        },
      });
    }),

  // rename / update
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.permission.findUnique({
        where: { name: input.name },
      });
      if (exists) throw new Error("A permission with that name already exists");

      return ctx.prisma.permission.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  // // suppression (empêche la suppression si liée à un rôle)
  // delete: protectedProcedure
  //   .input(z.object({ id: z.number() }))
  //   .mutation(async ({ ctx, input }) => {
  //     if (!ctx.user?.role?.permissions.includes("manage_permissions")) {
  //       throw new Error("Forbidden");
  //     }

  //     // si ton schéma utilise RolePermission (table de jointure)
  //     const linked = await ctx.prisma.rolePermission.count({
  //       where: { permissionId: input.id },
  //     });

  //     if (linked > 0) {
  //       throw new Error("Cannot delete permission that is assigned to roles");
  //     }

  //     return ctx.prisma.permission.delete({
  //       where: { id: input.id },
  //     });
  //   }),

  // // assigner une permission à un rôle (crée RolePermission)
  // assignToRole: protectedProcedure
  //   .input(z.object({ permissionId: z.number(), roleId: z.number() }))
  //   .mutation(async ({ ctx, input }) => {
  //     if (!ctx.user?.role?.permissions.includes("manage_permissions")) {
  //       throw new Error("Forbidden");
  //     }

  //     // upsert la relation (prévenir duplication)
  //     await ctx.prisma.rolePermission.upsert({
  //       where: {
  //         roleId_permissionId: { roleId: input.roleId, permissionId: input.permissionId },
  //       },
  //       update: {},
  //       create: {
  //         roleId: input.roleId,
  //         permissionId: input.permissionId,
  //       },
  //     });

  //     return { success: true };
  //   }),

  // // retirer une permission d'un rôle
  // removeFromRole: protectedProcedure
  //   .input(z.object({ permissionId: z.number(), roleId: z.number() }))
  //   .mutation(async ({ ctx, input }) => {
  //     if (!ctx.user?.role?.permissions.includes("manage_permissions")) {
  //       throw new Error("Forbidden");
  //     }

  //     await ctx.prisma.rolePermission.deleteMany({
  //       where: { roleId: input.roleId, permissionId: input.permissionId },
  //     });

  //     return { success: true };
  //   }),
});

export default permissionRouter;