import type { PrismaClient } from "@prisma/client";
import { commonRepositoryContainerPath } from "@backend/modules/media/services/commonRepositoryContainerPath.service";

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
}): Promise<{ subject: string; label?: string }[]> {
  const { prisma, appRoot, userId } = params;

  const assets = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      uploaderUserId: userId,
      fullPath: { startsWith: `${appRoot}/common-repository/` },
    },
    select: { fullPath: true },
  });

  const prefix = `${appRoot}/common-repository/`;
  const tail = `-${userId}`;
  const subjects = new Set<string>();

  for (const { fullPath } of assets) {
    let seg = fullPath.slice(prefix.length).split("/")[0];
    if (!seg.endsWith(tail)) continue;
    seg = seg.slice(0, seg.length - tail.length);
    const u = seg.lastIndexOf("_");
    const subject = u >= 0 ? seg.slice(0, u) : seg;
    if (subject) subjects.add(subject);
  }

  const subjectList = [...subjects].sort((a, b) => a.localeCompare(b, "fr"));

  // Libellés humains (accentués), s'ils existent, joints par path conteneur.
  const withLabels = await Promise.all(
    subjectList.map(async (subject) => {
      const path = await commonRepositoryContainerPath({
        prisma,
        appRoot,
        userId,
        subject,
      });
      const row = await prisma.folderLabel.findUnique({
        where: { path },
        select: { displayName: true },
      });
      return { subject, label: row?.displayName };
    }),
  );
  return withLabels;
}
