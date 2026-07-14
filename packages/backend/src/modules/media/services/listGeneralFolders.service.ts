import type { PrismaClient } from "@prisma/client";

/**
 * Liste les sous-dossiers existants sous `general/` (statuts pending +
 * published), dérivés des `fullPath` des MediaAsset. Renvoie les slugs de
 * dossier, dédupliqués et triés — pour peupler le select « dossier existant »
 * de l'uploader général.
 *
 * Le segment survit au move pending→published (qui ne change que le segment de
 * statut), donc un dossier reste listé quel que soit l'état de ses contenus.
 */
export async function listGeneralFolders(params: {
  prisma: PrismaClient;
  appRoot: string;
}): Promise<string[]> {
  const { prisma, appRoot } = params;

  const assets = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      status: { in: ["pending", "published"] },
      fullPath: { contains: "/general/" },
    },
    select: { fullPath: true },
  });

  const prefixes = [
    `${appRoot}/pending/general/`,
    `${appRoot}/published/general/`,
  ];
  const names = new Set<string>();
  for (const { fullPath } of assets) {
    for (const prefix of prefixes) {
      if (fullPath.startsWith(prefix)) {
        const segment = fullPath.slice(prefix.length).split("/")[0];
        if (segment) names.add(segment);
        break;
      }
    }
  }

  return [...names].sort((a, b) => a.localeCompare(b, "fr"));
}
