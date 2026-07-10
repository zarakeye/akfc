/**
 * slugify — transforme un texte libre en slug URL-safe.
 *
 * Fonction **pure**, zéro dépendance (pas de zod). Utilisée côté front
 * (pré-remplissage du champ slug dans les forms admin) et par le script
 * de backfill.
 *
 *   slugify("Karaté Shotokan")          // "karate-shotokan"
 *   slugify("Choy Lee Fut")             // "choy-lee-fut"
 *   slugify("Stage Sensei Tanaka 2026") // "stage-sensei-tanaka-2026"
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les diacritiques (é → e)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // tout caractère non alphanumérique → tiret
    .replace(/^-+|-+$/g, ""); // trim des tirets aux extrémités
}