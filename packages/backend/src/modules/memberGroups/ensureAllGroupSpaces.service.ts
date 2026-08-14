import type { PrismaClient } from "@prisma/client";

import { ensureGroupSpaceFolder } from "@backend/modules/memberGroups/ensureGroupSpaceFolder.service";

/**
 * Backfill : garantit la ligne `Folder` de l'espace de CHAQUE groupe
 * collaboratif (idempotent). Appelé au boot pour matérialiser les espaces des
 * groupes créés avant l'introduction du hook create/update.
 */
export async function ensureAllGroupSpaces(
  prisma: PrismaClient,
  appRoot: string,
): Promise<{ ensured: number }> {
  const groups = await prisma.memberGroup.findMany({
    where: { isCollaborative: true },
    select: { id: true },
  });

  for (const group of groups) {
    await ensureGroupSpaceFolder({ prisma, appRoot, groupId: group.id });
  }

  return { ensured: groups.length };
}
