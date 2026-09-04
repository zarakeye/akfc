import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

// Mêmes options que resolvePendingUploadFolder → le path colle à celui des uploads.
const SLUG_OPTIONS = { lower: true, strict: true } as const;

/**
 * Pose/rafraîchit le libellé d'affichage des dossiers de CATÉGORIE.
 *
 * Le path physique d'une catégorie est `${appRoot}/${slug(Category.type)}`
 * (ex. `cours`), mais son nom canonique est `Category.type` (« Cours »). On
 * pose un FolderLabel par catégorie → le finder affiche « Cours » au lieu de
 * « cours », sans renommage physique (qui échouerait sur la casse). Forcé à
 * chaque boot (auto-cicatrisant), comme les autres racines.
 */
export async function ensureCategoryFolderLabels(
  prisma: PrismaClient,
  appRoot: string,
): Promise<{ ensured: number }> {
  const categories = await prisma.category.findMany({ select: { type: true } });
  for (const c of categories) {
    const path = `${appRoot}/${slugify(c.type, SLUG_OPTIONS)}`;
    await prisma.folderLabel.upsert({
      where: { path },
      update: { displayName: c.type },
      create: { path, displayName: c.type },
    });
  }
  return { ensured: categories.length };
}
