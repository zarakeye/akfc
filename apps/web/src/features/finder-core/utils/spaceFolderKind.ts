/**
 * Nature d'un dossier d'espace/conteneur du finder, pour lui donner une icône
 * thématique. Détection par le motif du chemin (aucune query requise).
 *
 *   - espace de GROUPE : `${appRoot}/groups/<slug>-<cuid>`
 *   - espace PERSO     : `${appRoot}/persos/<slug>-<cuid>`
 *   - conteneurs       : `${appRoot}/groups` et `${appRoot}/persos`
 */
const GROUP_SPACE_PATH = /\/groups\/[^/]+-c[a-z0-9]{24}$/;
const PERSO_SPACE_PATH = /\/persos\/[^/]+-c[a-z0-9]{24}$/;
const GROUPS_CONTAINER = /^[^/]+\/groups$/;
const PERSOS_CONTAINER = /^[^/]+\/persos$/;
const AVATARS_CONTAINER = /^[^/]+\/avatars$/;
const AVATAR_FOLDER = /\/avatars\/[^/]+$/;

export function isGroupSpaceFolder(path: string): boolean {
  return GROUP_SPACE_PATH.test(path);
}

export function isPersoSpaceFolder(path: string): boolean {
  return PERSO_SPACE_PATH.test(path);
}

export function isGroupsContainer(path: string): boolean {
  return GROUPS_CONTAINER.test(path);
}

export function isPersosContainer(path: string): boolean {
  return PERSOS_CONTAINER.test(path);
}

/**
 * Dossier adossé à une ENTITÉ à préfixe fixe (groupe/perso/avatars) →
 * non supprimable dans le finder : sa suppression passe par le
 * gestionnaire de l'entité. Miroir front du gate backend
 * `isProtectedEntityFolderPath`. NB : disciplines/catégories (slug
 * dynamique) ne sont PAS couvertes ici.
 */
export function isProtectedEntityFolder(path: string): boolean {
  return (
    GROUPS_CONTAINER.test(path) ||
    PERSOS_CONTAINER.test(path) ||
    AVATARS_CONTAINER.test(path) ||
    GROUP_SPACE_PATH.test(path) ||
    PERSO_SPACE_PATH.test(path) ||
    AVATAR_FOLDER.test(path)
  );
}
