import type { PrismaClient } from "@prisma/client";
import { physicalCandidates } from "@backend/modules/storage/logicalPath";

/**
 * Sujets des dépôts de l'utilisateur courant dans common_repository.
 *
 * Un conteneur est nommé `{slug(sujet)}_{personne}-{cuid}`. On extrait le sujet
 * en retirant `-{userId}` (fin), puis tout depuis le dernier `_` (le séparateur
 * avant `{personne}`). Robuste : ne dépend pas du recalcul de personSlug. Scopé
 * par `uploaderUserId` → l'utilisateur ne voit QUE ses propres dépôts.
 *
 * Le sujet renvoyé, repassé en `containerName`, produit le même chemin (slug
 * idempotent) → un nouveau dépôt retombe dans le dossier existant.
 */
export async function listMyCommonRepositoryContainers(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<{ subject: string }[]> {
  const { prisma, appRoot, userId } = params;

  const assets = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      uploaderUserId: userId,
      fullPath: { contains: "/common_repository/" },
    },
    select: { fullPath: true },
  });

  const prefixes = physicalCandidates(`${appRoot}/common_repository`, appRoot).map(
    (candidate) => `${candidate}/`,
  );
  const tail = `-${userId}`;
  const subjects = new Set<string>();

  for (const { fullPath } of assets) {
    for (const prefix of prefixes) {
      if (!fullPath.startsWith(prefix)) continue;
      let seg = fullPath.slice(prefix.length).split("/")[0];
      if (seg.endsWith(tail)) {
        seg = seg.slice(0, seg.length - tail.length);
        const u = seg.lastIndexOf("_");
        const subject = u >= 0 ? seg.slice(0, u) : seg;
        if (subject) subjects.add(subject);
      }
      break;
    }
  }

  return [...subjects]
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((subject) => ({ subject }));
}
