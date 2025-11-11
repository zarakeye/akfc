import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { createSessionJWT, deleteSession, getUserFromSessionJWT } from "@/lib/session";
import bcrypt from "bcryptjs";

export const authRouter = router({
  // ✅ SIGNUP
  signup: publicProcedure
    .input(z.object({
      email: z.string().refine((value) => {
        // Your email validation logic here
        return /\S+@\S+\.\S+/.test(value);
      }, 'Invalid email format'),
      role: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new Error("User already exists");
      }

      const role = await  ctx.prisma.role.findUnique({
        where: { name: input.role },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      const password = crypto.randomUUID().slice(0, 12);
      const hash = await bcrypt.hash("password", 12);

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hash,
          roleId: role.id,
          memberSince: new Date(),
        },
      });

      await createSessionJWT(user.id);

      return {
        user,
        generatedPassword: password,
      };
    }),

  // TODO: Add forgot password
  // ✅ LOGIN
  login: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      
      if (!user) {
        throw new Error("This user does not exist");
      }

      const valid = await bcrypt.compare(input.password, user.password);

      if (!valid) {
        throw new Error("Password is incorrect");
      }

      await createSessionJWT(user.id);

      return {
        user,
      };
    }),

  // ✅ LOGOUT
  logout: protectedProcedure.mutation(async () => {
    await deleteSession();
    
    return {
      success: true,
    };
  }),

  // ✅ ME
  me: publicProcedure.query(async () => {
    return await getUserFromSessionJWT();
  }),
});