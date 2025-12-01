import { router, publicProcedure, protectedProcedure } from "@/server/trpc/core";
import { z } from "zod";
import { createSessionJWT, deleteSession } from "@/lib/session/session.server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";

export const authRouter = router({
  // TODO: Add forgot password
  // ✅ LOGIN
  login: publicProcedure
    .input(z.object({
      email: z.string().refine((value) => {
        // Regular expression to validate email format
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }, "Format d'email invalide"),
      password: z.string().min(12, "Le mot de passe doit avoir au moins 12 caractères"),
    }))
    .mutation(async ({ ctx, input }) => {
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
        throw new Error("This user does not exist");
      }

      const valid = await bcrypt.compare(input.password, user.password);

      if (!valid) {
        throw new Error("Password is incorrect");
      }

      // Generate session cookie
      await createSessionJWT(user);

      return {
        id: user.id,
        email: user.email,
        role: user.role?.name ?? null,
        permissions: user.role?.permissions.map(p => p.permission.name) ?? [],
      };
    }),

  // ✅ LOGOUT
  logout: protectedProcedure.mutation(async () => {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, '', { expires: new Date(0) });
    return {
      success: true,
    };
  }),

  // ✅ ME
  me: publicProcedure.query(async ({ ctx }) => {
    // return await getUserFromSessionJWT();
    return ctx.user;
  }),
});