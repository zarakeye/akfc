import type { PrismaClient } from "@prisma/client";

import { sendComingOfAgeNotice } from "#email/templates/comingOfAge.ts";
import { ageOn } from "@akfc/contracts/legal/imageConsent.ts";

/**
 * Un mineur devient MAJEUR : son parent n'a plus de rôle. Les coordonnées du parent sont effacées,
 * les demandes encore ouvertes au parent (droit à l'image, date de naissance) supprimées, et le
 * jeune reçoit un e-mail. Ses droits en vigueur (signés par le parent) ne changent pas : ils
 * restent valables jusqu'à ce qu'il confirme ou modifie les siens.
 *
 * `birthDate` : la date (vérifiée) qui le rend majeur, à enregistrer avec ; `clearBirthDate` :
 * passé majeur sans date (justificatif vu par un administrateur), la date connue est effacée.
 */
export async function makeAdult(
  db: PrismaClient,
  userId: string,
  opts: { birthDate?: Date; clearBirthDate?: boolean } = {},
): Promise<void> {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, _count: { select: { imageConsentForms: true } } },
  });
  if (!u) return;
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        legalAge: "ADULT",
        guardianName: null,
        guardianEmail: null,
        guardianRelation: null,
        guardianPhone: null,
        ...(opts.birthDate ? { birthDate: opts.birthDate, birthDateVerified: true } : {}),
        ...(opts.clearBirthDate ? { birthDate: null, birthDateVerified: false } : {}),
      },
      select: { id: true },
    }),
    db.imageConsentRequest.deleteMany({ where: { userId } }),
    db.birthDateRequest.deleteMany({ where: { userId } }),
  ]);
  await sendComingOfAgeNotice({
    to: u.email,
    firstName: u.firstName?.trim() || "",
    hadGuardianConsent: u._count.imageConsentForms > 0,
  }).catch((err) => console.error("[majorité] e-mail au jeune majeur non envoyé :", err instanceof Error ? err.message : err));
}

/**
 * Passage à la majorité, chaque nuit (tâche de 3 h, avec les purges) : un membre MINEUR dont la
 * date de naissance VÉRIFIÉE (club ou parent) atteint 18 ans devient majeur (`makeAdult`).
 * Entre son anniversaire et la tâche de nuit, `effectiveLegalAge` le traite déjà en majeur.
 */
export async function promoteNewAdults(db: PrismaClient, now: Date = new Date()): Promise<number> {
  const minors = await db.user.findMany({
    where: { legalAge: "MINOR", birthDateVerified: true, birthDate: { not: null } },
    select: { id: true, birthDate: true },
  });
  const adults = minors.filter((m) => m.birthDate && ageOn(m.birthDate, now) >= 18);
  for (const m of adults) await makeAdult(db, m.id);
  return adults.length;
}
