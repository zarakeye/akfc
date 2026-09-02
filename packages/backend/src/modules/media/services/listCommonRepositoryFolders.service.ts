import type { PrismaClient } from "@prisma/client";
import { physicalCandidates } from '@backend/modules/storage/logicalPath';

/**
 * Liste les sous-dossiers existants sous `general/` (statuts pending +
 * published), dérivés des `fullPath` des MediaAsset. Renvoie les slugs de
 * dossier, dédupliqués et triés — pour peupler le select « dossier existant »
 * de l'uploader général.
 *
 * Le segment survit au move pending→published (qui ne change que le segment de
 * statut), donc un dossier reste listé quel que soit l'état de ses contenus.
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
      fullPath: { contains: "/common_repository/" },
    },
    select: { fullPath: true },
  });

  // Les emplacements possibles d'un dossier `general/` ne se listent pas à la
  // main : `physicalCandidates` EST la règle du pliage, et elle rend les trois
  // — le plat, `pending/`, `published/`. Les deux premiers étaient codés en
  // dur ici ; le troisième, celui qui reçoit désormais les uploads, aurait
  // manqué, et le dossier aurait disparu du select sans un mot.
  const prefixes = physicalCandidates(`${appRoot}/common_repository`, appRoot).map(
    (candidate) => `${candidate}/`,
  );
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
