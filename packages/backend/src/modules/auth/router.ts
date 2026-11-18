import { router, publicProcedure, protectedProcedure } from "#trpc/core.ts";
import { deleteSessionFromCookie } from "#lib/session/session.server.ts";
import { loginService } from "#modules/auth/services/auth.service.ts";
import {
  requestPasswordReset,
  resetPassword,
  ResetLinkError,
} from "#modules/auth/services/passwordReset.service.ts";

import { changePassword } from "#modules/auth/services/passwordChange.service.ts";

import { TRPCError } from "@trpc/server";
import { getCurrentSessionId } from "#lib/session/session.server.ts";
import {
  changePasswordSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@akfc/contracts/auth/auth.schema.ts";

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
      // La logique est dans le service, partagé avec la server action du formulaire (page profil).
      await changePassword({
        userId: ctx.sessionClient.user.id,
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        currentSessionId: await getCurrentSessionId(),
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