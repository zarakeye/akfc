import { APP_ROOT } from '@config/app';

/**
 * 🛡️ Status folders : les 3 dossiers racines intouchables.
 *
 * Ce sont les dossiers qui structurent l'app au niveau du workflow :
 *   - `${APP_ROOT}/pending`    — contenu en attente de publication
 *   - `${APP_ROOT}/published`  — contenu publié, visible côté front public
 *   - `${APP_ROOT}/bin`        — corbeille (poubelle des items trashed)
 *
 * Règles métier portées par cette détection (et appliquées dans tous les
 * composants UI qui s'en servent) :
 *
 *   1. **Pas drag-source** : on ne peut pas déplacer un status folder
 *      ailleurs (sinon on casse l'invariant de structure).
 *   2. **Pas supprimables** : ni via la corbeille (trashToBin), ni via
 *      delete forever — ce sont des points d'ancrage permanents.
 *   3. **Pas renommables** : leur nom est sémantique côté code (path
 *      hard-codé pour le router, les services, etc.).
 *   4. **Pas sélectionnables** : pas de checkbox au niveau du status
 *      folder lui-même ; seuls leurs **descendants** peuvent être
 *      sélectionnés (cohérent avec la sémantique "on agit SUR le
 *      contenu, pas SUR la classification").
 *
 * Les guards backend existent déjà (les services trashToBin/restore/delete
 * refusent ces paths). Ce helper sert à anticiper côté UI pour ne pas
 * proposer d'actions qui échoueront — meilleur UX et moins de bruit
 * dans les logs serveur.
 */

const STATUS_FOLDER_NAMES = ['pending', 'published', 'bin'] as const;

/** Liste figée des paths qui sont des status folders. */
export const STATUS_FOLDER_PATHS: readonly string[] = STATUS_FOLDER_NAMES.map(
  (name) => `${APP_ROOT}/${name}`,
);

/**
 * Vrai si `path` désigne exactement un status folder de l'app.
 * Match strict — les descendants (`${APP_ROOT}/pending/cours`) renvoient false.
 */
export function isStatusFolder(path: string): boolean {
  return STATUS_FOLDER_PATHS.includes(path);
}
