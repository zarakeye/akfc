import type { PrismaClient } from "@prisma/client";

export type PersoImageCounts = {
  pending: number;
  published: number;
  total: number;
};

/**
 * Compte les images de l'espace perso d'un admin, ventilées par statut.
 *
 * Un asset perso est identifié par la conjonction :
 *   - `uploaderUserId = userId` : le dossier perso est dérivé de `ctx.user.id`
 *     à l'upload, donc l'uploader est toujours le propriétaire du dossier ;
 *   - `fullPath` contient `/persos/` : distingue le perso du `general` et des
 *     disciplines. Le segment survit au move pending→published (qui ne change
 *     que le segment de statut, `segment[1]`) ;
 *   - `resourceType = "image"` : le quota ne porte que sur les images ;
 *   - `status ∈ {pending, published}` : la corbeille (`bin`) ne compte pas.
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
      resourceType: "image",
      status: { in: ["pending", "published"] },
      fullPath: { contains: "/personal-spaces/" },
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
