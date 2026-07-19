import type { PrismaClient } from '@prisma/client';

import { getAssetInfo } from '@backend/modules/cloudinary/services/cloudinary.service';
import { parsePathToDestination } from '@backend/modules/media/services/parsePathToDestination';

/* ─────────────────────────────────────────────────────────────────────── */
/*  restoreMediaAssetsByPath — réparation d'une purge erronée              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Reconstruit des lignes `MediaAsset` supprimées à tort, à partir de la liste
 * EXACTE de leurs `fullPath` et des métadonnées Cloudinary natives.
 *
 * ─── Contexte ────────────────────────────────────────────────────────────
 *
 * Une détection d'orphelins boguée (elle interrogeait Cloudinary avec
 * l'extension, alors que le public_id n'en a pas) a déclaré orphelins 28
 * binaires bien présents, et une purge a supprimé leurs lignes. Les binaires
 * n'ont JAMAIS bougé — seules les lignes DB ont disparu. On les reconstruit.
 *
 * ─── Ce qui est restauré fidèlement vs approximé ─────────────────────────
 *
 * Fidèle (depuis Cloudinary / le chemin) : fullPath, publicId, bytes, format,
 * dimensions, mimeType, status, category/discipline (via
 * `parsePathToDestination`), filename, date de création Cloudinary.
 *
 * Approximé (irrécupérable sans la ligne d'origine) : `uploaderUserId` →
 * user technique « Legacy Import ». Le vrai uploader est perdu. Les fichiers
 * perso restent affichables (le finder liste par chemin), mais leur
 * category/discipline sera nulle (ils ne matchent pas la structure
 * cours/<catégorie>/<discipline>) — c'est attendu et sans conséquence
 * d'affichage.
 *
 * ─── Idempotent ──────────────────────────────────────────────────────────
 *
 * `fullPath` est @unique : on skip tout chemin déjà présent en base. Relancer
 * ne crée pas de doublon.
 */

const LEGACY_EMAIL = 'legacy-import@akfc.internal';

async function getLegacyImportUserId(prisma: PrismaClient): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: LEGACY_EMAIL },
    update: {},
    create: {
      email: LEGACY_EMAIL,
      password: 'legacy-import-no-login-' + Math.random().toString(36),
      firstName: 'Legacy',
      lastName: 'Import',
      pseudo: 'Legacy Import',
      emailVerified: false,
      isFirstLogin: false,
    },
    select: { id: true },
  });
  return user.id;
}

function toPublicId(fullPath: string): string {
  return fullPath.replace(/\.[^/.]+$/, '');
}

function mimeFromResourceType(
  resourceType: string,
  format: string | null,
): string {
  const fmt = (format ?? '').toLowerCase();
  if (resourceType === 'image') return `image/${fmt || 'jpeg'}`;
  if (resourceType === 'video') return `video/${fmt || 'mp4'}`;
  // 'raw' → documents. On mappe les formats courants, sinon octet-stream.
  const rawMap: Record<string, string> = {
    pdf: 'application/pdf',
    md: 'text/markdown',
    txt: 'text/plain',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return rawMap[fmt] ?? 'application/octet-stream';
}

export type RestoreReport = {
  dryRun: boolean;
  requested: number;
  restored: Array<{ fullPath: string; status: string; categoryId: number | null }>;
  skippedExisting: string[];
  failed: Array<{ fullPath: string; error: string }>;
};

export async function restoreMediaAssetsByPath(
  prisma: PrismaClient,
  appRoot: string,
  fullPaths: readonly string[],
  options: { dryRun?: boolean } = {},
): Promise<RestoreReport> {
  const dryRun = options.dryRun ?? true;

  const report: RestoreReport = {
    dryRun,
    requested: fullPaths.length,
    restored: [],
    skippedExisting: [],
    failed: [],
  };

  // Skip ce qui existe déjà (idempotence sur @unique fullPath).
  const existing = await prisma.mediaAsset.findMany({
    where: { appRoot, fullPath: { in: [...fullPaths] } },
    select: { fullPath: true },
  });
  const existingSet = new Set(existing.map((e) => e.fullPath));

  const toRestore = fullPaths.filter((p) => {
    if (existingSet.has(p)) {
      report.skippedExisting.push(p);
      return false;
    }
    return true;
  });

  if (dryRun) {
    // En dry-run on ne fait que dire ce qui serait tenté — pas d'appel réseau.
    for (const fullPath of toRestore) {
      report.restored.push({ fullPath, status: '(dry-run)', categoryId: null });
    }
    return report;
  }

  const legacyUserId = await getLegacyImportUserId(prisma);

  for (const fullPath of toRestore) {
    try {
      // 1) métadonnées Cloudinary natives (public_id SANS extension).
      const info = await getAssetInfo(toPublicId(fullPath));

      // 2) category/discipline/status/filename depuis le chemin.
      const parsed = await parsePathToDestination(prisma, fullPath, appRoot);

      const publicId = toPublicId(fullPath);
      const format = info.format ?? fullPath.split('.').pop() ?? null;
      const filename = fullPath.split('/').pop() ?? fullPath;

      // status : depuis le parse si dispo, sinon depuis le segment de chemin.
      const segments = fullPath.split('/');
      const statusFromPath =
        segments[1] === 'published' ? 'published' : 'pending';
      const status = parsed.ok ? parsed.destination.status : statusFromPath;

      await prisma.mediaAsset.create({
        data: {
          fullPath,
          publicId,
          cloudinaryAssetId: info.asset_id ?? null,
          secureUrl: null,
          resourceType: info.resource_type,
          mimeType: mimeFromResourceType(info.resource_type, format),
          format,
          originalFileName: filename,
          bytes: info.bytes ?? 0,
          appRoot,
          status,
          categoryId: parsed.ok ? parsed.destination.categoryId : null,
          disciplineId: parsed.ok ? parsed.destination.disciplineId : null,
          proposedDisciplineName: parsed.ok
            ? parsed.destination.proposedDisciplineName
            : null,
          uploaderUserId: legacyUserId,
          uploadedAt: info.created_at ? new Date(info.created_at) : new Date(),
        },
      });

      report.restored.push({
        fullPath,
        status,
        categoryId: parsed.ok ? parsed.destination.categoryId : null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      report.failed.push({ fullPath, error: message });
      // Pas d'arrêt net ici : chaque restauration est indépendante et on veut
      // récupérer le maximum. Les échecs sont listés pour retraitement.
    }
  }

  return report;
}