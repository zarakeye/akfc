import { router, publicProcedure, protectedProcedure } from "@/server/trpc/core";
import { deleteSessionFromCookie } from "../lib/session/session.server";
import { z } from "zod";
import { loginService } from "../services/auth.service";

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
      const { email, password } = input;
      try {
        await loginService(email, password);

        return {
          success: true,
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message || "Identifiants invalides !",
        };
      }
    }),

  // ✅ LOGOUT
  logout: protectedProcedure
    .mutation(async () => {
      await deleteSessionFromCookie();

      return {
        success: true,
      };
    }
  ),

  getSession: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.sessionClient;
    }),
});