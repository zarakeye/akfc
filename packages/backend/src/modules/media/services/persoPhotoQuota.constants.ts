/**
 * Quota d'images de l'espace perso d'un admin.
 *
 * Constante volontaire (pas de modèle DB) : le club est petit, le réglage est
 * global et rarement modifié. Le jour où d'autres réglages arrivent, on
 * introduira une table AppConfig clé-valeur et cette constante en deviendra le
 * défaut. En attendant, ajuster le quota = éditer cette ligne.
 */
export const PERSO_PHOTO_QUOTA = 30;
