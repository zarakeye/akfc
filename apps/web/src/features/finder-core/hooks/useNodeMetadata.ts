import { useEffect, useState } from 'react';
import type { FileAdapter, FinderNodeMetadata } from '@contracts/finder';

/**
 * 📊 Hook qui charge les métadonnées riches (taille, dates, format, mimeType)
 * d'un node du finder via `adapter.getMetadata`.
 *
 * 🔁 Réagit à un changement de `path` : un nouveau path déclenche un nouveau
 * fetch ; le résultat précédent est invalidé. La cancellation via le flag
 * `cancelled` évite d'écrire un résultat obsolète si l'utilisateur change
 * rapidement de sélection pendant un fetch en vol.
 *
 * 🚫 Cas où le hook ne fetch pas :
 *   - `path === null` (pas de sélection, pas de cible) → reset à null
 *   - L'adapter n'expose pas `getMetadata` (read-only ou minimal) → reset à null
 *
 * Symétrique à `useFinderData` côté pattern : un `useEffect` avec
 * cancellation, des états locaux loading/error/data.
 */
type UseNodeMetadataResult = {
  metadata: FinderNodeMetadata | null;
  loading: boolean;
  error: string | null;
};

export function useNodeMetadata(
  adapter: FileAdapter,
  path: string | null,
): UseNodeMetadataResult {
  const [metadata, setMetadata] = useState<FinderNodeMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pas de cible ou adapter sans support → pas de fetch. Le cas est
    // traité par dérivation au retour du hook (pas de setState ici).
    if (!path || !adapter.getMetadata) return;

    let cancelled = false;

    async function fetchMetadata() {
      setLoading(true);
      setError(null);

      try {
        // On a vérifié plus haut que getMetadata existe — TS le sait pas
        // dans cette closure async, donc petit non-null.
        const result = await adapter.getMetadata!(path!);

        if (cancelled) return;
        setMetadata(result);
      } catch (err) {
        if (cancelled) return;
        console.error('[useNodeMetadata]', err);
        setError(err instanceof Error ? err.message : 'Failed to load metadata');
        setMetadata(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMetadata();

    return () => {
      cancelled = true;
    };
  }, [adapter, path]);

  // Sans cible (ou adapter sans getMetadata), on expose l'état vide
  // directement, sans dépendre des states résiduels d'un fetch précédent.
  if (!path || !adapter.getMetadata) {
    return { metadata: null, loading: false, error: null };
  }

  return { metadata, loading, error };
}