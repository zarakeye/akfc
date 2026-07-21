import { router, protectedProcedure } from "@backend/trpc/core";
import { requirePermission, isAdmin } from "@backend/trpc/middleware";
import { z } from "zod";
import bcrypt from "bcryptjs";
import generateStrongPassword from "@backend/lib/security/generatePassword";
import sendPasswordEmail from "@backend/email/templates/welcomeEmailWithPassword";
import { TRPCError } from "@trpc/server";

import type { UserProfile } from "@contracts/users/user-profile.types";
import { updateMeFormSchema } from "@contracts/forms/updateMeForm.schema";
import { updateUserRoleByIdSchema } from "@contracts/forms/updateUserRoleById.schema";

export const userRouter = router({
  getAll: protectedProcedure
    .use(requirePermission("manage_users"))
    .query(async ({ ctx }) => {
      return ctx.prisma.user.findMany({
        orderBy: { id: "asc" },
        relationLoadStrategy: "join",
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
        relationLoadStrategy: "join",
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
        relationLoadStrategy: "join",
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
        roleId: z.number(),
      }),
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

      // Mot de passe généré côté serveur (jamais saisi par l'admin) puis
      // envoyé à l'utilisateur par email. isFirstLogin=true (défaut Prisma)
      // le forcera à le changer à la première connexion.
      const password = generateStrongPassword();
      const hash = await bcrypt.hash(password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hash,
          roleId: input.roleId,
        },
      });

      // Email de bienvenue avec le mot de passe temporaire. Un échec d'envoi
      // ne doit pas annuler la création — on le logue sans jeter.
      try {
        await sendPasswordEmail(
          input.email,
          `Bienvenue`,
          password,
        );
      } catch (err) {
        console.error("[user.create] envoi email de bienvenue échoué :", err);
      }

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

  getCurrentUserProfile: protectedProcedure.query(async ({ ctx }) => {
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
        relationLoadStrategy: "join",
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

  /**
   * Liste tous les users qui sont **factuellement** instructeurs — c'est-à-dire
   * qui ont au moins une relation d'animation dans le club : ils animent
   * une discipline, un cours, ou un stage (en tant qu'animateur principal
   * ou secondaire).
   *
   * Le club n'a pas de rôle "instructor" nominal en schéma ; cette
   * définition factuelle permet de peupler les sélecteurs des forms admin
   * (Course, Stage, etc.) sans dépendre d'un signal qui n'existe pas.
   *
   * Si un jour tu veux désigner un nouvel instructeur qui n'anime encore
   * rien, il faudra introduire un autre signal (rôle dédié ou flag
   * `isInstructor` sur User) — auquel cas cette query devra évoluer.
   *
   * Sélection minimale (id + nom) suffisante pour l'affichage en dropdown.
   * Tri par lastName puis firstName pour l'UX du select.
   */
  getInstructors: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        OR: [
          { disciplinesAsInstructor: { some: {} } },
          { coursesAsInstructor: { some: {} } },
          { stagesAsPrimaryAnimator: { some: {} } },
          { stagesAsAnimator: { some: {} } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pseudo: true,
        email: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }),

  /**
   * Liste tous les administrateurs (rôle ADMIN) avec leur avatar courant,
   * pour peupler le sélecteur d'avatar du bloc media-text (« utiliser
   * l'avatar de X »). Inclut les admins SANS avatar (avatar `null`) — l'UI
   * affichera un placeholder. `avatar` est un publicId Cloudinary brut ;
   * l'URL d'affichage est construite côté client comme pour l'avatar du
   * header.
   */
  listAvatarCandidates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: { role: { name: "ADMIN" } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pseudo: true,
        avatar: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }),
});
