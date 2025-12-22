import { router, publicProcedure, protectedProcedure } from "@/server/trpc/core";
import { COOKIE_NAME } from "@/lib/constants";
import { createContext } from "@/server/trpc";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { deleteSession } from "@/lib/session/session.server";

export const authRouter = router({
  // ✅ LOGOUT
  logout: publicProcedure.
    mutation(async () => {
      await deleteSession();
      
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