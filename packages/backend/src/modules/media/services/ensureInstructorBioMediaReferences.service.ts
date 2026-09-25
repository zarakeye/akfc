import { Prisma, type PrismaClient } from "@prisma/client";

import { parsePageContentV1 } from "@contracts/page";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";

/**
 * Rattrape les liens média des bios d'instructeur (PageMediaReference,
 * pageType INSTRUCTOR_BIO).
 *
 * Sans ce lien, une image de la bibliothèque utilisée dans une bio n'est ni
 * protégée contre la suppression, ni servie aux visiteurs (les routes
 * publiques exigent un fichier publié ET référencé). L'enregistrement d'une
 * bio synchronise désormais ses liens (users.saveMyInstructorBio) ; ce
 * rattrapage couvre les bios enregistrées auparavant.
 *
 * Lancé au démarrage (instrumentation). Idempotent : syncPageMediaReferences
 * calcule un diff, un second passage ne change rien. Une bio en échec (par
 * exemple une image repassée « en attente ») est journalisée sans bloquer les
 * autres, ni le démarrage.
 */
export async function ensureInstructorBioMediaReferences(
  prisma: PrismaClient,
): Promise<{ synced: number; failed: number }> {
  const users = await prisma.user.findMany({
    where: { instructorBio: { not: Prisma.DbNull } },
    select: { id: true, instructorBio: true },
  });

  let synced = 0;
  let failed = 0;
  for (const u of users) {
    try {
      await prisma.$transaction((tx) =>
        syncPageMediaReferences(tx, {
          pageType: "INSTRUCTOR_BIO",
          pageId: u.id,
          newContent: parsePageContentV1(u.instructorBio),
        }),
      );
      synced += 1;
    } catch (err) {
      failed += 1;
      console.error(
        `[ensureInstructorBioMediaReferences] bio du membre ${u.id} non synchronisée :`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  return { synced, failed };
}
