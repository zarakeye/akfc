import { TRPCError } from "@trpc/server";

import { verifyPassword } from "@backend/lib/auth/password";
import { createThrottle } from "@backend/lib/security/throttle";

/**
 * Vérification du mot de passe d'un membre DÉJÀ connecté (changer de mot de passe, confirmer un
 * consentement en ligne).
 *
 * La connexion limite ses tentatives (auth.service, loginThrottle) ; ces vérifications-là ne
 * limitaient rien. Une session volée (un ordinateur resté ouvert) permettait d'essayer des mots de
 * passe sans fin, pour le changer ou pour l'apprendre — un mot de passe resservant souvent ailleurs.
 * 5 essais faux par quart d'heure et par membre ; une réussite remet le compteur à zéro.
 */
const passwordCheckThrottle = createThrottle({ limit: 5, windowMs: 15 * 60 * 1000 });

export async function assertPasswordOfConnectedUser(params: {
  userId: string;
  password: string;
  hash: string;
  /** Message d'un mot de passe faux (BAD_REQUEST : le membre est connecté, c'est la saisie qui est fausse). */
  wrongMessage: string;
}): Promise<void> {
  const key = `user:${params.userId}`;
  if (passwordCheckThrottle.isLimited([key])) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Trop d'essais de mot de passe. Réessayez dans un quart d'heure.",
    });
  }
  if (!(await verifyPassword(params.password, params.hash))) {
    passwordCheckThrottle.record([key]);
    throw new TRPCError({ code: "BAD_REQUEST", message: params.wrongMessage });
  }
  passwordCheckThrottle.clear([key]);
}
