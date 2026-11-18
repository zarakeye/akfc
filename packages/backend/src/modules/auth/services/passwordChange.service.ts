import { TRPCError } from "@trpc/server";

import { prisma } from "#prisma.ts";
import { hashPassword, verifyPassword } from "#lib/auth/password.ts";
import { assertPasswordOfConnectedUser } from "#lib/security/passwordCheck.ts";

/**
 * Les refus attendus d'un changement de mot de passe. Le formulaire les range sous le champ
 * concerné : il les reconnaît à leur texte, défini ici une seule fois.
 */
export const CHANGE_PASSWORD_MESSAGES = {
  wrongCurrent: "Mot de passe actuel incorrect.",
  sameAsCurrent: "Le nouveau mot de passe doit être différent de l'actuel.",
} as const;

/**
 * Changement de mot de passe d'un membre CONNECTÉ. Deux entrées l'appellent : la procédure
 * tRPC auth.changePassword (tests, future application mobile) et la server action du
 * formulaire de la page profil. Toutes deux passent l'identifiant du membre, lu dans sa session,
 * et celui de la session en cours, la seule à rester ouverte.
 */
export async function changePassword(params: {
  userId: string;
  currentPassword: string;
  newPassword: string;
  /** La session de l'appareil utilisé : elle reste ouverte, toutes les autres sont fermées. */
  currentSessionId: string | null;
}): Promise<void> {
  const { userId, currentPassword, newPassword, currentSessionId } = params;

  const user = await prisma.user.findUnique({
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
    password: currentPassword,
    hash: user.password,
    wrongMessage: CHANGE_PASSWORD_MESSAGES.wrongCurrent,
  });

  const same = await verifyPassword(newPassword, user.password);
  if (same) {
    throw new TRPCError({ code: "BAD_REQUEST", message: CHANGE_PASSWORD_MESSAGES.sameAsCurrent });
  }

  const hashed = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
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
}
