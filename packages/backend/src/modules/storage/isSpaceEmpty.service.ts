import type { PrismaClient } from "@prisma/client";

import { r2ListByPrefix } from "@backend/modules/trash/services/r2TrashOps";

/**
 * Un dossier est-il VIDE au sens du finder ? Contrôle PHYSIQUE, volontairement
 * indépendant des lignes MediaAsset : le cycle corbeille ne les nettoie pas
 * (trashToBin/purge/deleteForever ne touchent pas MediaAsset), donc un test
 * basé dessus donnerait un faux « non vide » après un vidage pourtant réel.
 *
 * Vide ⇔ aucun objet R2 sous `path/`, ET aucun
 * sous-dossier au registre `Folder`. `path` = chemin du dossier, sans slash final.
 *
 * NB : layout plat des espaces de groupe → les espaces des groupes enfants sont
 * des dossiers frères (hors `path/`) et ne comptent donc pas.
 */
export async function isSpaceEmpty(params: {
  prisma: PrismaClient;
  appRoot: string;
  path: string;
}): Promise<boolean> {
  const { prisma, appRoot, path } = params;
  const prefix = `${path}/`;

  // 1) Un objet sous le préfixe ?
  if ((await r2ListByPrefix(prefix)).length > 0) return false;

  // 2) Registre : un sous-dossier ?
  const sub = await prisma.folder.findFirst({
    where: { appRoot, fullPath: { startsWith: prefix } },
    select: { id: true },
  });
  return sub === null;
}
