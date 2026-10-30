import type { PrismaClient } from "@prisma/client";

/**
 * Liste les conteneurs existants sous `common-repository/`, dérivés des `fullPath` des MediaAsset
 * (en attente ou validés). Renvoie leurs segments, dédupliqués et triés — pour peupler le select
 * « dossier existant » de l'envoi vers le dépôt commun.
 */
export async function listCommonRepositoryFolders(params: {
  prisma: PrismaClient;
  appRoot: string;
}): Promise<string[]> {
  const { prisma, appRoot } = params;

  const assets = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      status: { in: ["pending", "published"] },
      fullPath: { startsWith: `${appRoot}/common-repository/` },
    },
    select: { fullPath: true },
  });

  const prefix = `${appRoot}/common-repository/`;
  const names = new Set<string>();
  for (const { fullPath } of assets) {
    const segment = fullPath.slice(prefix.length).split("/")[0];
    if (segment) names.add(segment);
  }

  return [...names].sort((a, b) => a.localeCompare(b, "fr"));
}
