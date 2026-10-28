import { TRPCError } from "@trpc/server";

import { prisma } from "@backend/prisma";
import { createSessionJWT } from "@backend/lib/session/session.server";
import { UNKNOWN_ACCOUNT_HASH, verifyPassword } from "@backend/lib/auth/password";
import { createThrottle } from "@backend/lib/security/throttle";

/**
 * Essais de mot de passe : 10 échecs par quart d'heure et par adresse. Au-delà, l'adresse est
 * refusée sans comparaison jusqu'à ce que la fenêtre glisse. La clé est l'adresse, pas l'adresse IP :
 * l'IP vient d'un en-tête qu'un client peut écrire lui-même, et tout un club peut partager la même.
 */
const loginThrottle = createThrottle({ limit: 10, windowMs: 15 * 60 * 1000 });

/**
 * Connexion : vérifie l'adresse et le mot de passe, puis ouvre une session (ligne en base, jeton
 * signé dans un cookie).
 *
 * Une adresse inconnue et un mauvais mot de passe produisent la même erreur, EN LE MÊME TEMPS :
 * sans compte, le mot de passe est quand même comparé, à une empreinte factice. Ni le message ni
 * la durée de la réponse ne disent si une adresse a un compte au club. La limite d'essais
 * s'applique de même à toute adresse, qu'elle ait un compte ou non.
 */
export async function loginService(email: string, password: string): Promise<void> {
  const key = `login:${email}`;
  if (loginThrottle.isLimited([key])) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "TOO_MANY_ATTEMPTS" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  });

  const valid = await verifyPassword(password, user?.password ?? UNKNOWN_ACCOUNT_HASH);
  if (!user || !valid) {
    loginThrottle.record([key]);
    throw new TRPCError({ code: "UNAUTHORIZED", message: "INVALID_CREDENTIALS" });
  }

  loginThrottle.clear([key]);
  await createSessionJWT(user.id);
}
