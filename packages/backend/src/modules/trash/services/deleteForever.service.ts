import type { PrismaClient } from "@prisma/client";

import { cloudinary } from "@workspace/backend/modules/cloudinary/cloudinary.client";
import type { DeleteForeverInput, DeleteForeverOutput } from "@workspace/contracts/src/trash/trash.mutations";

import { isTrashStoragePath, normalizePath } from "@workspace/backend//modules/trash/utils";
import { getAssetInfo, deleteByPrefix } from "@workspace/backend/modules/cloudinary/services/cloudinary.service";

/**
 * deleteForever.service.ts
 *
 * Ticket 4 : suppression définitive d'entrées du bin.
 *
 * Design validé :
 * - Un contenu en bin ne peut être QUE : parcouru / prévisualisé / restauré / supprimé définitivement.
 * - Toute suppression définitive se fait via TrashEntry (pas via cloudinaryRouter).
 */

export async function deleteForever(params: {
  prisma: PrismaClient;
  input: DeleteForeverInput;
}): Promise<DeleteForeverOutput> {
  const { prisma, input } = params;
  const appRoot = input.appRoot;

  const entries = await prisma.trashEntry.findMany({
    where: {
      appRoot,
      id: { in: input.ids },
      status: "IN_BIN",
    },
    select: {
      id: true,
      kind: true,
      storageRoot: true,
    },
  });

  if (entries.length !== input.ids.length) {
    const found = new Set(entries.map((e) => e.id));
    const missing = input.ids.filter((id) => !found.has(id));
    throw new Error(`deleteForever: missing TrashEntry ids: ${missing.join(", ")}`);
  }

  for (const entry of entries) {
    if (!isTrashStoragePath(appRoot, entry.storageRoot)) {
      throw new Error(`Refusing deleteForever: storageRoot is not trash storage: ${entry.storageRoot}`);
    }

    if (entry.kind === "file") {
      const info = await getAssetInfo(entry.storageRoot);
      await cloudinary.uploader.destroy(entry.storageRoot, {
        type: "authenticated",
        resource_type: info.resource_type,
      });
    } else {
      // Folder: supprime tout sous `${storageRoot}/`
      // (les assets n'existent pas comme dossiers réels)
      await deleteByPrefix(`${normalizePath(entry.storageRoot)}/`);
    }

    await prisma.trashEntry.update({
      where: { id: entry.id },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
      },
    });
  }

  return { deletedIds: entries.map((e) => e.id) };
}
