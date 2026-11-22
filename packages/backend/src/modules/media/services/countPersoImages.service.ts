import type { PrismaClient } from "@prisma/client";

export type PersoImageCounts = {
  pending: number;
  published: number;
  total: number;
};

/**
 * Compte les images de l'espace personnel d'un membre, ventilées par statut.
 *
 * Une image de l'espace personnel est reconnue à trois conditions :
 *   - `uploaderUserId = userId` : le dossier personnel est dérivé de la session à l'envoi,
 *     donc l'auteur d'un envoi est toujours le propriétaire du dossier ;
 *   - `fullPath` contient `/personal-space/` : distingue l'espace personnel des autres
 *     destinations du même auteur ;
 *   - `mimeType image/*` : le quota ne porte que sur les images.
 * Un fichier mis à la corbeille quitte l'espace (son chemin change) et ne compte plus.
 *
 * Le quota se vérifie deux fois : à la signature (createR2Upload) et à l'enregistrement
 * (registerR2Upload), puisqu'il compte les fichiers enregistrés.
 */
export async function countPersoImages(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<PersoImageCounts> {
  const { prisma, appRoot, userId } = params;

  const grouped = await prisma.mediaAsset.groupBy({
    by: ["status"],
    where: {
      appRoot,
      uploaderUserId: userId,
      mimeType: { startsWith: "image/" },
      status: { in: ["pending", "published"] },
      fullPath: { contains: "/personal-space/" },
    },
    _count: true,
  });

  let pending = 0;
  let published = 0;
  for (const row of grouped) {
    if (row.status === "pending") {
      pending = row._count;
    } else if (row.status === "published") {
      published = row._count;
    }
  }

  return { pending, published, total: pending + published };
}
