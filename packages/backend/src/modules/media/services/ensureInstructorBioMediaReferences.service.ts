import { Prisma, type PrismaClient } from "@prisma/client";

import { parsePageContentV1 } from "@contracts/page";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";
import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { splitBioMedia } from "@backend/modules/users/instructorBio.service";

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
 * Les règles de l'enregistrement valent ici aussi : la bio d'un membre qui n'est pas administrateur
 * ne déclare que les fichiers de SON espace personnel. Une bio écrite avant cette règle, qui en
 * montrerait d'autres, est signalée dans les journaux et ces fichiers ne sont pas déclarés (ils ne
 * sont donc pas servis au public) : on ne publie pas, au démarrage, ce que l'enregistrement
 * refuserait.
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
      const bio = parsePageContentV1(u.instructorBio);
      let newContent = bio;
      let extraMediaIds: string[] = [];
      if (!(await isAdminByGroup(prisma, u.id))) {
        const { ownIds, foreignIds, foreignAvatar } = await splitBioMedia(prisma, u.id, bio);
        if (foreignIds.length > 0 || foreignAvatar) {
          console.warn(
            `[ensureInstructorBioMediaReferences] la bio du membre ${u.id} montre ${foreignIds.length} fichier(s) hors de son espace${foreignAvatar ? " et l'avatar d'un autre membre" : ""} : non déclarés, à corriger dans la bio.`,
          );
          // Seuls ses propres fichiers sont déclarés : un contenu vide, et leurs identifiants à part.
          newContent = { version: 1, blocks: [] };
          extraMediaIds = ownIds;
        }
      }
      await prisma.$transaction((tx) =>
        syncPageMediaReferences(tx, {
          pageType: "INSTRUCTOR_BIO",
          pageId: u.id,
          newContent,
          extraMediaIds,
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
