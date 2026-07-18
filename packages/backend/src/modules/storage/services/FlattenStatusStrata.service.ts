import type { PrismaClient } from '@prisma/client';

import { cloudinary } from '@backend/modules/cloudinary/cloudinary.client';
import { getAssetInfo } from '@backend/modules/cloudinary/services/cloudinary.service';
import { invalidate as invalidateResourcesCache } from '@backend/modules/cloudinary/cache/resourcesCache';
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


/* ─────────────────────────────────────────────────────────────────────── */
/*  purgeCloudinaryAssetsById — purge native Cloudinary                     */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Supprime définitivement des assets CLOUDINARY, ciblés par `id`.
 *
 * ─── Pourquoi une fonction distincte de `purgeAssetsById` ────────────────
 *
 * `purgeAssetsById` passe par `VirtualStorage.delete`, qui LÈVE pour
 * Cloudinary (l'adapter Cloudinary n'implémente pas `delete` — la suppression
 * y passe normalement par la corbeille). Ici on reprend le chemin exact de
 * `deleteForever` : `getAssetInfo` pour le `resource_type`, puis
 * `uploader.destroy(..., { type: 'authenticated', resource_type })`.
 *
 * ─── Garde de référence ──────────────────────────────────────────────────
 *
 * Détruire un asset qu'une page publiée affiche casse la page. On refuse,
 * sauf `force`. Même logique que la garde de dépublication de `setStatus`,
 * mais ici c'est une DESTRUCTION, donc plus stricte encore.
 *
 * ─── Tolérance à l'orphelin (reprise de deleteForever) ───────────────────
 *
 * Si le binaire a déjà disparu (`Asset not found`), on considère l'objectif
 * atteint et on retire la ligne DB quand même. Destruction idempotente.
 */
export type CloudinaryPurgeReport = {
  dryRun: boolean;
  requested: string[];
  planned: Array<{ id: string; fullPath: string; publicId: string | null }>;
  purged: Array<{ id: string; fullPath: string }>;
  blockedByReference: Array<{ id: string; fullPath: string; refs: number }>;
  failed: Array<{ id: string; fullPath: string; error: string }>;
  notFound: string[];
};

export async function purgeCloudinaryAssetsById(
  prisma: PrismaClient,
  appRoot: string,
  ids: readonly string[],
  options: { dryRun?: boolean; force?: boolean } = {},
): Promise<CloudinaryPurgeReport> {
  const dryRun = options.dryRun ?? true;
  const force = options.force ?? false;

  const assets = await prisma.mediaAsset.findMany({
    where: { appRoot, id: { in: [...ids] } },
    select: { id: true, fullPath: true, publicId: true },
  });
  const found = new Set(assets.map((a) => a.id));

  const report: CloudinaryPurgeReport = {
    dryRun,
    requested: [...ids],
    planned: assets.map((a) => ({
      id: a.id,
      fullPath: a.fullPath,
      publicId: a.publicId,
    })),
    purged: [],
    blockedByReference: [],
    failed: [],
    notFound: ids.filter((id) => !found.has(id)),
  };

  // Garde de référence — sauf force. Comptée pour tous, y compris en dry-run,
  // pour que la liste montre ce qui serait bloqué.
  if (!force) {
    const refs = await prisma.pageMediaReference.groupBy({
      by: ['mediaAssetId'],
      where: { mediaAssetId: { in: assets.map((a) => a.id) } },
      _count: { mediaAssetId: true },
    });
    const refCount = new Map(
      refs.map((r) => [r.mediaAssetId, r._count.mediaAssetId]),
    );
    for (const a of assets) {
      const n = refCount.get(a.id) ?? 0;
      if (n > 0) {
        report.blockedByReference.push({
          id: a.id,
          fullPath: a.fullPath,
          refs: n,
        });
      }
    }
  }

  if (dryRun) return report;

  const blockedIds = new Set(report.blockedByReference.map((b) => b.id));

  for (const asset of assets) {
    if (blockedIds.has(asset.id)) continue; // référencé, non forcé → sauté

    try {
      // 1) le binaire Cloudinary (tolérant à l'orphelin, comme deleteForever).
      try {
        const info = await getAssetInfo(asset.fullPath);
        await cloudinary.uploader.destroy(asset.fullPath, {
          type: 'authenticated',
          resource_type: info.resource_type,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!message.startsWith('Asset not found')) throw err;
        // orphelin : binaire déjà absent → on retire quand même la ligne.
      }

      // 2) la ligne DB.
      await prisma.mediaAsset.delete({ where: { id: asset.id } });
      report.purged.push({ id: asset.id, fullPath: asset.fullPath });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      report.failed.push({ id: asset.id, fullPath: asset.fullPath, error: message });
      break; // arrêt net
    }
  }

  if (report.purged.length > 0) invalidateResourcesCache();

  return report;
}


/* ─────────────────────────────────────────────────────────────────────── */
/*  Orphelins — lignes DB dont le binaire a disparu du stockage             */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Détecte les MediaAsset dont le binaire n'existe PLUS chez le provider.
 *
 * LECTURE SEULE. Teste l'existence via `VirtualStorage.getMetadata`, qui
 * dispatche Cloudinary (getAssetInfo) / R2 (HeadObject) et renvoie `null` si
 * l'objet est absent. Ne supprime rien.
 *
 * Un orphelin naît d'une suppression manuelle au dashboard, d'un vieux move
 * raté, ou d'un artefact de refacto : la ligne survit au binaire. La règle
 * « ce qui n'existe plus en stockage ne doit plus exister en DB » les vise.
 */
export type OrphanReport = {
  scanned: number;
  orphans: Array<{ id: string; fullPath: string; provider: 'cloudinary' | 'r2' }>;
};

export async function findOrphanAssets(
  prisma: PrismaClient,
  appRoot: string,
): Promise<OrphanReport> {
  const assets = await prisma.mediaAsset.findMany({
    where: { appRoot },
    select: { id: true, fullPath: true, publicId: true },
  });

  const storage = new VirtualStorage({ prisma, appRoot });
  const orphans: OrphanReport['orphans'] = [];

  for (const asset of assets) {
    const meta = await storage.getMetadata(asset.fullPath);
    if (meta === null) {
      orphans.push({
        id: asset.id,
        fullPath: asset.fullPath,
        provider: asset.publicId ? 'cloudinary' : 'r2',
      });
    }
  }

  return { scanned: assets.length, orphans };
}

/**
 * Supprime les LIGNES orphelines (binaire déjà absent → aucun appel de
 * suppression stockage). Garde de référence : une ligne orpheline encore
 * référencée par une page signale un problème plus grave (page pointant un
 * média fantôme) — on la laisse et on la signale, sauf `force`.
 *
 * `dryRun` (défaut) : liste, ne supprime rien.
 */
export type OrphanPurgeReport = {
  dryRun: boolean;
  orphansFound: number;
  purged: Array<{ id: string; fullPath: string }>;
  blockedByReference: Array<{ id: string; fullPath: string; refs: number }>;
};

export async function purgeOrphanAssets(
  prisma: PrismaClient,
  appRoot: string,
  options: { dryRun?: boolean; force?: boolean } = {},
): Promise<OrphanPurgeReport> {
  const dryRun = options.dryRun ?? true;
  const force = options.force ?? false;

  const { orphans } = await findOrphanAssets(prisma, appRoot);

  const report: OrphanPurgeReport = {
    dryRun,
    orphansFound: orphans.length,
    purged: [],
    blockedByReference: [],
  };

  const refs = await prisma.pageMediaReference.groupBy({
    by: ['mediaAssetId'],
    where: { mediaAssetId: { in: orphans.map((o) => o.id) } },
    _count: { mediaAssetId: true },
  });
  const refCount = new Map(
    refs.map((r) => [r.mediaAssetId, r._count.mediaAssetId]),
  );

  const toPurge: typeof orphans = [];
  for (const o of orphans) {
    const n = refCount.get(o.id) ?? 0;
    if (n > 0 && !force) {
      report.blockedByReference.push({ id: o.id, fullPath: o.fullPath, refs: n });
    } else {
      toPurge.push(o);
    }
  }

  if (dryRun) {
    report.purged = toPurge.map((o) => ({ id: o.id, fullPath: o.fullPath }));
    return report;
  }

  for (const o of toPurge) {
    await prisma.mediaAsset.delete({ where: { id: o.id } });
    report.purged.push({ id: o.id, fullPath: o.fullPath });
  }

  return report;
}
