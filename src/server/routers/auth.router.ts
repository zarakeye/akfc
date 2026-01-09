import { router, publicProcedure, protectedProcedure } from "@/server/trpc/core";
import { COOKIE_NAME } from "@/lib/constants";
import { createContext } from "@/server/trpc";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { deleteSession } from "@/lib/session/session.server";
import { deleteSessionFromCookie } from "../lib/session/session.server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import { cookies } from "next/headers";
import { loginService } from "../services/auth.service";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24;
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Router frontend-facing, permanently called by the client.
 * It answers to an only one question: "Who am I, now?"
 */
export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(12, "Le mot de passe doit avoir au moins 12 caractères"),
    }))
    .mutation(async ({ input }) => {
      const { session, token } = await loginService(input.email, input.password);

      const cookieStore = await cookies();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      cookieStore.set({
        name: COOKIE_NAME,
        value: token, 
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      });

      return {
        success: true
      };
    }),

  // ✅ LOGOUT
  logout: publicProcedure.
    mutation(async () => {
      await deleteSessionFromCookie();

      return {
        success: true,
      };
    }
  ),

  // ✅ ME
  me: publicProcedure.query(async () => {
    const ctx = await createContext();
    return ctx.user;
  }),

  getSession: publicProcedure.query(async () => {
    const ctx = await createContext();
    
    if (!ctx.cookies) {
      return null;
    }

    const token = (await ctx.cookies)?.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const JWT_SECRET = process.env.JWT_SECRET;

    try {
      const payload = jwt.verify(token, JWT_SECRET!) as { sessionId: string; userId: string };
      
      const session = await prisma.session.findUnique({
        where: { id: payload.sessionId },
        include: { user: { include: { role: true } } },
      });

      if (!session || session.expiresAt < new Date()) return null;

      return session;
    } catch {
      return null;
    }
  })
});