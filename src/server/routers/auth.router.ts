import { router, publicProcedure, protectedProcedure } from "@/server/trpc/core";
import { deleteSessionFromCookie } from "../lib/session/session.server";
import { z } from "zod";
import { loginService } from "../services/auth.service";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { prisma } from "@server/prisma";
import { createPasswordResetToken, hashResetToken, RESET_TOKEN_COOLDOWN_MS, RESET_TOKEN_TTL_MS } from "../services/auth/passwordReset.service";
import { sendPasswordResetEmail } from "../services/email/sendPasswordResetEmail";

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

  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const email = input.email.trim().toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
      });

      // Anti-enumeration: on répond ok quoiqu'il arrive
      if (!user) {
        return { ok: true as const };
      }

      // Cooldown simple: pas plus d'1 token toutes les X ms
      const lastToken = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });

      if (lastToken) {
        const elapsed = Date.now() - lastToken.createdAt.getTime();
        if (elapsed < RESET_TOKEN_COOLDOWN_MS) {
          // Toujours ok pour éviter de leak le comportement
          return { ok: true as const };
        }
      }

      // Génère token brut (pour email) + hash (pour DB)
      const { token, tokenHash } = createPasswordResetToken();

      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
          requestIp: ctx.requestIp ?? null,
          userAgent: ctx.userAgent ?? null,
        },
      });

      await sendPasswordResetEmail({
        toEmail: user.email,
        token,
      });

      return { ok: true as const };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(10),
        newPassword: z.string().min(12, "Le mot de passe doit faire au moins 12 caractères"),
      })
    )
    .mutation(async ({ input }) => {
      const token = input.token.trim();
      const tokenHash = hashResetToken(token);

      const entry = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
          usedAt: true,
        },
      });

      if (!entry) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired token" });
      }

      if (entry.usedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Token already used" });
      }

      if (entry.expiresAt.getTime() < Date.now()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Token expired" });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      // Transaction: update password + mark token used + invalidate sessions
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: entry.userId },
          data: {
            password: hashedPassword,
            isFirstLogin: false,
          },
        });

        await tx.passwordResetToken.update({
          where: { id: entry.id },
          data: { usedAt: new Date() },
        });

        // Invalidation sessions globales
        await tx.session.deleteMany({
          where: { userId: entry.userId },
        });
      });

      return { ok: true as const };
    }),
});