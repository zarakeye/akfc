/**
 * Formate une date ISO 8601 en chaîne lisible française.
 *
 * Exemple : `'2024-01-12T14:32:00Z'` → `'12 janv. 2024 à 14:32'`
 *
 * On utilise `Intl.DateTimeFormat` plutôt qu'une lib externe (date-fns,
 * dayjs) pour rester sans dépendance — `Intl` est disponible dans tous
 * les navigateurs modernes ciblés par Next.js 16.
 *
 * Le formateur est instancié à l'extérieur de la fonction pour éviter
 * de recréer un objet `Intl` à chaque appel (coût non négligeable).
 *
 * @param iso chaîne ISO 8601 (UTC ou avec offset), ou undefined/null
 * @returns chaîne formatée, ou null si la date est invalide ou absente
 */
const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(iso: string | undefined | null): string | null {
  if (!iso) return null;

  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return null;

  const date = new Date(ts);

  // Intl.DateTimeFormat retourne par défaut "12 janv. 2024, 14:32"
  // On remplace la virgule par " à " pour un rendu plus naturel en français.
  return dateFormatter.format(date).replace(', ', ' à ');
}
