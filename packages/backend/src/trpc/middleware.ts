import { TRPCError } from "@trpc/server";
import { t } from "@backend/trpc/core";

export const isAdmin = t.middleware(({ ctx, next }) => {
  const user = ctx.sessionClient?.user;

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Connexion requise.",
    });
  }

  if (!user.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Action réservée aux administrateurs.",
    });
  }

  return next();
});
/**
 * Plusieurs procédures du stockage reçoivent encore `appRoot` dans leur entrée (héritage). La racine
 * de l'application n'est pas un choix du client : elle doit être celle du serveur. Sinon, les gardes
 * qui protègent la racine, la corbeille ou un préfixe (`${appRoot}/bin/.trash/…`) seraient calculées
 * sur une racine inventée. Sans effet pour une entrée qui ne porte pas `appRoot`.
 */
export const sameAppRoot = t.middleware(async ({ ctx, getRawInput, next }) => {
  const raw = await getRawInput();
  if (raw && typeof raw === "object" && "appRoot" in raw && raw.appRoot !== ctx.appRoot) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Racine d'application inconnue." });
  }
  return next();
});
