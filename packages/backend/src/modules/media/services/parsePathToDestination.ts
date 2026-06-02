import type { PrismaClient } from '@prisma/client';

/**
 * 🧭 parsePathToDestination — parse un path (Cloudinary ou R2) et résout
 * la destination métier associée (categoryId, disciplineId).
 *
 * ─── Pourquoi ce service ──────────────────────────────────────────────
 *
 * Le backfill R2 historique (`backfillR2Assets.service.ts`) n'a aucune
 * autre info que le path R2 pour reconstituer la destination métier.
 * On parse le path selon la convention AKFC :
 *
 *   `${appRoot}/${status}/${categorySlug}/[${disciplineSlug}/]${filename}`
 *
 * et on lookup les FK en DB.
 *
 * ─── Pourquoi PAS utilisé pendant `registerR2Upload` direct ───────────
 *
 * Pour les uploads en live, le frontend passe la `destination` (categoryId
 * direct, pas de parsing) — c'est plus fiable que parser un path qui peut
 * avoir des slugs ambigus. Le parsing path-only est utilisé QUE pour le
 * backfill historique où on n'a pas la destination originale.
 *
 * ─── Stratégie pas-de-match ───────────────────────────────────────────
 *
 * Si le slug du path ne mappe à aucune Category existante : skip avec
 * message d'erreur. Le caller (service backfill) décide quoi en faire
 * (typiquement : compter dans `skipped.reasons` et continuer).
 */

export type ParsedDestination = {
  status: 'pending' | 'published';
  categoryId: number;
  disciplineId: number | null;
  proposedDisciplineName: string | null;
  filename: string;
};

export type ParseResult =
  | { ok: true; destination: ParsedDestination }
  | { ok: false; reason: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse un path AKFC et résout la destination métier.
 *
 * Le paramètre `lookupCaches` permet de pré-charger les Category/Discipline
 * une seule fois pour un batch (évite N lookups DB lors d'un backfill de
 * 100+ assets).
 */
export async function parsePathToDestination(
  prisma: PrismaClient,
  fullPath: string,
  appRoot: string,
  lookupCaches?: {
    categoryBySlug: Map<string, number>;
    disciplineByKey: Map<string, number>;
  },
): Promise<ParseResult> {
  const parts = fullPath.split('/');

  // Structure attendue : appRoot / (pending|published) / <category> [/ <discipline>] / <filename>
  if (parts.length < 4) {
    return {
      ok: false,
      reason: `Path trop court (attendu ≥ 4 segments) : ${fullPath}`,
    };
  }
  if (parts[0] !== appRoot) {
    return {
      ok: false,
      reason: `Path hors appRoot (attendu "${appRoot}", reçu "${parts[0]}") : ${fullPath}`,
    };
  }
  if (parts[1] !== 'pending' && parts[1] !== 'published') {
    return {
      ok: false,
      reason: `Status invalide (attendu pending|published, reçu "${parts[1]}") : ${fullPath}`,
    };
  }

  const status = parts[1] as 'pending' | 'published';
  const categorySlug = parts[2];

  // Charger ou utiliser le cache pour Category
  const categoryBySlug = lookupCaches?.categoryBySlug ?? await buildCategoryCache(prisma);
  const categoryId = categoryBySlug.get(categorySlug);
  if (!categoryId) {
    return {
      ok: false,
      reason: `Aucune Category trouvée pour le slug '${categorySlug}'`,
    };
  }

  // Cas: appRoot/status/category/filename (pas de discipline)
  if (parts.length === 4) {
    return {
      ok: true,
      destination: {
        status,
        categoryId,
        disciplineId: null,
        proposedDisciplineName: null,
        filename: parts[3],
      },
    };
  }

  // Cas: appRoot/status/category/discipline/filename
  const disciplineSlug = parts[3];
  const filename = parts.slice(4).join('/');

  const disciplineByKey = lookupCaches?.disciplineByKey ?? await buildDisciplineCache(prisma);
  const disciplineId = disciplineByKey.get(`${categoryId}:${disciplineSlug}`) ?? null;

  // Pas de match discipline → on garde le slug brut comme proposition
  const proposedDisciplineName = disciplineId === null ? disciplineSlug : null;

  return {
    ok: true,
    destination: {
      status,
      categoryId,
      disciplineId,
      proposedDisciplineName,
      filename,
    },
  };
}

/**
 * Pré-charge le cache Category (slugifié → id) pour batch processing.
 */
export async function buildCategoryCache(
  prisma: PrismaClient,
): Promise<Map<string, number>> {
  const allCategories = await prisma.category.findMany({
    select: { id: true, type: true },
  });
  return new Map(allCategories.map((c) => [slugify(c.type), c.id]));
}

/**
 * Pré-charge le cache Discipline (`${categoryId}:${slug}` → id).
 */
export async function buildDisciplineCache(
  prisma: PrismaClient,
): Promise<Map<string, number>> {
  const allDisciplines = await prisma.discipline.findMany({
    select: { id: true, name: true, categoryId: true },
  });
  const map = new Map<string, number>();
  for (const d of allDisciplines) {
    map.set(`${d.categoryId}:${slugify(d.name)}`, d.id);
  }
  return map;
}
