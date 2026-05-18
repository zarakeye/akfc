import { useEffect, useState } from "react";
import type { FileAdapter } from "@contracts/finder";
import { useFinderStore } from "@features/finder-core/state/useFinderStore";

/**
 * Ce hook gère le chargement des données du Finder en fonction du path courant.
 *
 * ─── Cache des contenus visités ──────────────────────────────────────────
 *
 * Le store finder garde un `contentCache: Map<path, {folders, files}>`.
 * Stratégie :
 *   - Au changement de `currentPath`, on check si le path est dans le cache.
 *   - Si HIT : le `setPath` du store a déjà restauré `folders`/`files`
 *     depuis le cache → on skip complètement le fetch, pas de spinner.
 *   - Si MISS : on lance le fetch normalement → le `setContent` qui suit
 *     met à jour à la fois le state ET le cache pour les visites futures.
 *
 * Le `reloadKey` reste le mécanisme pour forcer un re-fetch même en cas
 * de cache hit (typiquement après une mutation backend). `reloadFolderContent()`
 * purge le cache et incrémente `reloadKey` ensemble.
 *
 * ─── Pourquoi pas une simple comparaison de path précédent ? ─────────────
 *
 * Le cache map est plus complet : il couvre aussi le cas où l'utilisateur
 * a navigué dans plusieurs paths et revient à un ancien (pas seulement le
 * "parent direct"). Et le cache vit le temps de la session, donc on évite
 * les re-fetch même après plusieurs allers-retours.
 */

type UseFinderDataResult = {
  loading: boolean;
  error: string | null;
};

export function useFinderData(adapter: FileAdapter): UseFinderDataResult {
  const currentPath = useFinderStore((state) => state.currentPath);
  const setContent = useFinderStore((state) => state.setContent);
  const reloadKey = useFinderStore((state) => state.reloadKey);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Lecture imperative du cache : on évite de subscribe à `contentCache`
    // pour ne pas re-déclencher cet effect à chaque mutation du cache (qui
    // créerait des boucles infinies). On lit l'état actuel à T0 et c'est
    // suffisant — un nouveau changement de `currentPath` re-évaluera.
    const cached = useFinderStore.getState().contentCache.get(currentPath);

    if (cached) {
      // Cache HIT : le contenu a déjà été appliqué via `setPath`.
      // Pas de fetch, pas de loading. L'utilisateur voit instantanément
      // le contenu mémorisé.
      setLoading(false);
      setError(null);
      return;
    }

    // Cache MISS : fetch normal
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await adapter.list({ path: currentPath });
        if (cancelled) return;
        setContent({
          folders: result.folders,
          files: result.files,
        });
      } catch (err) {
        if (cancelled) return;
        console.error("[useFinderData]", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPath, adapter, setContent, reloadKey]);

  return {
    loading,
    error,
  };
}
