import type { PrismaClient } from '@prisma/client';

import { VirtualStorage } from '@backend/modules/storage/virtualStorage';
import {
  toLogicalPath,
  stratumSegmentOf,
} from '@backend/modules/storage/logicalPath';

/* ─────────────────────────────────────────────────────────────────────── */
/*  flattenStatusStrata — étape 5 du chantier « arbre sans strate »        */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Déplace RÉELLEMENT chaque binaire historique de `AKFC/<statut>/…` vers son
 * chemin plat `AKFC/…`, chez le provider (Cloudinary rename / R2 copy+delete).
 *
 * ─── Pourquoi un déplacement réel, et pas un simple UPDATE ───────────────
 *
 * Depuis l'étape 3, `MediaAsset.status` est la vérité et un binaire resté sous
 * `pending/` fonctionne déjà. Mais l'étape 6 SUPPRIME le pliage : le finder
 * cherchera alors les binaires à leur chemin plat (`physicalCandidates` rend
 * `[P, …]` — P plat en tête). Un binaire non migré deviendrait invisible.
 * Cette étape est donc la CONDITION de l'étape 6, pas un embellissement.
 *
 * ─── On ne réimplémente aucun move ───────────────────────────────────────
 *
 * `VirtualStorage.move` sait déjà : dispatcher par provider, gérer le rename
 * Cloudinary `authenticated` + `asset_folder` (dynamic folders), le copy+delete
 * R2, PUIS aligner `fullPath` en base via `reconcileMovedAsset` (qui, depuis le
 * flip, ne touche plus `status`). On l'appelle fichier par fichier — jamais en
 * dossier, dont le broadcast `allSettled` masquerait les échecs unitaires.
 *
 * ─── Sûreté ──────────────────────────────────────────────────────────────
 *
 *   - `dryRun` (défaut) : calcule et LISTE les moves, ne déplace rien.
 *   - idempotent & reprenable : un asset déjà plat est sauté. Un run
 *     interrompu se relance ; les déjà-faits ne rebougent pas.
 *   - la corbeille est exclue (`toLogicalPath` laisse `bin/` intact → le
 *     chemin ne change pas → move sauté).
 *   - arrêt sur première erreur inattendue : on ne continue pas à déplacer
 *     après un échec dont on ignore la cause.
 */

export type FlattenPlanItem = {
  id: string;
  from: string;
  to: string;
  stratum: string;
};

export type FlattenReport = {
  dryRun: boolean;
  scanned: number;
  alreadyFlat: number;
  planned: FlattenPlanItem[];
  moved: FlattenPlanItem[];
  failed: Array<FlattenPlanItem & { error: string }>;
};

export async function flattenStatusStrata(
  prisma: PrismaClient,
  appRoot: string,
  options: { dryRun?: boolean } = {},
): Promise<FlattenReport> {
  const dryRun = options.dryRun ?? true;

  const assets = await prisma.mediaAsset.findMany({
    where: { appRoot },
    select: { id: true, fullPath: true },
  });

  const report: FlattenReport = {
    dryRun,
    scanned: assets.length,
    alreadyFlat: 0,
    planned: [],
    moved: [],
    failed: [],
  };

  // 1) Construire le plan. Un asset est « à migrer » ssi son chemin porte
  //    encore un segment de statut foldable (pending/published — pas bin).
  for (const asset of assets) {
    const stratum = stratumSegmentOf(asset.fullPath, appRoot);
    const flat = toLogicalPath(asset.fullPath, appRoot);

    if (flat === asset.fullPath || stratum === null) {
      report.alreadyFlat += 1;
      continue;
    }

    report.planned.push({
      id: asset.id,
      from: asset.fullPath,
      to: flat,
      stratum,
    });
  }

  if (dryRun) return report;

  // 2) Exécuter, un fichier à la fois. On instancie VirtualStorage une fois.
  const storage = new VirtualStorage({ prisma, appRoot });

  for (const item of report.planned) {
    try {
      await storage.move({
        source: { type: 'file', path: item.from },
        target: { path: item.to },
      });
      report.moved.push(item);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      report.failed.push({ ...item, error: message });
      // Arrêt net : on ne déplace pas 33 binaires de plus après un échec
      // dont on ne connaît pas la cause. Le run est reprenable — corriger,
      // puis relancer sautera les `moved`.
      break;
    }
  }

  return report;
}


/* ─────────────────────────────────────────────────────────────────────── */
/*  purgeAssetsById — suppression DÉFINITIVE ciblée                         */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Supprime définitivement des assets, ciblés par `id` (jamais par chemin ni
 * préfixe : un id est unique, impossible de déborder sur un voisin).
 *
 * Fait les DEUX moitiés que ni `VirtualStorage.delete` ni la corbeille ne font
 * ensemble : le binaire chez le provider PUIS la ligne `MediaAsset`. Ordre
 * imposé — binaire d'abord, ligne ensuite : si l'ordre inverse échoue, on a
 * une ligne fantôme pointant vers un binaire disparu.
 *
 * ⚠️ Irréversible. Ne passe pas par la corbeille (quarantaine). Réservé à un
 * nettoyage admin explicite, pas à une suppression utilisateur.
 *
 * `dryRun` (défaut) : liste ce qui serait supprimé, ne touche à rien.
 */
export type PurgeReport = {
  dryRun: boolean;
  requested: string[];
  planned: Array<{ id: string; fullPath: string }>;
  purged: Array<{ id: string; fullPath: string }>;
  failed: Array<{ id: string; fullPath: string; error: string }>;
  notFound: string[];
};

export async function purgeAssetsById(
  prisma: PrismaClient,
  appRoot: string,
  ids: readonly string[],
  options: { dryRun?: boolean } = {},
): Promise<PurgeReport> {
  const dryRun = options.dryRun ?? true;

  const assets = await prisma.mediaAsset.findMany({
    where: { appRoot, id: { in: [...ids] } },
    select: { id: true, fullPath: true },
  });

  const found = new Set(assets.map((a) => a.id));

  const report: PurgeReport = {
    dryRun,
    requested: [...ids],
    planned: assets.map((a) => ({ id: a.id, fullPath: a.fullPath })),
    purged: [],
    failed: [],
    notFound: ids.filter((id) => !found.has(id)),
  };

  if (dryRun) return report;

  const storage = new VirtualStorage({ prisma, appRoot });

  for (const asset of assets) {
    try {
      // 1) le binaire (dispatch Cloudinary / R2 selon le provider).
      await storage.delete(asset.fullPath);
      // 2) la ligne — seulement si le binaire est bien parti.
      await prisma.mediaAsset.delete({ where: { id: asset.id } });
      report.purged.push({ id: asset.id, fullPath: asset.fullPath });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      report.failed.push({ id: asset.id, fullPath: asset.fullPath, error: message });
      // Arrêt net, comme la migration.
      break;
    }
  }

  return report;
}
