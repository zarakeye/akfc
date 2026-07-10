/**
 * prisma/backfill-navigation.ts
 *
 * Backfill one-shot du socle navigation. À exécuter ENTRE la migration
 * phase A (champs ajoutés en nullable) et la phase B (resserrage).
 *
 *   pnpm tsx prisma/backfill-navigation.ts
 *
 * Idempotent : re-lançable sans effet de bord (skip ce qui est déjà fait).
 *
 *   1. Crée une `DisciplineFamily` par valeur distincte de `family`.
 *   2. Relie chaque discipline à sa famille (`familyId`).
 *   3. Génère les `slug` manquants de Discipline / Stage / Event.
 *
 * `slugify` vient du module partagé (pur, sans zod). `ensureUniqueSlug`
 * est local : c'est un helper de génération en masse qui n'a de sens que
 * dans ce script.
 */

import { PrismaClient } from "@prisma/client";
import { slugify } from "@contracts/slug/slugify";

const prisma = new PrismaClient();

/**
 * Génère un slug unique à partir d'une base, en évitant les collisions
 * avec un ensemble de slugs déjà pris (suffixe -2, -3, …). Mute `taken`.
 */
function ensureUniqueSlug(base: string, taken: Set<string>): string {
  const root = slugify(base) || "item";
  if (!taken.has(root)) {
    taken.add(root);
    return root;
  }
  let n = 2;
  while (taken.has(`${root}-${n}`)) n += 1;
  const result = `${root}-${n}`;
  taken.add(result);
  return result;
}

async function backfillFamilies(): Promise<void> {
  // En phase A, `family` (String) coexiste avec `familyId`. On lit le
  // legacy via une requête brute pour ne pas dépendre du type généré.
  const rows = await prisma.$queryRaw<
    { id: number; name: string; family: string | null; familyId: number | null }[]
  >`SELECT id, name, family, "familyId" FROM "Discipline"`;

  const existing = await prisma.disciplineFamily.findMany();
  const idByName = new Map<string, number>(existing.map((f) => [f.name, f.id]));
  const takenSlugs = new Set<string>(existing.map((f) => f.slug));

  const labels: string[] = [];
  for (const r of rows) {
    const label = r.family?.trim();
    if (label && !labels.includes(label)) labels.push(label);
  }

  let sortOrder = existing.length;
  for (const label of labels) {
    if (idByName.has(label)) continue;
    const slug = ensureUniqueSlug(label, takenSlugs);
    const created = await prisma.disciplineFamily.create({
      data: { name: label, slug, sortOrder: sortOrder++ },
    });
    idByName.set(label, created.id);
    console.log(`  + famille « ${label} » → /${slug}`);
  }

  let linked = 0;
  for (const r of rows) {
    const label = r.family?.trim();
    if (!label || r.familyId !== null) continue;
    await prisma.discipline.update({
      where: { id: r.id },
      data: { familyId: idByName.get(label) },
    });
    linked += 1;
  }
  console.log(`  ${idByName.size} famille(s), ${linked} discipline(s) reliée(s).`);
}

async function backfillSlugs(
  table: "Discipline" | "Stage" | "Event",
  sourceField: "name" | "label",
): Promise<void> {
  const rows = await prisma.$queryRawUnsafe<
    { id: number; source: string; slug: string | null }[]
  >(`SELECT id, "${sourceField}" AS source, slug FROM "${table}"`);

  const taken = new Set<string>();
  for (const r of rows) if (r.slug) taken.add(r.slug);

  let filled = 0;
  for (const r of rows) {
    if (r.slug) continue;
    const slug = ensureUniqueSlug(r.source, taken);
    await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET slug = $1 WHERE id = $2`,
      slug,
      r.id,
    );
    filled += 1;
  }
  console.log(`  ${table} : ${filled} slug(s) généré(s).`);
}

async function main(): Promise<void> {
  console.log("Backfill navigation —");
  console.log("Familles de disciplines :");
  await backfillFamilies();
  console.log("Slugs :");
  await backfillSlugs("Discipline", "name");
  await backfillSlugs("Stage", "label");
  await backfillSlugs("Event", "label");
  console.log("Terminé.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());