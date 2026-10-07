/**
 * Garde-fou contre l'envoi en rafale du formulaire de contact (robots, double clic insistant).
 * En mémoire du processus : suffisant pour une seule instance ; remis à zéro au redémarrage.
 * Une clé (IP ou adresse e-mail) a droit à LIMIT demandes par fenêtre glissante de WINDOW_MS.
 */
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

/** Vrai si l'une des clés a déjà atteint la limite ; sinon enregistre la tentative pour chacune. */
export function isThrottled(keys: Array<string | null | undefined>, now = Date.now()): boolean {
  const live = keys.filter((k): k is string => Boolean(k));
  const recent = live.map((k) => (hits.get(k) ?? []).filter((t) => now - t < WINDOW_MS));
  if (recent.some((r) => r.length >= LIMIT)) return true;
  live.forEach((k, i) => hits.set(k, [...recent[i], now]));
  if (hits.size > 5_000) {
    for (const [k, ts] of hits) if (ts.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}

/** Réservé aux tests. */
export function resetThrottle(): void {
  hits.clear();
}
