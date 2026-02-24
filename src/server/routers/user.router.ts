import { router, protectedProcedure } from "@server/trpc/core";
import { z } from "zod";
import { requirePermission, isAuthenticated, isAdmin } from "./middleware";
// import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { UserProfile } from "@/types/user-profile.types";
import { updateUserFormSchema } from "../schemas/updateUserForm.schema";
import { updateUserRoleByIdSchema } from "../schemas/updateUserRoleById.schema";

export const userRouter = router({
  // ------------------------------------
  // Get all users
  // ------------------------------------
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

  // ------------------------------------
  // Get user by id
  // ------------------------------------
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
        }
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }),

  // ------------------------------------
  // Get user by email
  // ------------------------------------
  getByEmail: protectedProcedure
    .use(requirePermission("manage_users"))
    .input(z.object({ email: z.string() }))
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
        }
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }),

    // ------------------------------------
    // CREATE user (used by the form)
    // ------------------------------------
    create: protectedProcedure
      .use(requirePermission("manage_users"))
      .input(z.object({
        email: z.string().refine((value) => {
          // Regular expression to validate email format
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }, 'Invalid email format'),
        password: z.string().min(12, "Le mot de passe doit avoir au moins 12 caractères"),
        roleId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const exists = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        });

        if (exists) {
          throw new Error("User already exists");
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
          user
        };
      }),

    // ------------------------------------
    // UPDATE user by id
    // ------------------------------------
    updateProfile: protectedProcedure
      .use(isAuthenticated)
      .input(updateUserFormSchema)
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.user.update({
          where: { id: ctx.sessionClient!.user!.id },
          data: {
            ...input,
            isFirstLogin: false, // 🔒 règle métier
          },
        });
      }),

    // ------------------------------------
    // DELETE user by id
    // ------------------------------------
    delete: protectedProcedure
      .use(requirePermission("manage_users"))
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.user.delete({
          where: { id: input.id },
        });
      }),

    /**
     * Profil de l'utilisateur actuellement connecté.
     *
     * Règle:
     * - un user complète son profil lui-même (UpdateMe).
     * - l'admin ne gère pas le profil, uniquement des tâches d'administration.
     */
    getCurrentUserProfile: protectedProcedure
      .use(isAuthenticated)
      .query(async ({ ctx }) => {
        const userId = ctx.sessionClient!.user!.id;

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
            role: true
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
          });
        }

        const userProfile = {
          ...user,
          birthDate: user.birthDate
            ? user.birthDate.toISOString().split("T")[0]
            : null,
        }

        return userProfile satisfies UserProfile;
      }),

    /**
     * ✅ ADMIN: mettre à jour UNIQUEMENT le rôle d'un utilisateur.
     *
     * Pourquoi:
     * - c'est un point de contrôle sensible (RBAC)
     * - on le sépare volontairement des autres champs du profil
     * - l'utilisateur est responsable de compléter son profil (UpdateMe)
     *
     * Sécurité:
     * - permission "manage_users" requise
     * - vérifie que le role existe
     * - empêche par défaut de modifier SON PROPRE rôle (évite de se lock)
     */
    updateUserRoleById: protectedProcedure
      .use(requirePermission("manage_users"))
      .input(updateUserRoleByIdSchema)
      .mutation(async ({ ctx, input }) => {
        const actorId = ctx.sessionClient?.user?.id;
        if (!actorId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

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
            role: true
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
          });
        }

        const userProfile = {
          ...user,
          birthDate: user.birthDate
            ? user.birthDate.toISOString().split("T")[0]
            : null,
        }

        return userProfile satisfies UserProfile;
      }),
});