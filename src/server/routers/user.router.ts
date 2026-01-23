import { router, protectedProcedure } from "@server/trpc/core";
import { z } from "zod";
import { requirePermission, isAuthenticated, isAdmin } from "./middleware";
// import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { UserProfile } from "@/types/user-profile.types";
import { updateUserFormSchema } from "../schemas/updateUserForm.schema";

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
    // .use(requirePermission("manage_users"))
    // .input(
    //   z.object({
    //     page: z.number().default(1),
    //     pageSize: z.number().default(10),
    //     search: z.string().optional(),
    //   })
    // )
    // .query(async ({ ctx, input }) => {
    //   const { page, pageSize, search } = input;

    //   const where = search
    //     ? {
    //       OR: [
    //         { role: { is: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } } },
    //         { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
    //       ],
    //     }
    //     : {};

    //   const [users, total] = await Promise.all([
    //     ctx.prisma.user.findMany({
    //       where,
    //       skip: (page - 1) * pageSize,
    //       take: pageSize,
    //       orderBy: { id: "asc" },
    //       include: {
    //         role: {
    //           include: {
    //             permissions: {
    //               include: {
    //                 permission: true,
    //               },
    //             },
    //           },
    //         },
    //       }
    //     }),
    //     ctx.prisma.user.count({ where }),
    //   ]);

    //   return {
    //     users,
    //     total,
    //     page,
    //     pageSize,
    //     pageCount: Math.ceil(total / pageSize),
    //   };
    // }),

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

    getCurrrentUserProfile: protectedProcedure
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