import { router, publicProcedure, protectedProcedure } from "@workspace/backend/trpc/core";
import { deleteSessionFromCookie } from "@workspace/backend/lib/session/session.server";
import { loginService } from "@workspace/backend/modules/auth/services/auth.service";
import {
  createPasswordResetToken,
  hashResetToken,
  RESET_TOKEN_COOLDOWN_MS,
  RESET_TOKEN_TTL_MS,
} from "@workspace/backend/modules/auth/services/passwordReset.service";
import { sendPasswordResetEmail } from "@workspace/backend/email/services/sendPasswordResetEmail";
import { prisma } from "@workspace/backend/prisma";

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

/**
 * Router frontend-facing, permanently called by the client.
 * It answers to one question: "Who am I, now?"
 */
export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(12, "Le mot de passe doit avoir au moins 12 caractères"),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password } = input;

      try {
        await loginService(email, password);

        return {
          success: true as const,
        };
      } catch (error) {
        if (error instanceof TRPCError && error.message === "INVALID_CREDENTIALS") {
          return {
            success: false as const,
            error: "INVALID_CREDENTIALS" as const,
          };
        }

        return {
          success: false as const,
          error: "LOGIN_FAILED" as const,
        };
      }
    }),

  logout: protectedProcedure.mutation(async () => {
    await deleteSessionFromCookie();

    return {
      success: true,
    };
  }),

  getSession: publicProcedure.query(async ({ ctx }) => {
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

      if (!user) {
        return { ok: true as const };
      }

      const lastToken = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });

      if (lastToken) {
        const elapsed = Date.now() - lastToken.createdAt.getTime();
        if (elapsed < RESET_TOKEN_COOLDOWN_MS) {
          return { ok: true as const };
        }
      }

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

        await tx.session.deleteMany({
          where: { userId: entry.userId },
        });
      });

      return { ok: true as const };
    }),
});