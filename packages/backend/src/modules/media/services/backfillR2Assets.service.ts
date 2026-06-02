import { ListObjectsV2Command, HeadObjectCommand, type _Object as S3Object } from '@aws-sdk/client-s3';
import { prisma } from '@backend/prisma';
import { getR2Client, getR2Bucket } from '@backend/modules/storage/adapters/r2/client';
import {
  parsePathToDestination,
  buildCategoryCache,
  buildDisciplineCache,
} from '@backend/modules/media/services/parsePathToDestination';

/**
 * 🔄 Service de backfill MediaAsset depuis R2
 *
 * Équivalent de `backfillMediaAssets.service.ts` (Cloudinary) pour R2.
 * Scanne le bucket R2 sous `${appRoot}/pending` et `${appRoot}/published`
 * et crée une row MediaAsset par objet trouvé.
 *
 * ─── Pourquoi nécessaire ───────────────────────────────────────────────
 *
 * Avant Phase 2, `storage.registerR2Upload` ne créait aucune row MediaAsset.
 * Les fichiers R2 uploadés avant ce chantier sont donc "orphelins" en DB.
 * Sans ce backfill :
 *   - Searchbar ne les trouve pas
 *   - Tri par Date/Expéditeur les place dans "Date inconnue"/"Expéditeur inconnu"
 *   - Description form ne peut pas être posée sur eux
 *
 * Une fois ce backfill exécuté, tous les fichiers R2 historiques sont
 * trackés au même niveau que les Cloudinary backfillés.
 *
 * ─── Idempotence ──────────────────────────────────────────────────────
 *
 * Re-running ne crée pas de doublons : on filtre via `existingFullPaths`
 * Set avant insert. La contrainte UNIQUE sur `fullPath` (après tighten
 * migration) renforce structurellement, mais on vérifie avant pour
 * produire un report détaillé.
 *
 * ─── Stratégie d'upload pour les meta ─────────────────────────────────
 *
 * Pour chaque objet R2 :
 *   - `fullPath` = clé R2 directe
 *   - `mimeType` = HeadObject ContentType (R2 le stocke à l'upload)
 *   - `bytes` = HeadObject ContentLength
 *   - `uploadedAt` = HeadObject LastModified (vraie date d'upload R2)
 *   - `originalFileName` = dernier segment du path (slugifié au moment de
 *     l'upload originel, donc on récupère le nom tel quel)
 *   - `uploaderUserId` = user technique "Legacy Import" (créé par le
 *     backfill Cloudinary, on le réutilise)
 *   - `categoryId`/`disciplineId` = parsés depuis le path via `parsePathToDestination`
 */

export type BackfillR2Report = {
  scanned: number;
  created: number;
  alreadyTracked: number;
  skipped: {
    count: number;
    reasons: Array<{ key: string; reason: string }>;
  };
  legacyUserId: string;
  durationMs: number;
};

/**
 * Récupère le user "Legacy Import" (créé par le backfill Cloudinary).
 * Si absent, on le crée — même convention.
 */
async function getOrCreateLegacyImportUser(): Promise<string> {
  const LEGACY_EMAIL = 'legacy-import@akfc.internal';

  const existing = await prisma.user.findUnique({
    where: { email: LEGACY_EMAIL },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
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
  return created.id;
}

/**
 * Liste tous les objets sous un préfixe R2 (pagination complète).
 */
async function listAllR2ObjectsUnder(prefix: string): Promise<S3Object[]> {
  const s3 = getR2Client();
  const Bucket = getR2Bucket();
  const all: S3Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket,
        Prefix: prefix.endsWith('/') ? prefix : `${prefix}/`,
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      }),
    );
    if (response.Contents) {
      all.push(...response.Contents);
    }
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return all;
}

export async function backfillR2Assets(appRoot: string): Promise<BackfillR2Report> {
  const startedAt = Date.now();

  // 1. Liste tous les objets R2 sous pending/ et published/
  const [pendingObjects, publishedObjects] = await Promise.all([
    listAllR2ObjectsUnder(`${appRoot}/pending`),
    listAllR2ObjectsUnder(`${appRoot}/published`),
  ]);

  const allObjects = [...pendingObjects, ...publishedObjects].filter(
    (o): o is S3Object & { Key: string } => Boolean(o.Key),
  );

  if (allObjects.length === 0) {
    return {
      scanned: 0,
      created: 0,
      alreadyTracked: 0,
      skipped: { count: 0, reasons: [] },
      legacyUserId: '',
      durationMs: Date.now() - startedAt,
    };
  }

  // 2. Filtre les fullPaths déjà trackés (idempotence)
  const allKeys = allObjects.map((o) => o.Key);
  const existing = await prisma.mediaAsset.findMany({
    where: { fullPath: { in: allKeys } },
    select: { fullPath: true },
  });
  const existingPaths = new Set(existing.map((e) => e.fullPath));

  const toProcess = allObjects.filter((o) => !existingPaths.has(o.Key));

  // 3. Pré-charge les caches Category/Discipline (1 lookup chacun)
  const [categoryBySlug, disciplineByKey] = await Promise.all([
    buildCategoryCache(prisma),
    buildDisciplineCache(prisma),
  ]);
  const caches = { categoryBySlug, disciplineByKey };

  // 4. Récupère le user Legacy Import
  const legacyUserId = await getOrCreateLegacyImportUser();

  // 5. Pour chaque objet à process : parse path, HeadObject pour mime, create
  //
  // On parallélise par batch de 10 pour éviter de saturer R2 avec 100+ HeadObject
  // en simultané (et d'épuiser la DB pool).
  const skipReasons: Array<{ key: string; reason: string }> = [];
  let createdCount = 0;
  const BATCH_SIZE = 10;

  const s3 = getR2Client();
  const Bucket = getR2Bucket();

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (obj) => {
        const key = obj.Key;

        // Parse path → destination
        const parsed = await parsePathToDestination(prisma, key, appRoot, caches);
        if (!parsed.ok) {
          skipReasons.push({ key, reason: parsed.reason });
          return;
        }

        // HeadObject pour récupérer le mime + size officiels
        let mimeType: string;
        try {
          const head = await s3.send(new HeadObjectCommand({ Bucket, Key: key }));
          mimeType = head.ContentType ?? inferMimeFromKey(key);
        } catch {
          mimeType = inferMimeFromKey(key);
        }

        try {
          await prisma.mediaAsset.create({
            data: {
              fullPath: key,
              publicId: null,
              secureUrl: null,
              resourceType: null,
              mimeType,
              format: extensionOf(key),
              originalFileName: parsed.destination.filename,
              bytes: obj.Size ?? 0,
              appRoot,
              status: parsed.destination.status,
              categoryId: parsed.destination.categoryId,
              disciplineId: parsed.destination.disciplineId,
              proposedDisciplineName: parsed.destination.proposedDisciplineName,
              uploaderUserId: legacyUserId,
              uploadedAt: obj.LastModified ?? new Date(),
            },
          });
          createdCount++;
        } catch (err) {
          skipReasons.push({
            key,
            reason: `Insert failed: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
      }),
    );
  }

  return {
    scanned: allObjects.length,
    created: createdCount,
    alreadyTracked: existingPaths.size,
    skipped: { count: skipReasons.length, reasons: skipReasons },
    legacyUserId,
    durationMs: Date.now() - startedAt,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function extensionOf(path: string): string | undefined {
  const i = path.lastIndexOf('.');
  const lastSlash = path.lastIndexOf('/');
  if (i === -1 || i < lastSlash || i === path.length - 1) return undefined;
  return path.slice(i + 1).toLowerCase();
}

function inferMimeFromKey(key: string): string {
  const ext = extensionOf(key);
  if (!ext) return 'application/octet-stream';
  const map: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    flac: 'audio/flac',
    pdf: 'application/pdf',
    txt: 'text/plain',
    md: 'text/markdown',
    markdown: 'text/markdown',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    zip: 'application/zip',
  };
  return map[ext] ?? 'application/octet-stream';
}
