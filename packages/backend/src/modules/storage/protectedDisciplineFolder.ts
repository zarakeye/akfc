import type { PrismaClient } from "@prisma/client";

import { categorySegment, disciplineSegment } from "@backend/modules/storage/storageSegments";

/**
 * Protège les dossiers adossés aux DISCIPLINES / CATÉGORIES. Contrairement aux
 * espaces de groupe/perso/avatars (préfixe fixe → regex), le chemin d'une
 * discipline dépend de segments enregistrés en base :
 *
 *   - conteneur de catégorie : `${appRoot}/<segment de catégorie>`
 *   - conteneur des nouvelles : `${appRoot}/<segment de catégorie>/new`
 *   - dossier de discipline   : `${appRoot}/<segment de catégorie>/<segment de discipline>`
 *
 * Les segments sont figés à la création (`storageSegment`, cf. storageSegments.ts) :
 * un renommage ne fait pas sortir un dossier de la protection. La détection
 * interroge donc la base. Un chemin PLUS PROFOND (contenu d'un dossier de
 * discipline) n'est PAS protégé — les fichiers restent supprimables.
 */
export async function isProtectedDisciplineFolderPath(
  prisma: PrismaClient,
  appRoot: string,
  path: string,
): Promise<boolean> {
  const prefix = `${appRoot}/`;
  if (!path.startsWith(prefix)) return false;
  const segs = path.slice(prefix.length).split("/");

  // Conteneur de catégorie : `${appRoot}/<segment>`
  if (segs.length === 1) {
    const cats = await prisma.category.findMany({ select: { type: true, storageSegment: true } });
    return cats.some((c) => categorySegment(c) === segs[0]);
  }

  // `${appRoot}/<cat>/<disc>` : dossier de discipline ou conteneur `new`
  if (segs.length === 2) {
    const [catSeg, second] = segs;
    const cat = (
      await prisma.category.findMany({ select: { id: true, type: true, storageSegment: true } })
    ).find((c) => categorySegment(c) === catSeg);
    if (!cat) return false;
    if (second === "new") return true;
    const discs = await prisma.discipline.findMany({
      where: { categoryId: cat.id },
      select: { id: true, name: true, storageSegment: true },
    });
    return discs.some((d) => disciplineSegment(d) === second);
  }

  // Plus profond = contenu d'un dossier de discipline → supprimable.
  return false;
}
