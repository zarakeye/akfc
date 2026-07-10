/**
 * Convertit une valeur HHMM en chaîne d'affichage « 18h30 ». À utiliser
 * dans les pages publiques (Server Components) et toute UI qui montre des
 * horaires.
 *
 *   formatHHMM(0)     // "0h00"
 *   formatHHMM(905)   // "9h05"
 *   formatHHMM(1830)  // "18h30"
 *   formatHHMM(2359)  // "23h59"
 *
 * Module neutre (pas de "use client") : importable depuis un Server Component
 * comme depuis un Client Component.
 */
export function formatHHMM(hhmm: number): string {
  const h = Math.floor(hhmm / 100);
  const m = hhmm % 100;
  return `${h}h${String(m).padStart(2, "0")}`;
}