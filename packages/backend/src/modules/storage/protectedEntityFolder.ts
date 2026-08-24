/**
 * Dossiers adossés à une ENTITÉ, non supprimables depuis le finder — détection
 * par MOTIF DE CHEMIN (préfixe fixe, aucune query). Leur cycle de vie est celui
 * de leur entité : on ne les supprime que via le gestionnaire correspondant.
 *
 *   - conteneurs : `${appRoot}/groups`, `${appRoot}/persos`, `${appRoot}/avatars`
 *   - espace de GROUPE : `${appRoot}/groups/<slug>-<cuid>`
 *   - espace PERSO     : `${appRoot}/persos/<slug>-<cuid>`
 *   - dossier AVATAR   : `${appRoot}/avatars/<userId>`
 *
 * ⚠️ Les disciplines/catégories ont un slug DYNAMIQUE (`<catégorie>/<discipline>`)
 * → leur protection est DB-aware et vit ailleurs (incrément 1c). Ce module ne
 * couvre QUE les entités à préfixe fixe.
 */
const GROUPS_CONTAINER = /^[^/]+\/groups$/;
const PERSOS_CONTAINER = /^[^/]+\/persos$/;
const AVATARS_CONTAINER = /^[^/]+\/avatars$/;
const GROUP_SPACE = /\/groups\/[^/]+-c[a-z0-9]{24}$/;
const PERSO_SPACE = /\/persos\/[^/]+-c[a-z0-9]{24}$/;
const AVATAR_FOLDER = /\/avatars\/[^/]+$/;

/** True si `path` désigne un dossier-entité à préfixe fixe (protégé). */
export function isProtectedEntityFolderPath(path: string): boolean {
  return (
    GROUPS_CONTAINER.test(path) ||
    PERSOS_CONTAINER.test(path) ||
    AVATARS_CONTAINER.test(path) ||
    GROUP_SPACE.test(path) ||
    PERSO_SPACE.test(path) ||
    AVATAR_FOLDER.test(path)
  );
}
