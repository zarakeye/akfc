import type { PrismaClient } from "@prisma/client";

import { listAuthenticatedResources } from "@backend/modules/cloudinary/services/cloudinary.service";
import { buildCloudinaryTreeV1 } from "@backend/modules/cloudinary/tree";
import {
  folderAncestorsOfPublicId,
  upsertFolders,
} from "@backend/modules/cloudinary/utils/folder.utils";
import { mapCloudinaryFolderToClient } from "@backend/mappers/cloudinary/tree.v1.mapper";
import type { FolderNode } from "@contracts/cloudinary/finder.types";

/**
 * getCloudinaryFolderTree.service.ts
 *
 * Construit l'arbre complet sous un préfixe Cloudinary, en combinant :
 *   - les ressources Cloudinary réelles (assets sous le prefix)
 *   - le registre DB des dossiers logiques (`cloudinaryFolder` Prisma)
 *
 * Cette logique vivait précédemment inline dans la procédure
 * `cloudinary.getFolderTree`. Elle a été extraite ici pour être consommée
 * par les deux clients :
 *   - le router Cloudinary (procédure historique)
 *   - le futur adapter `cloudinaryStorageAdapter` qui implémente le
 *     contrat agnostique `StorageAdapter`
 *
 * Comportement préservé strictement à l'identique de la version inline.
 *
 * Effet de bord : la procédure upsert silencieusement les dossiers
 * ancêtres découverts dans le registre DB. C'est le mécanisme qui assure
 * que tout dossier rencontré reste persisté, ce qui permet au Finder
 * d'afficher des dossiers vides (placeholders DB).
 */

export type GetCloudinaryFolderTreeParams = {
  prisma: PrismaClient;
  appRoot: string;
  /** Path normalisé déjà passé par `assertSafePath` côté router. */
  normalizedPath: string;
};

/**
 * Map des promesses "en vol" par clé `appRoot::normalizedPath`.
 *
 * ─── Pourquoi ? ────────────────────────────────────────────────────────────
 *
 * Au montage du Finder, deux composants demandent en parallèle l'arbre
 * sous le `rootPath` :
 *   1. `FinderTree` (sidebar gauche) appelle `adapter.getTree({ depth: 2 })`
 *   2. `useFinderData` (panneau central) appelle `adapter.list({ })`, qui
 *      côté backend redescend également vers `getCloudinaryFolderTree`
 *
 * Les deux appels HTTP arrivent quasi-simultanément, déclenchent chacun
 * la cascade Cloudinary + Prisma (transactions DB séquentielles, ~1.5s
 * en dev mode), et font donc deux fois exactement le même travail.
 *
 * Ce dedupe résout le problème côté service : si un appel sur le même
 * `(appRoot, normalizedPath)` est déjà en cours, le second l'attend au
 * lieu de tout refaire. Pour le client tRPC, le résultat reste identique
 * (deux requêtes répondues avec les mêmes données) — mais le backend
 * n'exécute le travail qu'une seule fois.
 *
 * ─── Pourquoi pas en HashMap global de cache ? ─────────────────────────────
 *
 * On ne cache pas les résultats au-delà de la durée de la promesse :
 *   - Si on cachait au-delà, on rendrait des données stale après une
 *     mutation (move, delete, etc.)
 *   - Le vrai cache (Cloudinary resources) est déjà géré par
 *     `resourcesCache.ts` avec TTL et invalidations explicites
 *
 * Ce `Map` ne sert qu'à fusionner les appels strictement simultanés.
 * Dès que la promesse résout (succès ou erreur), l'entrée est retirée
 * via le `.finally()` interne — le prochain appel sur le même path
 * relance un fetch frais.
 *
 * ─── Sécurité mémoire ──────────────────────────────────────────────────────
 *
 * Le `Map` est borné de fait par le nombre de paths distincts en cours
 * de fetch à un instant T (donc quelques dizaines au plus). Pas de risque
 * de fuite mémoire — chaque entrée est retirée à la résolution de sa promesse.
 */
const inFlight = new Map<string, Promise<FolderNode>>();

export async function getCloudinaryFolderTree(
  params: GetCloudinaryFolderTreeParams
): Promise<FolderNode> {
  const { prisma, appRoot, normalizedPath } = params;

  const key = `${appRoot}::${normalizedPath}`;

  // Si un appel sur la même clé est déjà en cours, on retourne sa promesse
  // — elle résoudra simultanément pour les deux appelants.
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    // 1) Récupérer les assets réels sous le préfixe (image / video / raw, paginés).
    const resources = await listAuthenticatedResources(normalizedPath);

    // 2) Découvrir tous les dossiers ancêtres de chaque asset, et les upsert
    //    dans le registre DB. C'est ce qui permet aux dossiers vides de survivre.
    const discoveredFolderPaths = resources.flatMap((r: { publicId: string }) =>
      folderAncestorsOfPublicId(r.publicId)
    );
    await upsertFolders(prisma, discoveredFolderPaths, appRoot);

    // 3) Lire le registre DB filtré par préfixe — il contient à la fois les
    //    dossiers ancêtres qu'on vient d'upserter ET les dossiers vides
    //    déjà enregistrés (placeholders).
    const registered = await prisma.folder.findMany({
      where: {
        appRoot,
        fullPath: { startsWith: normalizedPath },
      },
      select: { fullPath: true },
    });

    // 4) Construire l'arbre interne et le mapper vers la forme client.
    //
    // ─── Note importante sur `.trash` ───────────────────────────────────────
    //
    // L'arbre construit INCLUT le sous-arbre `bin/.trash/<uuid>/...` tel
    // qu'il existe côté Cloudinary. Le filtrage visuel de ce sous-arbre est
    // de la responsabilité du FRONTEND :
    //   - TreeView : skip pur du node `.trash` (rend ses enfants directement),
    //     et substitution des uuids par leur `displayName` via `trash.listBin`
    //   - Grille en bin root : remplace le rendu standard par la liste plate
    //     des trashEntries (vue corbeille intégrée)
    //
    // Ce design (vs filtrage backend) permet :
    //   - La navigation profonde dans une trashEntry depuis le finder
    //     (le path Cloudinary reste réel, donc Cloudinary peut répondre)
    //   - Une logique d'affichage co-localisée avec l'UI qui a besoin du
    //     `trashMap` de toute façon (pour les displayName)
    // ───────────────────────────────────────────────────────────────────────
    const finderTree = buildCloudinaryTreeV1(
      resources,
      registered.map((f) => f.fullPath),
      normalizedPath
    );

    return mapCloudinaryFolderToClient(finderTree);
  })();

  inFlight.set(key, promise);

  // Cleanup quelle que soit l'issue (résolution ou erreur). On utilise
  // `.finally` pour ne jamais transformer l'erreur — la promesse originale
  // (avec son rejet éventuel) est bien celle retournée à l'appelant.
  promise.finally(() => {
    inFlight.delete(key);
  });

  return promise;
}
