import type { PrismaClient } from "@prisma/client";

import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";
import type { DeleteForeverInput, DeleteForeverOutput } from "@contracts/trash/trash.mutations";

import { isTrashStoragePath, normalizePath } from "@backend//modules/trash/utils";
import { getAssetInfo, deleteByPrefix } from "@backend/modules/cloudinary/services/cloudinary.service";
import { invalidate as invalidateResourcesCache } from "@backend/modules/cloudinary/cache/resourcesCache";
import { r2DeleteFile } from "@backend/modules/trash/services/r2TrashOps";

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
      // ─── Tolérance aux assets orphelins ──────────────────────────────────
      //
      // Une TrashEntry peut être "orpheline" : la ligne DB existe mais
      // l'asset Cloudinary à `storageRoot` a déjà disparu (suppression
      // manuelle via dashboard, échec de move précédent, anciens artefacts
      // du refacto storage…). Dans ces cas, `getAssetInfo` lance
      // `Asset not found (any resource_type): <path>` et plantait tout le
      // batch — empêchant en particulier le "Vider la corbeille" de
      // s'exécuter.
      //
      // Politique : on **considère l'orphelin comme déjà supprimé**, on log
      // et on continue. La TrashEntry DB est mise à jour normalement
      // (status=DELETED) ce qui purge l'orpheline et débloque le flow.
      //
      // Cette tolérance est sûre : `deleteForever` est par nature
      // destructive et idempotente côté résultat (l'asset doit ne plus
      // exister à la fin) — donc un asset déjà absent est un état
      // intermédiaire acceptable.
      try {
        const info = await getAssetInfo(entry.storageRoot);
        await cloudinary.uploader.destroy(entry.storageRoot, {
          type: "authenticated",
          resource_type: info.resource_type,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.startsWith("Asset not found")) {
          // Cloudinary ne l'a pas : peut-être un fichier R2 (PDF/docs).
          // r2DeleteFile est idempotent (no-op si absent aussi sur R2).
          await r2DeleteFile(entry.storageRoot);
          console.warn(
            `[deleteForever] Absent de Cloudinary; suppression R2 tentée (idempotent): id=${entry.id} path=${entry.storageRoot}`,
          );
        } else {
          throw err;
        }
      }
    } else {
      // Folder: supprime tout sous `${storageRoot}/`
      // (les assets n'existent pas comme dossiers réels)
      // `deleteByPrefix` est déjà tolérant : si rien n'existe sous le
      // préfixe, Cloudinary renvoie un dict vide sans erreur. Pas besoin
      // de try/catch ici.
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

  // 🔁 Une seule invalidation en fin de batch : on peut supprimer plusieurs
  // entries en série, inutile de purger le cache à chaque iteration. Note
  // que `deleteByPrefix` invalide déjà de son côté pour le cas folder ;
  // ici on couvre aussi le cas file (cloudinary.uploader.destroy direct).
  invalidateResourcesCache();

  return { deletedIds: entries.map((e) => e.id) };
}
