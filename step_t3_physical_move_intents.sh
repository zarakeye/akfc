#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — T3 : projection des intentions de move, logique → physique
# ═══════════════════════════════════════════════════════════════════════════
#
#  Chantier « arbre sans strate de statut ». T2 a plié la LECTURE. Dès que
#  le front consommera cette vue, tout chemin qui en ressort et qui revient
#  au backend dans une intention de move sera logique — un espace dans lequel
#  `resolveTargetPath` ne sait pas travailler (elle exige un segment de
#  statut en position 1 et lève une erreur sinon).
#
#  Ce script ajoute la traduction manquante, et RIEN d'autre.
#
#  CE QUE FAIT CE SCRIPT
#  ---------------------
#   1. `storage/toPhysicalMoveIntents.service.ts` (NEUF) — projette UNE
#      intention exprimée en chemins logiques vers N intentions entièrement
#      physiques, une par emplacement réellement occupé.
#
#  Non branché : `storage.move` continue de passer l'intention brute à
#  `planMoveOperations`. Aucun comportement runtime ne change.
#
#  AUCUNE migration Prisma. `git revert` suffit.
#
#  PRÉREQUIS : T2 (logicalPath.ts).
#
#  USAGE
#  -----
#     bash step_t3_physical_move_intents.sh
#     AKFC_APPLY_ONLY=1 bash step_t3_physical_move_intents.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — T3 : projection des intentions de move (non montée)"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "packages/backend" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

SERVICE="packages/backend/src/modules/storage/toPhysicalMoveIntents.service.ts"

if [ ! -f "packages/backend/src/modules/storage/logicalPath.ts" ]; then
  echo "✗ T2 n'est pas appliqué (logicalPath.ts absent)."
  echo "  Lance step_t2_status_folding_view.sh d'abord."
  exit 1
fi

if [ -f "$SERVICE" ]; then
  echo "✓ Déjà appliqué ($SERVICE présent)."
  exit 0
fi

cat > "$SERVICE" <<'TSEOF'
import type { PrismaClient } from "@prisma/client";

import type {
  StorageMoveIntent,
  StorageMoveSource,
  StorageMoveTarget,
} from "@contracts/storage";

import {
  FOLDABLE_STATUS_SEGMENTS,
  physicalCandidates,
  stratumSegmentOf,
  toLogicalPath,
  toPhysicalPath,
  type FoldableStatus,
  type StratumSegment,
} from "@backend/modules/storage/logicalPath";

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
  const locations = await resolvePhysicalLocations(prisma, appRoot, sourcePaths);

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
/*  Résolution des emplacements réels                                         */
/* -------------------------------------------------------------------------- */

/**
 * Pour chaque chemin source, la liste de ses emplacements physiques réels.
 *
 * Deux régimes :
 *
 *   - Le chemin porte DÉJÀ une strate (`AKFC/pending/…`) : l'appelant nous
 *     dit où vit l'item, on le croit. C'est le cas dominant après le pliage
 *     côté front — `FinderNode.id` porte le `storagePath` d'un fichier. Pas
 *     de requête : si le chemin est faux, le provider échouera de lui-même,
 *     bruyamment, ce qui est le bon comportement.
 *
 *   - Le chemin est logique (typiquement un DOSSIER, dont l'identité UI est
 *     son chemin logique parce qu'il n'a pas d'emplacement unique) : on
 *     interroge l'oracle d'existence.
 *
 * Les deux requêtes sont groupées sur l'ensemble des candidats de tous les
 * chemins logiques — deux allers-retours DB au total, quel que soit le
 * nombre d'items sélectionnés.
 */
async function resolvePhysicalLocations(
  prisma: PrismaClient,
  appRoot: string,
  sourcePaths: readonly string[],
): Promise<Map<string, string[]>> {
  const resolved = new Map<string, string[]>();
  const candidatesByPath = new Map<string, string[]>();

  for (const sourcePath of sourcePaths) {
    if (stratumSegmentOf(sourcePath, appRoot) !== null) {
      // Déjà physique (strate connue, corbeille comprise) → on le prend tel quel.
      resolved.set(sourcePath, [sourcePath]);
      continue;
    }
    candidatesByPath.set(sourcePath, physicalCandidates(sourcePath, appRoot));
  }

  if (candidatesByPath.size === 0) return resolved;

  const allCandidates = [...new Set([...candidatesByPath.values()].flat())];

  // L'oracle d'existence, en deux tables :
  //   - `Folder`     : le registre des dossiers logiques. C'est lui qui fait
  //                    exister les dossiers VIDES, donc lui qui permet de les
  //                    déplacer.
  //   - `MediaAsset` : les fichiers. Filet pour un chemin de fichier logique
  //                    (path périmé d'un cache client, lien mis en favori).
  const [folders, assets] = await Promise.all([
    prisma.folder.findMany({
      where: { appRoot, fullPath: { in: allCandidates } },
      select: { fullPath: true },
    }),
    prisma.mediaAsset.findMany({
      where: { appRoot, fullPath: { in: allCandidates } },
      select: { fullPath: true },
    }),
  ]);

  const existing = new Set<string>([
    ...folders.map((row) => row.fullPath),
    ...assets.map((row) => row.fullPath),
  ]);

  for (const [sourcePath, candidates] of candidatesByPath) {
    const found = candidates.filter((candidate) => existing.has(candidate));
    if (found.length === 0) {
      throw new Error(
        `[toPhysicalMoveIntents] Aucun emplacement connu pour "${sourcePath}". ` +
          `Ni le registre Folder ni MediaAsset ne connaissent aucun de : ` +
          `${candidates.join(", ")}. Le finder affiche un item que la DB ignore.`,
      );
    }
    resolved.set(sourcePath, found);
  }

  return resolved;
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
TSEOF
echo "  ✓ $SERVICE (neuf)"
echo "✓ Édits appliqués."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "⏭  AKFC_APPLY_ONLY=1 → typecheck et commit sautés."
  exit 0
fi

echo "▶ pnpm --filter backend typecheck"
pnpm --filter backend typecheck

echo "▶ pnpm typecheck (web)"
pnpm typecheck

git add -A
git commit -m "feat(storage): projection des intentions de move logique -> physique (non montée)

Chantier « arbre sans strate de statut ». T2 a plié la lecture ; dès que le
front consommera la vue pliée, les chemins qui remontent dans une intention
de move seront logiques. Or resolveTargetPath exige un segment de statut en
position 1 du chemin source pour les cibles status-folder, et lève sinon :
passer la vue pliée à planMoveOperations casserait la publication.

toPhysicalMoveIntents redescend l'intention dans l'espace physique AVANT
planification, en émettant une intention par emplacement RÉELLEMENT occupé :

- l'existence est demandée, pas devinée — registre Folder pour les dossiers
  (c'est lui qui fait exister les dossiers vides, donc qui permet de les
  déplacer), MediaAsset pour les fichiers. Deux requêtes groupées quelle que
  soit la taille de la sélection.
- aucune intention spéculative : l'appelant peut donc propager les erreurs
  de chacune, au lieu d'installer une tolérance « ça n'existe peut-être pas »
  qui finirait par avaler assertOperationsDontUnpublishReferencedAssets.
- la cible hérite de la strate de sa source : un DnD est une réorganisation,
  il ne doit jamais publier par accident.
- les cibles status-folder traversent inchangées : changer de strate est leur
  métier, et resolveTargetPath le fait bien dès qu'on lui donne une source
  physique.
- le type de source est préservé (pas de rabattage dossier -> selection, qui
  ferait cesser les dossiers vides de se déplacer).

Non branché : storage.move passe toujours l'intention brute à
planMoveOperations. Aucun changement de comportement runtime."

echo "✅ T3 appliqué, typechecké et commité."