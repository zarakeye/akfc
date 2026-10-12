import type { PrismaClient } from "@prisma/client";

import type { DeleteForeverInput, DeleteForeverOutput } from "@contracts/trash/trash.mutations";

import { isTrashStoragePath, normalizePath } from "@backend/modules/trash/utils";
import {
  r2DeleteFile,
  r2DeleteByPrefix,
} from "@backend/modules/trash/services/r2TrashOps";

/**
 * deleteForever.service.ts
 *
 * Ticket 4 : suppression définitive d'entrées du bin.
 *
 * Design validé :
 * - Un contenu en bin ne peut être QUE : parcouru / prévisualisé / restauré / supprimé définitivement.
 * - Toute suppression définitive se fait via TrashEntry.
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
      // Idempotent : un fichier déjà disparu (suppression manuelle, échec
      // d'un déplacement précédent…) est considéré comme supprimé — la
      // TrashEntry passe quand même en DELETED, ce qui débloque « Vider la
      // corbeille ».
      await r2DeleteFile(entry.storageRoot);
    } else {
      // Folder : supprime tout sous `${storageRoot}/` (toute profondeur).
      await r2DeleteByPrefix(`${normalizePath(entry.storageRoot)}/`);
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
