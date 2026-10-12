import type { PrismaClient } from "@prisma/client";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

import { getR2Bucket, getR2Client } from "@backend/modules/storage/adapters/r2/client";

/**
 * pruneEmptyFolders.service.ts
 *
 * Supprime du registre DB (`Folder`) les dossiers devenus vides après un
 * déplacement (restauration ou purge de la corbeille).
 *
 * En partant du dossier le plus profond touché, on remonte tant que le
 * préfixe ne contient plus AUCUN objet R2, et on s'arrête au dossier-statut
 * (jamais supprimé, borne `minDepth`).
 */

/** Reste-t-il au moins un objet R2 STRICTEMENT sous ce dossier ? */
async function folderHasObjects(folderPath: string): Promise<boolean> {
  const res = await getR2Client().send(
    new ListObjectsV2Command({ Bucket: getR2Bucket(), Prefix: `${folderPath}/`, MaxKeys: 1 }),
  );
  return (res.Contents ?? []).length > 0;
}

export type PruneEmptyFoldersParams = {
  prisma: PrismaClient;
  appRoot: string;
  /**
   * Dossier le plus profond potentiellement vidé. Pour une source `file`,
   * c'est le dossier PARENT du fichier ; pour une source `folder`, c'est le
   * dossier lui-même.
   */
  startFolderPath: string;
};

export async function pruneEmptyFolders(params: PruneEmptyFoldersParams): Promise<void> {
  const { prisma, appRoot, startFolderPath } = params;

  const minDepth = appRoot.split("/").length + 1;

  let folderPath = startFolderPath;

  while (folderPath.split("/").length > minDepth) {
    if (await folderHasObjects(folderPath)) break;

    await prisma.folder.deleteMany({
      where: {
        appRoot,
        OR: [{ fullPath: folderPath }, { fullPath: { startsWith: `${folderPath}/` } }],
      },
    });

    folderPath = folderPath.split("/").slice(0, -1).join("/");
  }
}
