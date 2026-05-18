/**
 * Humanise un nombre d'octets en chaîne lisible.
 *
 * Choix de la base : 1024 (binaire) plutôt que 1000 (décimal). C'est la
 * convention historique des systèmes de fichiers (et ce que retournent
 * la plupart des explorateurs de fichiers natifs). Cohérent avec
 * l'attente d'un utilisateur qui regarde la taille d'un asset.
 *
 * @param bytes nombre d'octets, ou undefined/null si inconnu
 * @returns chaîne formatée (ex: '1.2 MB'), ou null si l'entrée est invalide
 */
export function formatBytes(bytes: number | undefined | null): string | null {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return null;

  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / Math.pow(1024, exponent);

  // 0 décimale pour les octets purs, 1 décimale au-dessus.
  // Garde un affichage compact tout en restant lisible.
  const formatted = exponent === 0 ? value.toFixed(0) : value.toFixed(1);

  return `${formatted} ${units[exponent]}`;
}
