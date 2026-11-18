import crypto from "crypto";

import { prisma } from "#prisma.ts";
import { sendPasswordResetEmail } from "#email/services/sendPasswordResetEmail.ts";

/**
 * passwordReset.service.ts
 *
 * - token brut envoyé par email
 * - token hashé stocké en DB
 * - hash = sha256(token)
 */

export const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 min
export const RESET_TOKEN_COOLDOWN_MS = 1000 * 60 * 2; // 2 min

export function createPasswordResetToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString("hex"); // 64 chars
  const tokenHash = hashResetToken(token);
  return { token, tokenHash };
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
/**
 * « Mot de passe oublié » : crée un lien de réinitialisation et l'envoie par e-mail, si un compte
 * existe pour cette adresse. Le résultat est le même dans tous les cas (compte inconnu, demande
 * trop rapprochée, lien envoyé) : rien ne doit permettre de deviner qui a un compte au club.
 *
 * Appelée par la server action du formulaire (site web) et par la procédure tRPC
 * auth.requestPasswordReset (tests, future application mobile) : une seule logique, deux entrées.
 */
export async function requestPasswordReset(input: {
  email: string;
  requestIp: string | null;
  userAgent: string | null;
}): Promise<void> {
  // Déjà nettoyée et mise en minuscules par emailSchema, comme toutes les adresses enregistrées.
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true },
  });

  if (!user) {
    return;
  }

  const lastToken = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (lastToken) {
    const elapsed = Date.now() - lastToken.createdAt.getTime();
    if (elapsed < RESET_TOKEN_COOLDOWN_MS) {
      return;
    }
  }

  const { token, tokenHash } = createPasswordResetToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
      requestIp: input.requestIp,
      userAgent: input.userAgent,
    },
  });

  // L'envoi n'est PAS attendu : il prend plusieurs secondes, et une réponse lente pour une
  // adresse connue, rapide pour une inconnue, trahirait qui a un compte. Jamais le jeton dans
  // les journaux ; un échec d'envoi est journalisé, la réponse reste la même.
  void sendPasswordResetEmail({ toEmail: user.email, token }).catch((err: unknown) => {
    console.error(
      "[auth] e-mail de réinitialisation non envoyé :",
      err instanceof Error ? err.message : err,
    );
  });
}
