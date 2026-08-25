import type { PrismaClient } from "@prisma/client";

import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";
import { r2ListByPrefix } from "@backend/modules/trash/services/r2TrashOps";

/**
 * Un dossier est-il VIDE au sens du finder ? Contrôle PHYSIQUE, volontairement
 * indépendant des lignes MediaAsset : le cycle corbeille ne les nettoie pas
 * (trashToBin/purge/deleteForever ne touchent pas MediaAsset), donc un test
 * basé dessus donnerait un faux « non vide » après un vidage pourtant réel.
 *
 * Vide ⇔ aucun objet Cloudinary (image/video/raw) NI R2 sous `path/`, ET aucun
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

  // 1) Cloudinary : un asset sous le préfixe ? (existence : max_results 1)
  for (const rt of ["image", "video", "raw"] as const) {
    const res = await cloudinary.api.resources({
      type: "authenticated",
      resource_type: rt,
      prefix,
      max_results: 1,
    });
    if ((res.resources?.length ?? 0) > 0) return false;
  }

  // 2) R2 : un objet sous le préfixe ?
  if ((await r2ListByPrefix(prefix)).length > 0) return false;

  // 3) Registre : un sous-dossier ?
  const sub = await prisma.folder.findFirst({
    where: { appRoot, fullPath: { startsWith: prefix } },
    select: { id: true },
  });
  return sub === null;
}
