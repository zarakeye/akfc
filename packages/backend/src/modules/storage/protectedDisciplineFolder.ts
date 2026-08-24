import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

/**
 * Protège les dossiers adossés aux DISCIPLINES / CATÉGORIES. Contrairement aux
 * espaces de groupe/perso/avatars (préfixe fixe → regex), le chemin d'une
 * discipline dépend de slugs DYNAMIQUES :
 *
 *   - conteneur de catégorie : `${appRoot}/<slug(category.type)>`
 *   - conteneur des nouvelles : `${appRoot}/<slug(category.type)>/new`
 *   - dossier de discipline   : `${appRoot}/<slug(category.type)>/<slug(name)>`
 *
 * La détection interroge donc la base. Un chemin PLUS PROFOND (contenu d'un
 * dossier de discipline) n'est PAS protégé — les fichiers restent supprimables.
 *
 * Doit rester aligné avec `resolvePendingUploadFolder` (même slugify + fallback
 * `disc-<id>` quand le nom slugifie en chaîne vide).
 */
const SLUG_OPTIONS = { lower: true, strict: true } as const;
function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

export async function isProtectedDisciplineFolderPath(
  prisma: PrismaClient,
  appRoot: string,
  path: string,
): Promise<boolean> {
  const prefix = `${appRoot}/`;
  if (!path.startsWith(prefix)) return false;
  const segs = path.slice(prefix.length).split("/");

  // Conteneur de catégorie : `${appRoot}/<slug(type)>`
  if (segs.length === 1) {
    const cats = await prisma.category.findMany({ select: { type: true } });
    return cats.some((c) => slug(c.type) === segs[0]);
  }

  // `${appRoot}/<cat>/<disc>` : dossier de discipline ou conteneur `new`
  if (segs.length === 2) {
    const [catSeg, second] = segs;
    const cat = (
      await prisma.category.findMany({ select: { id: true, type: true } })
    ).find((c) => slug(c.type) === catSeg);
    if (!cat) return false;
    if (second === "new") return true;
    const discs = await prisma.discipline.findMany({
      where: { categoryId: cat.id },
      select: { id: true, name: true },
    });
    return discs.some((d) => (slug(d.name) || `disc-${d.id}`) === second);
  }

  // Plus profond = contenu d'un dossier de discipline → supprimable.
  return false;
}
