/**
 * 🚀 Cache in-memory des résultats `listAuthenticatedResources`.
 *
 * 🎯 Pourquoi ?
 *
 * L'API admin Cloudinary (`cloudinary.api.resources`) met typiquement
 * **plusieurs secondes** par appel — comportement connu et documenté
 * de l'API. Pour un finder qui interroge à chaque navigation (entrer
 * dans un dossier, déplier un nœud de la TreeView), ça rend l'UX
 * inutilisable au-delà de quelques niveaux.
 *
 * Ce cache stocke en mémoire les résultats d'appels précédents, indexés
 * par `prefix`. Un hit court-circuite complètement l'appel API et passe
 * de ~5s à <1ms.
 *
 * 🔁 Stratégie d'invalidation
 *
 * - **TTL** : 1 heure par entrée. Long mais raisonnable — l'admin qui
 *   édite activement bénéficie surtout des invalidations explicites
 *   ci-dessous, le TTL sert de filet de sécurité.
 *
 * - **Invalidation explicite** : appelée depuis chaque service qui mute
 *   l'état Cloudinary (move, destroy, delete by prefix, register après
 *   upload). Pour 4.4-bis-perf on adopte une purge totale (`invalidate()`
 *   sans argument) — simple et garanti correct. Une invalidation plus
 *   granulaire (par prefix affecté) pourra être mise en place plus tard
 *   si on observe que la purge totale fait perdre trop de hits.
 *
 * ⚠️ Limites assumées
 *
 * - **Single-node** : le cache vit en mémoire du process Node.js, donc
 *   il n'est pas partagé entre instances en déploiement multi-node. C'est
 *   acceptable pour AKFC (déploiement single-node) ; si on passe en
 *   multi-node un jour, il faudra migrer vers Redis ou similaire.
 *
 * - **Perdu au redémarrage** : le cache s'efface à chaque restart du
 *   serveur. C'est OK — le 1er appel après restart sera lent (5s), puis
 *   tout sera rapide.
 *
 * - **Pas de coalescence** : si N requêtes simultanées arrivent en même
 *   temps sur un prefix non-caché, elles déclencheront chacune un appel
 *   API. Pour AKFC c'est probablement OK (faible concurrence admin) ;
 *   à raffiner via un `Map<prefix, Promise>` "in-flight" si nécessaire.
 */

import type { ListAuthenticatedResourcesResult } from '@backend/modules/cloudinary/services/cloudinary.service';

/**
 * Durée de vie par entrée du cache, en millisecondes.
 * 1 heure : suffisamment long pour que la majorité des navigations soient
 * cachées, mais assez court pour que les entrées orphelines (cas d'oubli
 * d'invalidation) finissent par disparaître.
 */
const TTL_MS = 60 * 60 * 1000;

type Entry = {
  data: ListAuthenticatedResourcesResult[];
  expiresAt: number;
};

const cache = new Map<string, Entry>();

/**
 * Retourne les ressources cachées pour un prefix, en utilisant le cache
 * de manière **hiérarchique**.
 *
 * 🎯 Stratégie en deux temps :
 *
 *   1. **Hit exact** : si on a déjà appelé `listAuthenticatedResources(prefix)`,
 *      on retourne le résultat stocké tel quel.
 *
 *   2. **Hit d'un préfixe ancêtre** : sinon, on cherche dans le cache un
 *      préfixe qui est un ancêtre strict du `prefix` demandé. L'API
 *      Cloudinary `resources({ prefix })` retourne tous les assets sous
 *      ce préfixe **récursivement** — donc si on a déjà fetché un
 *      ancêtre, on peut servir la demande en **filtrant en mémoire**
 *      les assets dont le `publicId` matche le `prefix` demandé.
 *      Aucun appel API n'est nécessaire.
 *
 * 🔥 Pourquoi c'est crucial pour la perf du finder :
 *
 * Au montage du finder, on appelle `getTree({ path: 'AKFC', depth: 2 })`
 * qui passe par `listAuthenticatedResources('AKFC')`. L'API Cloudinary
 * retourne TOUS les assets sous `AKFC` (récursivement). Ces données sont
 * cachées sous la clé `'AKFC'`.
 *
 * Ensuite, naviguer dans `AKFC/pending` ou `AKFC/pending/2024` déclenche
 * `listAuthenticatedResources('AKFC/pending')` ou plus profond. Sans
 * stratégie hiérarchique, chaque navigation = nouvel appel API = 5s.
 * Avec la stratégie hiérarchique, on filtre les assets cachés sous
 * `'AKFC'` et on sert en < 10ms.
 *
 * 🎯 Choix du préfixe ancêtre :
 *
 * Si plusieurs ancêtres matchent (ex: on a caché `'AKFC'` ET `'AKFC/pending'`,
 * et on demande `'AKFC/pending/2024'`), on prend le **plus profond** car
 * son dataset est plus petit → filtrage plus rapide.
 */
export function getCached(
  prefix: string,
): ListAuthenticatedResourcesResult[] | null {
  // 1. Hit exact ?
  const exact = cache.get(prefix);
  if (exact) {
    if (Date.now() <= exact.expiresAt) {
      return exact.data;
    }
    cache.delete(prefix);
  }

  // 2. Hit d'un préfixe ancêtre ? On cherche le plus profond.
  let bestAncestor: { prefix: string; data: ListAuthenticatedResourcesResult[] } | null = null;

  for (const [cachedPrefix, entry] of cache.entries()) {
    // On nettoie les entrées expirées au passage — moins coûteux qu'un job de purge périodique.
    if (Date.now() > entry.expiresAt) {
      cache.delete(cachedPrefix);
      continue;
    }

    // Un ancêtre strict est un préfixe dont `prefix` commence par
    // `cachedPrefix + '/'`. Le `+ '/'` est crucial pour éviter qu'un
    // path `AKFC-bis` matche le cache `AKFC` (false positive).
    if (prefix.startsWith(cachedPrefix + '/')) {
      // On garde le plus profond (= le plus long) car son dataset
      // est plus petit, donc le filtrage est plus rapide.
      if (!bestAncestor || cachedPrefix.length > bestAncestor.prefix.length) {
        bestAncestor = { prefix: cachedPrefix, data: entry.data };
      }
    }
  }

  if (bestAncestor) {
    // Filtrage en mémoire : on garde uniquement les assets dont le
    // publicId est dans le périmètre `prefix` (égalité exacte OU descendance).
    return bestAncestor.data.filter(
      (r) => r.publicId === prefix || r.publicId.startsWith(prefix + '/'),
    );
  }

  return null;
}

/**
 * Stocke un résultat d'appel API dans le cache. Le TTL est appliqué
 * automatiquement à partir de l'instant courant.
 */
export function setCached(
  prefix: string,
  data: ListAuthenticatedResourcesResult[],
): void {
  cache.set(prefix, {
    data,
    expiresAt: Date.now() + TTL_MS,
  });
}

/**
 * Invalide le cache.
 *
 * - **Sans argument** : purge totale. C'est le mode utilisé après
 *   n'importe quelle mutation Cloudinary (move, destroy, register upload).
 * - **Avec un prefix** : invalide uniquement cette entrée. Réservé à
 *   d'éventuels usages plus précis dans le futur.
 */
export function invalidate(prefix?: string): void {
  if (prefix === undefined) {
    cache.clear();
    return;
  }
  cache.delete(prefix);
}

/**
 * Helper de debug — retourne le nombre d'entrées actuellement en cache.
 * Pas utilisé en prod, mais utile pour vérifier que le cache fonctionne
 * dans un endpoint de healthcheck ou en logging.
 */
export function size(): number {
  return cache.size;
}
