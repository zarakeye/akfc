import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";
import { deleteSessionFromCookie } from "@backend/lib/session/session.server";
import { loginService } from "@backend/modules/auth/services/auth.service";
import {
  createPasswordResetToken,
  hashResetToken,
  RESET_TOKEN_COOLDOWN_MS,
  RESET_TOKEN_TTL_MS,
} from "@backend/modules/auth/services/passwordReset.service";
import { sendPasswordResetEmail } from "@backend/email/services/sendPasswordResetEmail";

import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { verifyPassword } from "@backend/lib/auth/password";
import { getToken, verifyJwt } from "@backend/lib/session/session.server";
import {
  changePasswordSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@contracts/auth/auth.schema";

/**
 * Connexion, déconnexion, session courante, mot de passe (changement, oubli, réinitialisation).
 * `getSession` est appelée en permanence par le front : elle répond à « qui suis-je, maintenant ? ».
 */
export const authRouter = router({
  login: publicProcedure
    // Même schéma que le formulaire de connexion (packages/contracts) : une seule règle, un seul message.
    .input(loginSchema)
    .mutation(async ({ input }) => {
      const { email, password } = input;

      try {
        await loginService(email, password);

        return {
          success: true as const,
        };
      } catch (error) {
        // Un mauvais identifiant fait partie du fonctionnement normal du formulaire : c'est un
        // résultat. Tout le reste (base injoignable, bug) est une vraie erreur : elle remonte,
        // est journalisée par la route /api/trpc, et le formulaire affiche son message générique.
        if (error instanceof TRPCError && error.message === "INVALID_CREDENTIALS") {
          return {
            success: false as const,
            error: "INVALID_CREDENTIALS" as const,
          };
        }
        throw error;
      }
    }),

  logout: protectedProcedure.mutation(async () => {
    await deleteSessionFromCookie();

    return {
      success: true,
    };
  }),

  /**
   * Changement de mot de passe (utilisateur connecté).
   * Vérifie le mot de passe actuel, refuse un nouveau identique, re-hash, et
   * DÉCONNECTE LES AUTRES APPAREILS (supprime leurs sessions ; garde la
   * courante via le sessionId du cookie).
   */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur introuvable" });
      }

      const ok = await verifyPassword(input.currentPassword, user.password);
      if (!ok) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Mot de passe actuel incorrect",
        });
      }

      const same = await verifyPassword(input.newPassword, user.password);
      if (same) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Le nouveau mot de passe doit être différent de l'actuel",
        });
      }

      const hashed = await bcrypt.hash(input.newPassword, 12);
      const payload = verifyJwt(await getToken());
      const currentSessionId = payload?.sessionId ?? null;

      await ctx.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { password: hashed },
        });
        await tx.session.deleteMany({
          where: {
            userId,
            ...(currentSessionId ? { NOT: { id: currentSessionId } } : {}),
          },
        });
      });

      return { success: true };
    }),

  getSession: publicProcedure.query(async ({ ctx }) => {
    return ctx.sessionClient;
  }),

  requestPasswordReset: publicProcedure
    .input(requestPasswordResetSchema)
    .mutation(async ({ input, ctx }) => {
      const email = input.email.trim().toLowerCase();

      const user = await ctx.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
      });

      if (!user) {
        return { ok: true as const };
      }

      const lastToken = await ctx.prisma.passwordResetToken.findFirst({
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

      await ctx.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
          requestIp: ctx.requestIp ?? null,
          userAgent: ctx.userAgent ?? null,
        },
      });

      try {
        await sendPasswordResetEmail({ toEmail: user.email, token });
      } catch (err) {
        // Jamais le jeton dans les journaux. Réponse identique en cas d'échec : sinon, une
        // erreur trahirait qu'un compte existe pour l'adresse saisie.
        console.error(
          "[auth] e-mail de réinitialisation non envoyé :",
          err instanceof Error ? err.message : err,
        );
      }

      return { ok: true as const };
    }),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const token = input.token.trim();
      const tokenHash = hashResetToken(token);

      const entry = await ctx.prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
          usedAt: true,
        },
      });

      if (!entry) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ce lien n'est pas valide. Demandez-en un nouveau avec « Mot de passe oublié »." });
      }

      if (entry.usedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ce lien a déjà servi. Connectez-vous, ou demandez-en un nouveau avec « Mot de passe oublié »." });
      }

      if (entry.expiresAt.getTime() < Date.now()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ce lien a expiré. Demandez-en un nouveau avec « Mot de passe oublié »." });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      await ctx.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: entry.userId },
          // `isFirstLogin` n'est pas touché : un nouveau membre qui vient de choisir son
          // mot de passe par le lien de bienvenue complète ensuite son profil.
          data: { password: hashedPassword },
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