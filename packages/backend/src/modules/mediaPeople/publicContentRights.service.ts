import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { extractMediaIdsFromContent, type PageContentV1 } from "@contracts/page";
import { refusedMediaIds } from "@backend/modules/mediaPeople/mediaPeople.service";

/**
 * Droit à l'image d'un contenu du constructeur de pages. Tous ces contenus (disciplines, cours,
 * stages, évènements, actualités, pages du site, présentation d'un instructeur) s'affichent sur le
 * site PUBLIC : un média dont une personne taguée a refusé le site public ne peut pas y entrer.
 *
 * Appelée à côté d'`assertOwnAvatars`, sur les contenus REÇUS. Comme pour les galeries, seul un
 * refus bloque : un média non tagué ou sans réponse passe (le site doit vivre pendant que les
 * autorisations se recueillent). Un média déjà en ligne qui passe au rouge est, lui, masqué à
 * l'affichage (`PageRenderer`).
 */
export async function assertPublicContentRights(
  prisma: PrismaClient,
  ...contents: readonly (PageContentV1 | null | undefined)[]
): Promise<void> {
  await assertPublicMediaRights(prisma, contents.flatMap((c) => (c ? extractMediaIdsFromContent(c) : [])));
}

/**
 * La même règle pour des médias isolés : l'image de résumé d'une discipline, d'un stage ou d'un
 * évènement (`summaryMediaId`), montrée sur les cartes de l'accueil et de l'agenda.
 */
export async function assertPublicMediaRights(
  prisma: PrismaClient,
  mediaIds: readonly (string | null | undefined)[],
): Promise<void> {
  const ids = [...new Set(mediaIds.filter((id): id is string => !!id))];
  const refused = await refusedMediaIds(prisma, ids, "PUBLIC_SITE");
  if (refused.size === 0) return;
  const files = await prisma.mediaAsset.findMany({
    where: { id: { in: [...refused] } },
    select: { originalFileName: true },
  });
  const names = files.map((f) => `« ${f.originalFileName} »`).join(", ");
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: `${files.length > 1 ? "Les images" : "L'image"} ${names} : une personne taguée a refusé « Site public ». Retire-${
      files.length > 1 ? "les" : "la"
    } du contenu avant d'enregistrer.`,
  });
}
