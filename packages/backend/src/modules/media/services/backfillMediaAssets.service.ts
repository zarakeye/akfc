/**
 * 🔄 Service de backfill MediaAsset
 *
 * One-shot : scrape Cloudinary `api.resources` pour récupérer tous les
 * assets sous `${appRoot}/pending/` et `${appRoot}/published/`, puis
 * crée les rows `MediaAsset` manquantes pour les fichiers antérieurs au
 * système de tracking.
 *
 * ─── Pourquoi ce service ──────────────────────────────────────────────
 *
 * Avant que `storage.registerUploadedAsset` soit appelé systématiquement
 * (mise en place historique du flow d'upload), des fichiers ont été
 * uploadés directement à Cloudinary sans qu'aucune row `MediaAsset` ne
 * soit créée en base. Ces fichiers existent physiquement mais sont
 * "orphelins" en DB.
 *
 * Sans backfill : le finder les affiche avec date/expéditeur inconnus.
 *
 * Avec backfill : on crée rétroactivement les rows MediaAsset à partir
 * des metadata Cloudinary natives (`created_at`, `bytes`, `format`,
 * `width`, `height`, `duration`, `resource_type`).
 *
 * ─── Stratégie de matching ────────────────────────────────────────────
 *
 *   - `categoryId` : déduit du segment de path après status, slugifié
 *     et matché contre `Category.type` slugifié. Pas de match → skip.
 *   - `disciplineId` : déduit du sous-segment, matché contre les
 *     disciplines de la category. Pas de match → laisse null + remplit
 *     `proposedDisciplineName` avec le slug brut (l'admin pourra corriger).
 *   - `uploaderUserId` : user technique "Legacy Import" créé automatiquement
 *     si absent. Convention : email `legacy-import@akfc.internal`.
 *   - `uploadedAt` : `created_at` de Cloudinary (date réelle d'upload).
 *   - `status` : déduit du segment de path (`pending` ou `published`).
 *
 * ─── Idempotence ──────────────────────────────────────────────────────
 *
 * Re-running le backfill ne crée pas de doublons : on skip tout publicId
 * déjà présent en base (`MediaAsset.publicId @unique` enforce ça
 * structurellement, mais on vérifie d'abord pour produire un report
 * détaillé).
 */

import { listAuthenticatedResources } from '@backend/modules/cloudinary/services/cloudinary.service';
import { prisma } from '@backend/prisma';

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

/**
 * Type LOCAL étendu pour ce que Cloudinary renvoie réellement au runtime.
 *
 * Le type exporté par `listAuthenticatedResources` ne déclare que le minimum
 * dont son usage canonique (l'adapter Cloudinary du finder) a besoin (`publicId`,
 * `url`, et quelques accessoires). Au runtime, l'API Cloudinary renvoie un objet
 * beaucoup plus riche (`bytes`, `width`, `height`, `duration`, `created_at`,
 * `resource_type`, `format`, etc.) — et c'est ce que le backfill exploite.
 *
 * Plutôt que de modifier la signature du service Cloudinary pour tout exposer
 * (ce qui pollue son contrat pour les autres callers), on définit ici le type
 * local "vrai" et on cast l'array reçu vers ce type. Si jamais Cloudinary
 * change son contrat de retour (peu probable), seul ce fichier doit s'adapter.
 */
type CloudinaryFullResource = {
  publicId: string;
  url: string;
  resourceType?: string;
  format?: string | null;
  bytes?: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  createdAt?: string;
};

export type BackfillReport = {
  scanned: {
    pending: number;
    published: number;
    total: number;
  };
  created: number;
  alreadyTracked: number;
  skipped: {
    count: number;
    reasons: Array<{ publicId: string; reason: string }>;
  };
  legacyUserId: string;
  durationMs: number;
};

type ResolvedResource = {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format: string | null;
  bytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  createdAt: Date;
  mimeType: string;
  // Segments dérivés du publicId
  status: 'pending' | 'published';
  categorySlug: string;
  disciplineSlug: string | null;
  filename: string;
  fullPath: string;
};

/* -------------------------------------------------------------------------- */
/*                                 HELPERS                                    */
/* -------------------------------------------------------------------------- */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Déduit MIME type approximatif depuis resource_type + format.
 * Pour les images/vidéos c'est précis ; pour les `raw`, on retombe sur
 * `application/octet-stream` si le format est inconnu.
 */
function deriveMimeType(resourceType: string, format: string | null): string {
  if (resourceType === 'image' && format) return `image/${format}`;
  if (resourceType === 'video' && format) {
    // Vidéos : Cloudinary catégorise aussi les audios en `video`
    const audioFormats = ['mp3', 'm4a', 'ogg', 'wav', 'oga'];
    if (audioFormats.includes(format.toLowerCase())) {
      return format === 'mp3' ? 'audio/mpeg' : `audio/${format}`;
    }
    return `video/${format}`;
  }
  if (resourceType === 'raw' && format) {
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      txt: 'text/plain',
      md: 'text/markdown',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      zip: 'application/zip',
    };
    return map[format.toLowerCase()] ?? 'application/octet-stream';
  }
  return 'application/octet-stream';
}

/**
 * Décompose un publicId Cloudinary du type :
 *   `AKFC/pending/<categorySlug>/<disciplineSlug>/<filename>`
 *
 * Retourne `null` si le publicId ne match pas ce pattern (asset hors
 * de la structure attendue — typiquement à la racine ou dans le bin).
 */
function parsePublicId(
  publicId: string,
  appRoot: string,
): {
  status: 'pending' | 'published';
  categorySlug: string;
  disciplineSlug: string | null;
  filename: string;
} | null {
  const parts = publicId.split('/');
  // Format attendu: <appRoot> / (pending|published) / <category> [/ <discipline>] / <filename>
  if (parts.length < 4) return null;
  if (parts[0] !== appRoot) return null;
  if (parts[1] !== 'pending' && parts[1] !== 'published') return null;

  const status = parts[1] as 'pending' | 'published';
  const categorySlug = parts[2];

  // Cas: AKFC/<status>/<category>/<filename> (pas de discipline)
  if (parts.length === 4) {
    return {
      status,
      categorySlug,
      disciplineSlug: null,
      filename: parts[3],
    };
  }

  // Cas: AKFC/<status>/<category>/<discipline>/<filename> (avec discipline)
  // Si le path est plus profond (sous-folders), on prend juste le 1er
  // discipline-level et on concatène le reste en filename.
  return {
    status,
    categorySlug,
    disciplineSlug: parts[3],
    filename: parts.slice(4).join('/'),
  };
}

/**
 * Récupère (ou crée) le user technique "Legacy Import" utilisé comme
 * `uploaderUserId` pour les rows backfillées. Email convention :
 * `legacy-import@akfc.internal` (TLD non routable, pas de risque de
 * conflit avec un vrai user).
 *
 * Le password est un placeholder fixe — ce user ne sert qu'à porter
 * la référence dans MediaAsset.uploader, il ne se connecte jamais.
 * Pour éviter qu'il soit utilisable, on pourrait poser `emailVerified: false`
 * et bloquer son login côté auth, mais c'est out-of-scope ici.
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
      // Mot de passe non-utilisable : hash random, jamais utilisé pour login
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

/* -------------------------------------------------------------------------- */
/*                              MAIN SERVICE                                  */
/* -------------------------------------------------------------------------- */

export async function backfillMediaAssets(appRoot: string): Promise<BackfillReport> {
  const startedAt = Date.now();

  // 1. Récupère les ressources Cloudinary sous pending/ et published/
  //    (skip bin/ — les fichiers en corbeille n'ont pas vocation à être backfillés)
  const pendingPrefix = `${appRoot}/pending`;
  const publishedPrefix = `${appRoot}/published`;

  // Cast vers le type local étendu : Cloudinary renvoie toujours bytes/width/etc.
  // au runtime, même si la signature publique du service ne les expose pas.
  // Voir le commentaire du type `CloudinaryFullResource` plus haut.
  const [pendingResources, publishedResources] = (await Promise.all([
    listAuthenticatedResources(pendingPrefix),
    listAuthenticatedResources(publishedPrefix),
  ])) as unknown as [CloudinaryFullResource[], CloudinaryFullResource[]];

  // 2. Parse + filtre les ressources éligibles
  const allResources = [...pendingResources, ...publishedResources];
  const resolved: ResolvedResource[] = [];
  const skipReasons: Array<{ publicId: string; reason: string }> = [];

  for (const r of allResources) {
    const parsed = parsePublicId(r.publicId, appRoot);
    if (!parsed) {
      skipReasons.push({
        publicId: r.publicId,
        reason: `publicId hors structure ${appRoot}/<status>/<category>/... — ignoré`,
      });
      continue;
    }

    resolved.push({
      publicId: r.publicId,
      secureUrl: r.url,
      resourceType: r.resourceType ?? 'image',
      format: r.format ?? null,
      bytes: r.bytes ?? 0,
      width: r.width ?? null,
      height: r.height ?? null,
      duration: r.duration ?? null,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      mimeType: deriveMimeType(r.resourceType ?? 'image', r.format ?? null),
      status: parsed.status,
      categorySlug: parsed.categorySlug,
      disciplineSlug: parsed.disciplineSlug,
      filename: parsed.filename,
      fullPath: `${r.publicId}${r.format ? '.' + r.format : ''}`,
    });
  }

  if (resolved.length === 0) {
    return {
      scanned: {
        pending: pendingResources.length,
        published: publishedResources.length,
        total: allResources.length,
      },
      created: 0,
      alreadyTracked: 0,
      skipped: { count: skipReasons.length, reasons: skipReasons },
      legacyUserId: '',
      durationMs: Date.now() - startedAt,
    };
  }

  // 3. Filtre les publicIds déjà présents en base (idempotence)
  const existingAssets = await prisma.mediaAsset.findMany({
    where: { publicId: { in: resolved.map((r) => r.publicId) } },
    select: { publicId: true },
  });
  const existingPublicIds = new Set(existingAssets.map((a) => a.publicId));

  const toCreate = resolved.filter((r) => !existingPublicIds.has(r.publicId));

  // 4. Pré-fetch les Category et Discipline pour matching (1 requête chacune)
  //    plutôt que N requêtes en boucle.
  const allCategories = await prisma.category.findMany({
    select: { id: true, type: true },
  });
  const categoryBySlug = new Map(
    allCategories.map((c) => [slugify(c.type), c.id]),
  );

  const allDisciplines = await prisma.discipline.findMany({
    select: { id: true, name: true, categoryId: true },
  });
  // Index discipline par (categoryId, slug)
  const disciplineByKey = new Map<string, number>();
  for (const d of allDisciplines) {
    disciplineByKey.set(`${d.categoryId}:${slugify(d.name)}`, d.id);
  }

  // 5. Récupère/crée le user Legacy Import
  const legacyUserId = await getOrCreateLegacyImportUser();

  // 6. Crée les MediaAsset en batch
  let createdCount = 0;
  for (const r of toCreate) {
    const categoryId = categoryBySlug.get(r.categorySlug);
    if (!categoryId) {
      skipReasons.push({
        publicId: r.publicId,
        reason: `Aucune Category trouvée pour le slug '${r.categorySlug}'`,
      });
      continue;
    }

    let disciplineId: number | null = null;
    let proposedDisciplineName: string | null = null;
    if (r.disciplineSlug) {
      const matched = disciplineByKey.get(`${categoryId}:${r.disciplineSlug}`);
      if (matched) {
        disciplineId = matched;
      } else {
        // Pas de match → on garde le slug brut comme proposition, l'admin
        // pourra corriger via l'UI normale plus tard.
        proposedDisciplineName = r.disciplineSlug;
      }
    }

    try {
      await prisma.mediaAsset.create({
        data: {
          publicId: r.publicId,
          secureUrl: r.secureUrl,
          resourceType: r.resourceType,
          mimeType: r.mimeType,
          format: r.format,
          fullPath: r.fullPath,
          originalFileName: r.filename,
          bytes: r.bytes,
          width: r.width,
          height: r.height,
          duration: r.duration,
          appRoot: appRoot,
          status: r.status,
          categoryId,
          disciplineId,
          proposedDisciplineName,
          uploaderUserId: legacyUserId,
          uploadedAt: r.createdAt, // ← date Cloudinary réelle d'upload
        },
      });
      createdCount++;
    } catch (err) {
      skipReasons.push({
        publicId: r.publicId,
        reason: `Insert failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  return {
    scanned: {
      pending: pendingResources.length,
      published: publishedResources.length,
      total: allResources.length,
    },
    created: createdCount,
    alreadyTracked: existingPublicIds.size,
    skipped: { count: skipReasons.length, reasons: skipReasons },
    legacyUserId,
    durationMs: Date.now() - startedAt,
  };
}
