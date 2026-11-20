/**
 * Limiteur de tentatives, en mémoire du processus.
 *
 * Une clé (une adresse e-mail, une adresse IP…) a droit à `limit` tentatives par fenêtre glissante
 * de `windowMs`. En mémoire : suffisant pour une seule instance du site, remis à zéro au
 * redémarrage. Avec plusieurs instances, il faudrait un stockage partagé (la base, Redis).
 *
 * Les compteurs vivent sur `globalThis`, rangés sous le nom du limiteur. Next compile à part la
 * route /api/trpc et les server actions : un même module y est chargé deux fois, avec deux copies
 * de ses variables. Une Map propre au module donnerait deux limites, une par entrée, et un
 * attaquant doublerait ses essais en alternant les deux ; sur `globalThis`, il n'y en a qu'une.
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

const registry = ((globalThis as { __akfcThrottles?: Map<string, Map<string, number[]>> }).__akfcThrottles ??=
  new Map());

export function createThrottle({ name, limit, windowMs }: { name: string; limit: number; windowMs: number }): Throttle {
  // Un nom par limiteur : deux limiteurs ne partagent jamais leurs compteurs.
  const hits: Map<string, number[]> = registry.get(name) ?? new Map();
  registry.set(name, hits);
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
