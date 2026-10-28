/**
 * Limiteur de tentatives, en mémoire du processus.
 *
 * Une clé (une adresse e-mail, une adresse IP…) a droit à `limit` tentatives par fenêtre glissante
 * de `windowMs`. En mémoire : suffisant pour une seule instance du site, remis à zéro au
 * redémarrage. Avec plusieurs instances, il faudrait un stockage partagé (la base, Redis).
 */
export type Throttle = {
  /** L'une des clés a-t-elle atteint la limite ? Ne compte rien. */
  isLimited: (keys: Array<string | null | undefined>, now?: number) => boolean;
  /** Compte une tentative pour chaque clé. */
  record: (keys: Array<string | null | undefined>, now?: number) => void;
  /** Vrai si l'une des clés est limitée ; sinon compte la tentative (« tout envoi compte »). */
  hit: (keys: Array<string | null | undefined>, now?: number) => boolean;
  /** Oublie les tentatives de ces clés (après une réussite, par exemple). */
  clear: (keys: Array<string | null | undefined>) => void;
};

export function createThrottle({ limit, windowMs }: { limit: number; windowMs: number }): Throttle {
  const hits = new Map<string, number[]>();
  const live = (keys: Array<string | null | undefined>): string[] => keys.filter((k): k is string => Boolean(k));
  const recent = (key: string, now: number): number[] => (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  const isLimited: Throttle["isLimited"] = (keys, now = Date.now()) =>
    live(keys).some((k) => recent(k, now).length >= limit);

  const record: Throttle["record"] = (keys, now = Date.now()) => {
    for (const k of live(keys)) hits.set(k, [...recent(k, now), now]);
    // Ménage : sans lui, chaque clé jamais revue resterait en mémoire.
    if (hits.size > 5_000) {
      for (const [k, ts] of hits) if (ts.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  };

  return {
    isLimited,
    record,
    hit: (keys, now = Date.now()) => {
      if (isLimited(keys, now)) return true;
      record(keys, now);
      return false;
    },
    clear: (keys) => {
      for (const k of live(keys)) hits.delete(k);
    },
  };
}
