import { router, protectedProcedure } from "@workspace/backend/trpc/core";
import { requirePermission, isAdmin } from "@workspace/backend/trpc/middleware";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

import type { UserProfile } from "@workspace/contracts/src/users/user-profile.types";
import { updateMeFormSchema } from "@workspace/contracts/schemas/forms/updateMeForm.schema";
import { updateUserRoleByIdSchema } from "@workspace/contracts/schemas/forms/updateUserRoleById.schema";

export const userRouter = router({
  getAll: protectedProcedure
    .use(requirePermission("manage_users"))
    .query(async ({ ctx }) => {
      return ctx.prisma.user.findMany({
        orderBy: { id: "asc" },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
    }),

  getById: protectedProcedure
    .use(requirePermission("manage_users"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  getByEmail: protectedProcedure
    .use(requirePermission("manage_users"))
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_users"))
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(12, "Le mot de passe doit avoir au moins 12 caractères"),
        roleId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const hash = await bcrypt.hash(input.password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hash,
          roleId: input.roleId,
        },
      });

      return {
        success: true,
        user,
      };
    }),

  updateProfile: protectedProcedure
    .input(updateMeFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;

      return ctx.prisma.user.update({
        where: { id: userId },
        data: {
          ...input,
          isFirstLogin: false,
        },
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_users"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.delete({
        where: { id: input.id },
      });
    }),

  getCurrentUserProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.sessionClient.user.id;

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          pseudo: true,
          avatar: true,
          aboutMe: true,
          phone: true,
          birthDate: true,
          isFirstLogin: true,
          role: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const userProfile = {
        ...user,
        birthDate: user.birthDate
          ? user.birthDate.toISOString().split("T")[0]
          : null,
      };

      return userProfile satisfies UserProfile;
    }),

  updateUserRoleById: protectedProcedure
    .use(requirePermission("manage_users"))
    .input(updateUserRoleByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.sessionClient.user.id;

      if (actorId === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot change your own role.",
        });
      }

      const role = await ctx.prisma.role.findUnique({
        where: { id: input.roleId },
        select: { id: true },
      });

      if (!role) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Role not found",
        });
      }

      const user = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { roleId: input.roleId },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      return user;
    }),

  getProfileById: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          pseudo: true,
          avatar: true,
          aboutMe: true,
          phone: true,
          birthDate: true,
          isFirstLogin: true,
          role: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const userProfile = {
        ...user,
        birthDate: user.birthDate
          ? user.birthDate.toISOString().split("T")[0]
          : null,
      };

      return userProfile satisfies UserProfile;
    }),
});