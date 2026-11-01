import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { extractMediaIdsFromContent, type PageContentV1 } from "@contracts/page";
import { personalSpaceOwnerId } from "@backend/modules/memberGroups/assertCanTrashPaths.service";

/**
 * instructorBio.service.ts — les règles de la présentation d'instructeur.
 *
 * Une présentation est PUBLIQUE (page « Nos instructeurs ») et écrite par le membre lui-même. Les
 * fichiers qu'elle référence deviennent servis à tout visiteur (route publique : validé ET
 * référencé). D'où deux questions, posées à l'enregistrement (`users.saveMyInstructorBio`) et au
 * rattrapage du démarrage (`ensureInstructorBioMediaReferences`).
 */

/**
 * Titulaire = rattaché à une discipline, un cours ou un stage. Le MÊME critère que
 * `getInstructors` et la page publique des instructeurs.
 */
export async function isInstructorUser(prisma: PrismaClient, userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      _count: {
        select: {
          disciplinesAsInstructor: true,
          coursesAsInstructor: true,
          seminarsAsPrimaryAnimator: true,
          seminarsAsAnimator: true,
        },
      },
    },
  });
  const c = user?._count;
  return Boolean(
    c && (c.disciplinesAsInstructor > 0 || c.coursesAsInstructor > 0 || c.seminarsAsPrimaryAnimator > 0 || c.seminarsAsAnimator > 0),
  );
}

/**
 * Ce qu'une présentation montre, rangé en deux : ce qui appartient à son auteur, et le reste.
 *
 * Un membre qui n'est pas administrateur ne peut y poser que :
 *   - des fichiers de SON espace personnel (pas ceux d'un groupe, que ses autres membres n'ont pas
 *     choisi de rendre publics, ni ceux d'un autre membre) ;
 *   - SON avatar (pas celui d'un autre membre, peut-être mineur).
 */
export async function splitBioMedia(
  prisma: PrismaClient,
  userId: string,
  bio: PageContentV1,
): Promise<{ ownIds: string[]; foreignIds: string[]; foreignAvatar: boolean }> {
  const foreignAvatar = bio.blocks.some(
    (block) =>
      (block.type === "media-text" || block.type === "float-text") &&
      block.media?.kind === "avatar" &&
      block.media.userId !== userId,
  );
  const ids = extractMediaIdsFromContent(bio);
  if (ids.length === 0) return { ownIds: [], foreignIds: [], foreignAvatar };

  const assets = await prisma.mediaAsset.findMany({
    where: { id: { in: [...ids] } },
    select: { id: true, fullPath: true },
  });
  const ownerOf = new Map(assets.map((a) => [a.id, personalSpaceOwnerId(a.fullPath)]));
  return {
    ownIds: ids.filter((id) => ownerOf.get(id) === userId),
    foreignIds: ids.filter((id) => ownerOf.get(id) !== userId),
    foreignAvatar,
  };
}

/** Refuse une présentation qui montre autre chose que les fichiers et l'avatar de son auteur. */
export async function assertBioMediaAllowed(
  prisma: PrismaClient,
  userId: string,
  bio: PageContentV1,
): Promise<void> {
  const { foreignIds, foreignAvatar } = await splitBioMedia(prisma, userId, bio);
  if (foreignAvatar) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Une présentation ne peut montrer que votre propre avatar." });
  }
  if (foreignIds.length > 0) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Une présentation ne peut utiliser que des fichiers de votre espace personnel.",
    });
  }
}
