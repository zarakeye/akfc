/**
 * Où chercher depuis un espace de groupe.
 *
 * Les espaces sont rangés à plat dans le stockage, et imbriqués à l'affichage
 * selon la hiérarchie des groupes. Chercher dans un espace, c'est donc
 * chercher sous son chemin ET sous celui de chacun de ses sous-espaces, à
 * toute profondeur. Hors d'un espace, on cherche sous le chemin seul.
 */
export type SpaceRef = { groupId: string; parentGroupId: string | null; path: string };

export function spaceSearchScopes(spaces: readonly SpaceRef[], path: string): string[] {
  const start = spaces.find((s) => s.path === path);
  if (!start) return [path];
  const scopes: string[] = [];
  const seen = new Set<string>();
  const visit = (space: SpaceRef): void => {
    if (seen.has(space.groupId)) return; // une hiérarchie mal formée ne boucle pas
    seen.add(space.groupId);
    scopes.push(space.path);
    for (const child of spaces) {
      if (child.parentGroupId === space.groupId) visit(child);
    }
  };
  visit(start);
  return scopes;
}
