import type { Prisma, PrismaClient } from "@prisma/client";
import slugify from "slugify";

/**
 * Segments de STOCKAGE des catégories et des disciplines.
 *
 * Le dossier d'une catégorie est `${appRoot}/<segment de catégorie>`, celui d'une discipline
 * `${appRoot}/<segment de catégorie>/<segment de discipline>`. Ces segments sont FIGÉS à la
 * création, dans la colonne `storageSegment` : le nom d'une discipline ou le libellé d'une
 * catégorie peuvent changer sans que leurs fichiers changent de dossier. Le nom affiché dans le
 * finder vient d'un FolderLabel (`ensureDomainFolderLabels`, et à chaque renommage).
 *
 * Avant cette colonne, le segment était RECALCULÉ à partir du nom : renommer une discipline
 * envoyait les nouveaux fichiers dans un autre dossier, et laissait les anciens dans un dossier
 * qui n'était plus protégé. Les lignes créées avant la colonne reçoivent, au démarrage
 * (`ensureStorageSegments`), exactement le segment qu'elles avaient : `legacy…Segment`, le
 * calcul d'origine, conservé à l'identique pour cela.
 */

const SLUG_OPTIONS = { lower: true, strict: true } as const;

/** Segment historique de la catégorie « Cours » (la catégorie se reconnaît à sa clé, `course`). */
const COURSES_SEGMENT = "courses";

/** Calcul d'origine pour une catégorie : « Cours » → `courses`, sinon le slug du libellé. */
export function legacyCategorySegment(type: string): string {
  if (type === "Cours") return COURSES_SEGMENT;
  return slugify(type, SLUG_OPTIONS);
}

/** Calcul d'origine pour une discipline : le slug du nom, ou `disc-<id>` s'il est vide. */
export function legacyDisciplineSegment(d: { id: number; name: string }): string {
  return slugify(d.name, SLUG_OPTIONS) || `disc-${d.id}`;
}

/** Segment d'une catégorie : la colonne, ou (ligne pas encore complétée) le calcul d'origine. */
export function categorySegment(c: { type: string; storageSegment: string | null }): string {
  return c.storageSegment ?? legacyCategorySegment(c.type);
}

/** Segment d'une discipline : la colonne, ou (ligne pas encore complétée) le calcul d'origine. */
export function disciplineSegment(d: { id: number; name: string; storageSegment: string | null }): string {
  return d.storageSegment ?? legacyDisciplineSegment(d);
}

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Segment d'une NOUVELLE catégorie : le slug du libellé, suffixé (`-2`, `-3`…) s'il est déjà pris.
 * Deux catégories ne partagent jamais un dossier.
 */
export async function newCategorySegment(db: Db, type: string): Promise<string> {
  const base = legacyCategorySegment(type) || "category";
  const taken = new Set(
    (await db.category.findMany({ select: { type: true, storageSegment: true } })).map(categorySegment),
  );
  return firstFree(base, taken);
}

/**
 * Segment d'une NOUVELLE discipline dans sa catégorie : le slug du nom, suffixé s'il est déjà pris.
 * « Kung-fu » et « Kung Fu » auraient sinon partagé le même dossier.
 */
export async function newDisciplineSegment(db: Db, categoryId: number, name: string): Promise<string> {
  const base = slugify(name, SLUG_OPTIONS) || "discipline";
  const taken = new Set(
    (
      await db.discipline.findMany({
        where: { categoryId },
        select: { id: true, name: true, storageSegment: true },
      })
    ).map(disciplineSegment),
  );
  return firstFree(base, taken);
}

function firstFree(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/**
 * Complète au démarrage les lignes sans segment, avec le calcul d'origine : chaque catégorie et
 * chaque discipline garde le dossier qu'elle avait. Une collision (deux disciplines d'une même
 * catégorie dont les noms donnent le même slug, et qui partageaient donc déjà un dossier) laisse
 * la seconde sans segment, signalée dans le journal : elle continue d'utiliser le calcul d'origine
 * jusqu'à ce qu'un administrateur tranche.
 */
export async function ensureStorageSegments(prisma: PrismaClient): Promise<{ filled: number; conflicts: string[] }> {
  let filled = 0;
  const conflicts: string[] = [];

  const categories = await prisma.category.findMany({
    where: { storageSegment: null },
    select: { id: true, type: true },
  });
  for (const c of categories) {
    const segment = legacyCategorySegment(c.type);
    const clash = await prisma.category.findFirst({ where: { storageSegment: segment }, select: { id: true } });
    if (clash) {
      conflicts.push(`catégorie « ${c.type} » (${segment})`);
      continue;
    }
    await prisma.category.update({ where: { id: c.id }, data: { storageSegment: segment } });
    filled++;
  }

  const disciplines = await prisma.discipline.findMany({
    where: { storageSegment: null },
    select: { id: true, name: true, categoryId: true },
    orderBy: { id: "asc" },
  });
  for (const d of disciplines) {
    const segment = legacyDisciplineSegment(d);
    const clash = await prisma.discipline.findFirst({
      where: { categoryId: d.categoryId, storageSegment: segment },
      select: { id: true },
    });
    if (clash) {
      conflicts.push(`discipline « ${d.name} » (${segment})`);
      continue;
    }
    await prisma.discipline.update({ where: { id: d.id }, data: { storageSegment: segment } });
    filled++;
  }

  return { filled, conflicts };
}

/** Chemin du dossier d'une catégorie. */
export function categoryFolderPath(appRoot: string, c: { type: string; storageSegment: string | null }): string {
  return `${appRoot}/${categorySegment(c)}`;
}

/** Chemin du dossier d'une discipline. */
export function disciplineFolderPath(
  appRoot: string,
  c: { type: string; storageSegment: string | null },
  d: { id: number; name: string; storageSegment: string | null },
): string {
  return `${appRoot}/${categorySegment(c)}/${disciplineSegment(d)}`;
}

/**
 * Pose le libellé affiché d'un dossier (le finder montre « Tchoy Lee Fut », pas `tchoy-lee-fut`).
 * Appelé au démarrage pour tous les dossiers du domaine, et à chaque renommage.
 */
export async function setFolderLabel(db: Db, path: string, displayName: string): Promise<void> {
  await db.folderLabel.upsert({
    where: { path },
    update: { displayName },
    create: { path, displayName },
  });
}
