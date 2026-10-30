import type { PageReferencerKind, PrismaClient } from "@prisma/client";

import { isEditorialPageKey } from "@contracts/page";

/**
 * publiclyPlaced.service.ts — un fichier peut-il être servi à un visiteur anonyme ?
 *
 * Il doit être validé, hors corbeille, ET placé dans quelque chose de PUBLIC : une galerie
 * publique, ou un contenu PUBLIÉ. Un recensement (`PageMediaReference`) ne suffit pas : un
 * brouillon recense ses fichiers dès son premier enregistrement, et ses fichiers étaient alors
 * servis au public par leur URL. Les brouillons ne sont visibles que des administrateurs (qui les
 * voient par la route privée), leurs fichiers aussi.
 *
 * « Publié » selon le contenu :
 *   - discipline, stage, événement, actualité : une date de publication passée ;
 *   - cours : sa discipline est publiée (un cours n'a pas de date à lui) ;
 *   - page éditoriale (association, contacts, inscription) : son interrupteur (PageVisibility,
 *     clé = slug) est activé ; une autre page de contenu (`/infos/…`, pages légales) n'a pas
 *     d'interrupteur, elle est publique ;
 *   - présentation d'instructeur : publiée dès qu'elle existe (sa page liste les titulaires).
 */

type Ref = { pageType: PageReferencerKind; pageId: string };

const live = (now: Date) => ({ publicationDate: { not: null, lte: now } });

async function isRefLive(prisma: PrismaClient, ref: Ref, now: Date): Promise<boolean> {
  const n = Number(ref.pageId);
  switch (ref.pageType) {
    case "DISCIPLINE":
      return Number.isInteger(n) && (await prisma.discipline.count({ where: { id: n, ...live(now) } })) > 0;
    case "COURSE":
      return Number.isInteger(n) && (await prisma.course.count({ where: { id: n, discipline: live(now) } })) > 0;
    case "SEMINAR_DESCRIPTION":
    case "SEMINAR_PROGRAM":
    case "SEMINAR_SUMMARY":
      return Number.isInteger(n) && (await prisma.seminar.count({ where: { id: n, ...live(now) } })) > 0;
    case "EVENT":
    case "EVENT_SUMMARY":
      return Number.isInteger(n) && (await prisma.event.count({ where: { id: n, ...live(now) } })) > 0;
    case "POST":
      return Number.isInteger(n) && (await prisma.post.count({ where: { id: n, ...live(now) } })) > 0;
    case "SITE_PAGE":
      if (!isEditorialPageKey(ref.pageId)) return true;
      return (await prisma.pageVisibility.count({ where: { key: ref.pageId, published: true } })) > 0;
    case "INSTRUCTOR_BIO":
      return true;
    default: {
      const never: never = ref.pageType;
      return never;
    }
  }
}

/** Vrai si le fichier (déjà trouvé validé, hors corbeille) est placé dans du public. */
export async function isPubliclyPlaced(prisma: PrismaClient, mediaAssetId: string): Promise<boolean> {
  const inPublicGallery = await prisma.galleryItem.count({
    where: { mediaAssetId, gallery: { visibility: "PUBLIC" } },
  });
  if (inPublicGallery > 0) return true;

  const refs = await prisma.pageMediaReference.findMany({
    where: { mediaAssetId },
    select: { pageType: true, pageId: true },
  });
  const now = new Date();
  for (const ref of refs) {
    if (await isRefLive(prisma, ref, now)) return true;
  }
  return false;
}
