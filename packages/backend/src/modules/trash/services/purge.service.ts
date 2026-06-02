import type { PrismaClient } from "@prisma/client";

import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";
import {
  getAssetInfo,
  deleteByPrefix,
} from "@backend/modules/cloudinary/services/cloudinary.service";
import { invalidate as invalidateResourcesCache } from "@backend/modules/cloudinary/cache/resourcesCache";
import { isTrashStoragePath, normalizePath } from "@backend/modules/trash/utils";

/**
 * purge.service.ts
 *
 * Suppression définitive **path-based** dans la corbeille.
 *
 * ─── Différence avec deleteForever ─────────────────────────────────────
 *
 * `deleteForever` opère par **TrashEntry.id** : il échoue si une id n'existe
 * pas en base. Ce comportement est nécessaire pour la TrashView (qui
 * consomme `listBin` et a donc des ids garantis), mais inadapté pour le
 * finder qui n'a accès qu'aux **paths Cloudinary**.
 *
 * `purge` résout ce gap : il accepte des paths sous `${appRoot}/bin/.trash/`
 * et gère 2 cas :
 *   1. **TrashEntry trouvée** par `storageRoot` match → flow standard
 *      (idem deleteForever, avec tolérance asset orphelin)
 *   2. **Vestige** (path Cloudinary sans TrashEntry associée) → suppression
 *      physique directe par préfixe
 *
 * Les vestiges arrivent en pratique quand un `trashToBin` a réussi côté
 * Cloudinary mais a échoué côté DB (rollback partiel) — ou suite à des
 * artefacts de refacto. Avant `purge`, ces vestiges étaient impossibles à
 * supprimer depuis l'UI : `deleteForever` plantait avec "missing TrashEntry
 * ids" et la TreeView les affichait éternellement.
 *
 * ─── Garde-fous ────────────────────────────────────────────────────────
 *
 * - Chaque path DOIT être sous `${appRoot}/bin/.trash/` — sinon `purge`
 *   pourrait supprimer n'importe quel asset du compte Cloudinary.
 *   `isTrashStoragePath` est notre vérification canonique.
 * - On normalise vers le **wrapper path** (`bin/.trash/<uuid>`) avant
 *   action — pour qu'un path comme `bin/.trash/<uuid>/sub/file.jpg`
 *   purge bien le wrapper entier et pas juste le fichier.
 * - Dédup par wrapper : si l'UI envoie plusieurs paths du même wrapper
 *   (cas d'un dossier multi-fichiers), on ne purge qu'une fois.
 */

export type PurgeInput = {
  appRoot: string;
  paths: string[];
};

export type PurgeOutput = {
  /** Wrapper paths effectivement purgés (success). */
  purged: string[];
  /** Wrapper paths qui étaient des vestiges (sans TrashEntry). */
  vestiges: string[];
};

export async function purge(params: {
  prisma: PrismaClient;
  input: PurgeInput;
}): Promise<PurgeOutput> {
  const { prisma, input } = params;
  const { appRoot } = input;

  // ─── Étape 1 : dériver les wrapper paths uniques ─────────────────────
  //
  // Chaque path utilisateur est ramené à son wrapper `${appRoot}/bin/.trash/<uuid>`.
  // Pour ça, on cherche le pattern `/bin/.trash/<uuid>` et on tronque
  // tout ce qui suit. Si le pattern n'est pas trouvé, le path n'est pas
  // dans la trash storage → on refuse (garde-fou).
  const wrapperPaths = new Set<string>();
  const wrapperRegex = /^(.+\/bin\/\.trash\/[^/]+)(?:\/.*)?$/;

  for (const path of input.paths) {
    const match = path.match(wrapperRegex);
    if (!match) {
      throw new Error(
        `purge: path is not in trash storage (expected '${appRoot}/bin/.trash/<uuid>...'): ${path}`,
      );
    }
    const wrapper = match[1];

    // Double-check : le wrapper doit aussi être sous APP_ROOT/bin attendu.
    if (!isTrashStoragePath(appRoot, wrapper)) {
      throw new Error(
        `purge: refusing path outside trash storage of appRoot='${appRoot}': ${wrapper}`,
      );
    }

    wrapperPaths.add(wrapper);
  }

  const purged: string[] = [];
  const vestiges: string[] = [];

  // ─── Étape 2 : pour chaque wrapper, dispatch entry / vestige ─────────
  for (const wrapperPath of wrapperPaths) {
    const entry = await prisma.trashEntry.findFirst({
      where: {
        appRoot,
        storageRoot: wrapperPath,
        status: "IN_BIN",
      },
      select: {
        id: true,
        kind: true,
        storageRoot: true,
      },
    });

    if (entry) {
      // ─── Flow standard (DB-backed) ─────────────────────────────────
      if (entry.kind === "file") {
        // Même tolérance que dans deleteForever.service.ts : si l'asset
        // a déjà disparu (corruption silencieuse), on continue et on
        // marque la TrashEntry comme DELETED pour purger l'orpheline.
        try {
          const info = await getAssetInfo(entry.storageRoot);
          await cloudinary.uploader.destroy(entry.storageRoot, {
            type: "authenticated",
            resource_type: info.resource_type,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (!message.startsWith("Asset not found")) throw err;
          console.warn(
            `[purge] Orphan asset (already gone), keeping entry purge: id=${entry.id} path=${entry.storageRoot}`,
          );
        }
      } else {
        // kind === "folder" : on supprime tout sous le préfixe.
        // deleteByPrefix est déjà tolérant (dict vide si rien).
        await deleteByPrefix(`${normalizePath(entry.storageRoot)}/`);
      }

      await prisma.trashEntry.update({
        where: { id: entry.id },
        data: {
          status: "DELETED",
          deletedAt: new Date(),
        },
      });
    } else {
      // ─── Flow vestige (no-DB) ──────────────────────────────────────
      //
      // Pas de TrashEntry : c'est un fragment Cloudinary orphelin. On le
      // supprime physiquement. On utilise `deleteByPrefix` qui couvre les
      // deux cas (asset unique ou arborescence) et ne lance pas si rien
      // n'existe.
      console.warn(
        `[purge] Vestige (no TrashEntry, physical purge): ${wrapperPath}`,
      );
      await deleteByPrefix(`${normalizePath(wrapperPath)}/`);
      vestiges.push(wrapperPath);
    }

    purged.push(wrapperPath);
  }

  // 🔁 Invalidation finale (cf. note dans deleteForever.service.ts).
  invalidateResourcesCache();

  return { purged, vestiges };
}
