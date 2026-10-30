import { TRPCError } from "@trpc/server";
import type { Prisma, PrismaClient } from "@prisma/client";

import { normalizePath } from "@backend/modules/trash/utils";
import { r2ListByPrefix } from "@backend/modules/trash/services/r2TrashOps";

/**
 * Lien entre la corbeille et les lignes `MediaAsset`.
 *
 * Mettre à la corbeille déplace les objets vers `bin/.trash/<id>/…` mais laisse la ligne
 * `MediaAsset` sur son chemin d'origine : la restauration replace le fichier exactement là, et
 * la ligne retrouve son objet (statut, nom, description intacts). Deux conséquences, traitées ici :
 *
 *   1. on ne jette pas un fichier encore UTILISÉ (posé dans une page, dans une galerie, ou publié
 *      aux membres) : le contenu afficherait un média cassé tant qu'il est dans la corbeille ;
 *   2. la suppression définitive doit effacer les lignes, sinon elles restent en base sans fichier.
 */

type TrashSource = { kind: "file" | "folder"; fullPath: string };

/** Lignes `MediaAsset` couvertes par un fichier ou un dossier (même matching que media.setStatus). */
function assetsWhere(appRoot: string, sources: readonly TrashSource[]): Prisma.MediaAssetWhereInput {
  const or: Prisma.MediaAssetWhereInput[] = [];
  for (const source of sources) {
    const p = normalizePath(source.fullPath);
    if (source.kind === "file") {
      or.push({ fullPath: p });
    } else {
      // Le `/` final évite qu'un dossier `cours` emporte `cours-avance`.
      or.push({ fullPath: { startsWith: `${p}/` } });
    }
  }
  return { appRoot, OR: or };
}

/**
 * Refuse la mise à la corbeille si un fichier concerné est encore utilisé. Le message nomme
 * chaque fichier et ce qui l'utilise, pour que l'administrateur sache quoi retirer d'abord.
 */
export async function assertTrashDoesntRemoveUsedAssets(
  prisma: PrismaClient,
  appRoot: string,
  sources: readonly TrashSource[],
): Promise<void> {
  if (sources.length === 0) return;

  const used = await prisma.mediaAsset.findMany({
    where: {
      AND: [
        assetsWhere(appRoot, sources),
        {
          OR: [
            { pageReferences: { some: {} } },
            { galleryItems: { some: {} } },
            { memberDocument: { isNot: null } },
          ],
        },
      ],
    },
    select: {
      fullPath: true,
      displayName: true,
      originalFileName: true,
      pageReferences: { select: { pageType: true, pageId: true } },
      galleryItems: { select: { gallery: { select: { title: true } } } },
      memberDocument: { select: { id: true } },
    },
    take: 20,
  });

  if (used.length === 0) return;

  const lines = used.map((asset) => {
    const uses = [
      ...asset.pageReferences.map((r) => `${String(r.pageType)} #${r.pageId}`),
      ...asset.galleryItems.map((g) => `galerie « ${g.gallery.title} »`),
      ...(asset.memberDocument ? ["documents des membres"] : []),
    ];
    const name = asset.displayName?.trim() || asset.originalFileName || asset.fullPath;
    return `  - ${name} → utilisé par : ${uses.join(", ")}`;
  });

  // CONFLICT : l'opération heurte l'état actuel (des contenus affichent ces fichiers). Une Error
  // nue deviendrait une erreur interne, au message masqué en production.
  throw new TRPCError({
    code: "CONFLICT",
    message:
      `Mise à la corbeille impossible : ${used.length} fichier(s) encore utilisé(s).\n` +
      `Retire-les d'abord des contenus qui les affichent, puis réessaie.\n` +
      lines.join("\n"),
  });
}

/**
 * Après une suppression définitive : efface les lignes `MediaAsset` restées sur le chemin
 * d'origine de l'élément. Une ligne n'est effacée que si AUCUN objet n'existe plus à son chemin :
 * un fichier redéposé au même endroit entre-temps a repris la ligne (upsert sur fullPath), et
 * celle-ci lui appartient désormais.
 */
export async function deleteAssetRowsOfTrashedItem(
  prisma: PrismaClient,
  appRoot: string,
  item: { kind: "file" | "folder"; previousPath: string },
): Promise<number> {
  const previous = normalizePath(item.previousPath);
  const rows = await prisma.mediaAsset.findMany({
    // Une ligne encore référencée par une page (RESTRICT) n'est jamais effacée ici.
    where: { AND: [assetsWhere(appRoot, [{ kind: item.kind, fullPath: previous }]), { pageReferences: { none: {} } }] },
    select: { id: true, fullPath: true },
  });
  if (rows.length === 0) return 0;

  const prefix = item.kind === "file" ? previous : `${previous}/`;
  const live = new Set((await r2ListByPrefix(prefix)).map((o) => o.key));
  const orphanIds = rows.filter((r) => !live.has(r.fullPath)).map((r) => r.id);
  if (orphanIds.length === 0) return 0;

  // Galerie et publication aux membres partent avec la ligne (CASCADE).
  const { count } = await prisma.mediaAsset.deleteMany({ where: { id: { in: orphanIds } } });
  return count;
}
