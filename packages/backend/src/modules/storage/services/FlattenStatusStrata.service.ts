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