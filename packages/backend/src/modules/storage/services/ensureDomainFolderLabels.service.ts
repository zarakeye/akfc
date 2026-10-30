import type { PrismaClient } from "@prisma/client";

import { categoryFolderPath, disciplineFolderPath, setFolderLabel } from "@backend/modules/storage/storageSegments";

/**
 * Pose/rafraîchit le libellé affiché des dossiers de CATÉGORIE et de DISCIPLINE.
 *
 * Le dossier physique suit un segment figé (`courses`, `tchoy-lee-fut`), alors que le nom
 * affiché peut changer (« Cours », « Tchoy Lee Fut »). Un FolderLabel par dossier fait afficher
 * au finder le nom actuel, sans aucun renommage physique. Forcé à chaque démarrage
 * (auto-cicatrisant), et posé aussi à chaque renommage (catégorie, discipline).
 */
export async function ensureDomainFolderLabels(
  prisma: PrismaClient,
  appRoot: string,
): Promise<{ ensured: number }> {
  const categories = await prisma.category.findMany({
    select: {
      type: true,
      storageSegment: true,
      disciplines: { select: { id: true, name: true, storageSegment: true } },
    },
  });
  let ensured = 0;
  for (const c of categories) {
    await setFolderLabel(prisma, categoryFolderPath(appRoot, c), c.type);
    ensured++;
    for (const d of c.disciplines) {
      await setFolderLabel(prisma, disciplineFolderPath(appRoot, c, d), d.name);
      ensured++;
    }
  }
  return { ensured };
}
