import type { PrismaClient } from "@prisma/client";

import { sendComingOfAgeNotice } from "#email/templates/comingOfAge.ts";
import { ageOn } from "@akfc/contracts/legal/imageConsent.ts";

/**
 * Passage à la majorité, chaque nuit (tâche de 3 h, avec les purges).
 *
 * Un membre MINEUR dont la date de naissance VÉRIFIÉE (club ou parent) atteint 18 ans devient
 * majeur : les coordonnées de son parent sont effacées (il n'a plus de rôle), une demande au parent
 * encore ouverte est supprimée, et le jeune reçoit un e-mail. Ses droits en vigueur (signés par le
 * parent) ne changent pas : ils restent valables jusqu'à ce qu'il confirme ou modifie les siens.
 *
 * Entre son anniversaire et la tâche de nuit, `effectiveLegalAge` le traite déjà en majeur.
 */
export async function promoteNewAdults(db: PrismaClient, now: Date = new Date()): Promise<number> {
  const minors = await db.user.findMany({
    where: { legalAge: "MINOR", birthDateVerified: true, birthDate: { not: null } },
    select: { id: true, email: true, firstName: true, birthDate: true, _count: { select: { imageConsentForms: true } } },
  });
  const adults = minors.filter((m) => m.birthDate && ageOn(m.birthDate, now) >= 18);
  for (const m of adults) {
    await db.$transaction([
      db.user.update({
        where: { id: m.id },
        data: { legalAge: "ADULT", guardianName: null, guardianEmail: null, guardianRelation: null, guardianPhone: null },
        select: { id: true },
      }),
      db.imageConsentRequest.deleteMany({ where: { userId: m.id } }),
    ]);
    await sendComingOfAgeNotice({
      to: m.email,
      firstName: m.firstName?.trim() || "",
      hadGuardianConsent: m._count.imageConsentForms > 0,
    }).catch((err) => console.error("[majorité] e-mail des 18 ans non envoyé :", err instanceof Error ? err.message : err));
  }
  return adults.length;
}
