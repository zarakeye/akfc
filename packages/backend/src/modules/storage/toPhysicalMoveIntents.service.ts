import type { PrismaClient } from "@prisma/client";

import type {
  StorageMoveIntent,
  StorageMoveSource,
  StorageMoveTarget,
} from "@contracts/storage";

import {
  FOLDABLE_STATUS_SEGMENTS,
  stratumSegmentOf,
  toLogicalPath,
  toPhysicalPath,
  type FoldableStatus,
  type StratumSegment,
} from "@backend/modules/storage/logicalPath";
import { resolvePhysicalLocations } from "@backend/modules/storage/resolvePhysicalLocations.service";

/**
 * toPhysicalMoveIntents — la traduction que le pliage de la strate impose.
 *
 * ─── Le problème ──────────────────────────────────────────────────────────
 *
 * `StatusFoldingReadView` présente à l'UI un arbre où `AKFC/cours/x` fusionne
 * `AKFC/pending/cours/x` et `AKFC/published/cours/x`. Tout chemin qui remonte
 * de cette UI est donc LOGIQUE. Or le pipeline de move travaille, lui, en
 * chemins physiques — et pas par accident :
 *
 *   - `resolveTargetPath`, pour une cible `status-folder`, remplace le
 *     segment de statut du chemin source. Elle EXIGE que `segment[1]` soit
 *     un statut connu et lève une erreur explicite sinon. Un chemin logique
 *     n'en a pas, par construction : elle lèverait à chaque publication.
 *
 *   - `moveService` (Cloudinary) et `r2StorageAdapter` renomment des
 *     binaires. Un chemin logique ne désigne aucun binaire.
 *
 * On ne peut donc pas « faire passer » la vue pliée à `planMoveOperations`.
 * Il faut redescendre l'intention dans l'espace physique AVANT de la
 * planifier. C'est tout ce que fait ce module.
 *
 * ─── Le principe : une intention par emplacement réellement occupé ────────
 *
 * Un chemin logique de dossier correspond à 1..N emplacements physiques.
 * Plutôt que de deviner, on DEMANDE — au registre `Folder` pour les
 * dossiers, à `MediaAsset` pour les fichiers. Ces deux tables sont l'oracle
 * d'existence du système : `upsertFolders` y enregistre tout dossier
 * rencontré, ce qui est précisément ce qui permet aux dossiers VIDES
 * d'exister. Un dossier vide déplacé doit continuer de se déplacer.
 *
 * On produit ensuite une intention par emplacement trouvé, chacune
 * entièrement physique, chacune RÉELLE :
 *
 *   logique   : { source: {folder, 'AKFC/cours/x'}, target: {folder, 'AKFC/cours/y'} }
 *   physique  : { source: {folder, 'AKFC/pending/cours/x'},   target: {folder, 'AKFC/pending/cours/y'} }
 *               { source: {folder, 'AKFC/published/cours/x'}, target: {folder, 'AKFC/published/cours/y'} }
 *
 * Aucune intention spéculative n'est émise : si `AKFC/published/cours/x`
 * n'existe pas, il n'apparaît pas dans le résultat. C'est ce qui permet à
 * l'appelant de traiter chaque intention comme une vraie demande et de
 * propager ses erreurs — plutôt que d'installer une tolérance « ça n'existe
 * peut-être pas » qui finirait par avaler des pannes réelles, et surtout par
 * avaler `assertOperationsDontUnpublishReferencedAssets`.
 *
 * ─── La règle d'or : la cible hérite de la strate de sa source ────────────
 *
 * Déplacer une photo d'une discipline à l'autre est une RÉORGANISATION, pas
 * un changement d'état. Sa strate doit être préservée, sinon un simple
 * glisser-déposer publierait un contenu en attente de relecture. Chaque
 * intention projetée porte donc source ET cible dans la MÊME strate.
 *
 * Les cibles `status-folder`, elles, traversent inchangées : c'est justement
 * leur métier de changer de strate, et `resolveTargetPath` le fait déjà —
 * correctement, dès lors qu'on lui donne une source physique.
 *
 * ─── Durée de vie ─────────────────────────────────────────────────────────
 *
 * Transitoire. À l'étape 5 du chantier, tout vit à plat : chaque chemin
 * n'a plus qu'un emplacement, la projection devient l'identité, et ce
 * module se supprime avec `logicalPath.ts` et `StatusFoldingReadView`.
 */

export type ToPhysicalMoveIntentsParams = {
  prisma: PrismaClient;
  appRoot: string;
  /** L'intention telle que reçue de l'UI — chemins possiblement logiques. */
  intent: StorageMoveIntent;
};

/**
 * Projette une intention logique vers N intentions entièrement physiques.
 *
 * L'appelant les planifie une par une, réunit les opérations, passe l'union
 * aux gardes, puis exécute. L'union est importante : une garde ne doit
 * jamais raisonner sur un sous-ensemble des opérations.
 *
 * @throws si un chemin source ne correspond à AUCUN emplacement connu. Un
 *   move demandé sur un item que ni le registre `Folder` ni `MediaAsset` ne
 *   connaissent signale une incohérence entre ce que le finder affiche et ce
 *   que la DB sait — mieux vaut échouer fort que ne rien faire en silence.
 */
export async function toPhysicalMoveIntents(
  params: ToPhysicalMoveIntentsParams,
): Promise<StorageMoveIntent[]> {
  const { prisma, appRoot, intent } = params;

  const sourcePaths = sourcePathsOf(intent.source);
  const locations = await resolvePhysicalLocations({
    prisma,
    appRoot,
    paths: sourcePaths,
  });

  // Regroupement par strate : tous les chemins sources qui vivent dans la
  // même strate partent dans la même intention. La clé `null` est la strate
  // « à plat » — vide aujourd'hui, peuplée après l'étape 4 du chantier.
  const buckets = new Map<StratumSegment | null, string[]>();
  for (const sourcePath of sourcePaths) {
    for (const physicalPath of locations.get(sourcePath) ?? []) {
      const stratum = stratumSegmentOf(physicalPath, appRoot);
      const bucket = buckets.get(stratum);
      if (bucket) bucket.push(physicalPath);
      else buckets.set(stratum, [physicalPath]);
    }
  }

  return [...buckets.entries()].map(([stratum, paths]) => ({
    source: projectSource(intent.source, paths, appRoot, stratum),
    target: projectTarget(intent.target, appRoot, stratum),
  }));
}

/* -------------------------------------------------------------------------- */
/*  Projection                                                                */
/* -------------------------------------------------------------------------- */

function sourcePathsOf(source: StorageMoveSource): string[] {
  return source.type === "selection" ? [...source.roots] : [source.path];
}

/**
 * Reconstruit la source dans une strate donnée.
 *
 * Le TYPE de source est préservé, délibérément. Rabattre un dossier sur une
 * `selection` serait tentant (ça s'auto-nettoierait quand une strate est
 * vide) mais changerait la sémantique : `resolveSource` expanse une
 * sélection en opérations FICHIER, et un dossier vide n'en produirait
 * aucune — il cesserait donc de se déplacer. On préfère garder l'opération
 * dossier et payer une requête d'existence.
 */
function projectSource(
  source: StorageMoveSource,
  physicalPaths: readonly string[],
  appRoot: string,
  stratum: StratumSegment | null,
): StorageMoveSource {
  if (source.type === "selection") {
    return {
      type: "selection",
      roots: [...physicalPaths],
      ...(source.excluded
        ? {
            excluded: source.excluded.map((path) =>
              projectPath(path, appRoot, stratum),
            ),
          }
        : {}),
    };
  }

  // `file` / `folder` : un chemin source ne peut occuper qu'UN emplacement
  // par strate, donc ce bucket en contient exactement un.
  return { type: source.type, path: physicalPaths[0] };
}

/**
 * Reconstruit la cible dans la strate de la source.
 *
 * Une cible `status-folder` traverse INCHANGÉE : son métier est justement de
 * changer de strate, et `resolveTargetPath` s'en charge à partir de la source
 * physique qu'on vient de lui garantir.
 *
 * ⚠️ Après l'étape 4 (uploads à plat), une source à plat combinée à une cible
 * `status-folder` fera lever `resolveTargetPath` (« segment[1] n'est pas un
 * statut connu »). C'est voulu, et c'est ce qui rend l'ordre du chantier
 * contraignant : l'étape 3 (publier = UPDATE du statut) doit précéder
 * l'étape 4, et elle fait disparaître les cibles `status-folder`. Si cette
 * erreur apparaît un jour, elle dit « tu as sauté une étape » — pas
 * « bricole une exception ici ».
 */
function projectTarget(
  target: StorageMoveTarget,
  appRoot: string,
  stratum: StratumSegment | null,
): StorageMoveTarget {
  if (target.type === "status-folder") return target;
  return { type: "folder", path: projectPath(target.path, appRoot, stratum) };
}

/**
 * Redescend un chemin logique dans une strate. `null` (à plat) et la
 * corbeille laissent le chemin logique tel quel — il EST déjà son propre
 * chemin physique dans ces deux cas.
 */
function projectPath(
  path: string,
  appRoot: string,
  stratum: StratumSegment | null,
): string {
  if (stratum === null) return toLogicalPath(path, appRoot);
  if (!isFoldable(stratum)) return path;
  return toPhysicalPath(path, appRoot, stratum);
}

function isFoldable(stratum: StratumSegment): stratum is FoldableStatus {
  return (FOLDABLE_STATUS_SEGMENTS as readonly string[]).includes(stratum);
}
