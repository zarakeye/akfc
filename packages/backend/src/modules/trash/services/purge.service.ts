import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { isTrashStoragePath, normalizePath } from "@backend/modules/trash/utils";
import { pruneEmptyFolders } from "@backend/modules/storage/services/pruneEmptyFolders.service";
import {
  r2DeleteFile,
  r2DeleteByPrefix,
} from "@backend/modules/trash/services/r2TrashOps";
import { deleteAssetRowsOfTrashedItem } from "@backend/modules/trash/services/trashedAssets.service";

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
 * finder qui n'a accès qu'aux **chemins de stockage**.
 *
 * `purge` résout ce gap : il accepte des paths sous `${appRoot}/bin/.trash/`
 * et gère 2 cas :
 *   1. **TrashEntry trouvée** par `storageRoot` match → flow standard
 *      (idem deleteForever, avec tolérance asset orphelin)
 *   2. **Vestige** (chemin sans TrashEntry associée) → suppression
 *      physique directe par préfixe
 *
 * Les vestiges arrivent en pratique quand un `trashToBin` a réussi côté
 * stockage mais a échoué côté DB (rollback partiel) — ou suite à des
 * artefacts de refacto. Avant `purge`, ces vestiges étaient impossibles à
 * supprimer depuis l'UI : `deleteForever` plantait avec "missing TrashEntry
 * ids" et la TreeView les affichait éternellement.
 *
 * ─── Garde-fous ────────────────────────────────────────────────────────
 *
 * - Chaque path DOIT être sous `${appRoot}/bin/.trash/` — sinon `purge`
 *   pourrait supprimer n'importe quel fichier du bucket.
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
  /** Chemins demandés, par élément jeté (pour refuser un effacement partiel, plus bas). */
  const askedByWrapper = new Map<string, string[]>();
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
    askedByWrapper.set(wrapper, [...(askedByWrapper.get(wrapper) ?? []), normalizePath(path)]);
  }

  // ─── Étape 1 bis : un élément jeté s'efface en entier, ou pas du tout ──
  //
  // Dans le finder, on peut entrer dans un dossier jeté et y sélectionner un fichier. Ramené à son
  // élément, ce chemin effaçait TOUT le dossier jeté, alors que la confirmation annonçait « 1 élément ».
  // On n'accepte donc que l'élément lui-même (le wrapper, ou son storageRoot) ; un chemin plus
  // profond est refusé, avant toute suppression.
  for (const wrapperPath of wrapperPaths) {
    const entry = await prisma.trashEntry.findFirst({
      where: {
        appRoot,
        OR: [{ storageRoot: wrapperPath }, { storageRoot: { startsWith: `${wrapperPath}/` } }],
        status: "IN_BIN",
      },
      select: { storageRoot: true, displayName: true },
    });
    if (!entry) continue; // vestige : un fragment sans entrée, effacé en entier
    const whole = new Set([normalizePath(wrapperPath), normalizePath(entry.storageRoot)]);
    if ((askedByWrapper.get(wrapperPath) ?? []).some((asked) => !whole.has(asked))) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Ce fichier fait partie de « ${entry.displayName} », jeté en entier : revenez à la corbeille pour effacer « ${entry.displayName} » ou le restaurer.`,
      });
    }
  }

  const purged: string[] = [];
  const vestiges: string[] = [];

  // ─── Étape 2 : pour chaque wrapper, dispatch entry / vestige ─────────
  for (const wrapperPath of wrapperPaths) {
    // storageRoot = `<wrapper>/<nom>` (fichier ou dossier) : on cherche
    // l'entrée DANS le wrapper, pas seulement égale à lui.
    const entry = await prisma.trashEntry.findFirst({
      where: {
        appRoot,
        OR: [{ storageRoot: wrapperPath }, { storageRoot: { startsWith: `${wrapperPath}/` } }],
        status: "IN_BIN",
      },
      select: {
        id: true,
        kind: true,
        storageRoot: true,
        previousPath: true,
      },
    });

    if (entry) {
      // ─── Flow standard (DB-backed) ─────────────────────────────────
      if (entry.kind === "file") {
        // Idempotent : si le fichier a déjà disparu, on marque quand même
        // la TrashEntry comme DELETED pour purger l'orpheline.
        await r2DeleteFile(entry.storageRoot);
      } else {
        // kind === "folder" : on supprime tout sous le préfixe (toute profondeur).
        await r2DeleteByPrefix(`${normalizePath(entry.storageRoot)}/`);
      }
      // Lignes MediaAsset restées sur le chemin d'origine : sans fichier désormais.
      await deleteAssetRowsOfTrashedItem(prisma, appRoot, entry);

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
      // Pas de TrashEntry : fragment orphelin, supprimé physiquement par
      // préfixe (fichier unique ou arborescence ; rien à faire s'il est vide).
      console.warn(
        `[purge] Vestige (no TrashEntry, physical purge): ${wrapperPath}`,
      );
      await r2DeleteByPrefix(`${normalizePath(wrapperPath)}/`);
      vestiges.push(wrapperPath);
    }

    // ─── Le wrapper est vide : sa ligne `Folder` n'a plus rien à décrire ──
    //
    // Même raison que dans `restoreFromBin` : sans ça, la quarantaine purgée
    // laisse une ligne `Folder` orpheline.
    await pruneEmptyFolders({
      prisma,
      appRoot,
      startFolderPath: normalizePath(wrapperPath),
    });

    purged.push(wrapperPath);
  }

  return { purged, vestiges };
}
