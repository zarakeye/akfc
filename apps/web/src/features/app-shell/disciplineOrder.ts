/**
 * L'ordre des disciplines du site, à un seul endroit : celui du menu « Nos disciplines ».
 *
 * Les familles par leur rang (`sortOrder`, réglé dans le tableau de bord), puis par nom ; dans une
 * famille, les disciplines par nom ; les disciplines sans famille à la fin. Le menu et la galerie
 * publique le suivent tous deux : changer le rang d'une famille les réordonne ensemble, et
 * renommer une discipline ne la déplace qu'à sa place alphabétique.
 */
export type FamilyRank = { name: string; sortOrder: number };

/** Ordre des familles ; `null` (sans famille) à la fin. */
export function compareFamilies(a: FamilyRank | null, b: FamilyRank | null): number {
  if (!a || !b) return a ? -1 : b ? 1 : 0;
  return a.sortOrder - b.sortOrder || compareNames(a.name, b.name);
}

/** Ordre des noms (disciplines, familles), en français quel que soit le navigateur. */
export function compareNames(a: string, b: string): number {
  return a.localeCompare(b, "fr");
}

/** Ordre des disciplines : leur famille d'abord, puis leur nom. */
export function compareDisciplines(
  a: { name: string; family: FamilyRank | null },
  b: { name: string; family: FamilyRank | null },
): number {
  return compareFamilies(a.family, b.family) || compareNames(a.name, b.name);
}
