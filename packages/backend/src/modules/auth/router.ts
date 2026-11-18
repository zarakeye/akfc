import { router, publicProcedure, protectedProcedure } from "#trpc/core.ts";
import { deleteSessionFromCookie } from "#lib/session/session.server.ts";
import { loginService } from "#modules/auth/services/auth.service.ts";
import {
  requestPasswordReset,
  resetPassword,
  ResetLinkError,
} from "#modules/auth/services/passwordReset.service.ts";

import { TRPCError } from "@trpc/server";
import { hashPassword, verifyPassword } from "#lib/auth/password.ts";
import { getToken, verifyJwt } from "#lib/session/session.server.ts";
import {
  changePasswordSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@akfc/contracts/auth/auth.schema.ts";
import { assertPasswordOfConnectedUser } from "#lib/security/passwordCheck.ts";

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
        // Trop d'échecs pour cette adresse : un résultat aussi, que le formulaire explique.
        if (error instanceof TRPCError && error.message === "TOO_MANY_ATTEMPTS") {
          return {
            success: false as const,
            error: "TOO_MANY_ATTEMPTS" as const,
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Membre introuvable." });
      }

      // BAD_REQUEST, pas UNAUTHORIZED : le membre EST connecté ; c'est la saisie qui est fausse.
      // UNAUTHORIZED signifie « aucune session », et un client pourrait le traiter comme une déconnexion.
      // Essais limités : une session volée ne permet pas d'essayer des mots de passe sans fin.
      await assertPasswordOfConnectedUser({
        userId,
        password: input.currentPassword,
        hash: user.password,
        wrongMessage: "Mot de passe actuel incorrect.",
      });

      const same = await verifyPassword(input.newPassword, user.password);
      if (same) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Le nouveau mot de passe doit être différent de l'actuel.",
        });
      }

      const hashed = await hashPassword(input.newPassword);
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
      await requestPasswordReset({
        email: input.email,
        requestIp: ctx.requestIp ?? null,
        userAgent: ctx.userAgent ?? null,
      });

      return { ok: true as const };
    }),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        await resetPassword({ token: input.token, newPassword: input.newPassword });
      } catch (err) {
        // Un lien inconnu, déjà utilisé ou expiré : un refus attendu, avec un message qui dit quoi faire.
        if (err instanceof ResetLinkError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: err.message });
        }
        throw err;
      }

      return { ok: true as const };
    }),
});