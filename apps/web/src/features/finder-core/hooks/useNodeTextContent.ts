import { useEffect, useState } from 'react';

/**
 * 📝 Hook qui charge le contenu textuel d'un asset depuis son URL.
 *
 * Usage : preview de fichiers texte (.txt) et markdown (.md). On lit le
 * contenu via `fetch().then(r => r.text())`, on tronque si la taille
 * dépasse `maxBytes`, et on signale la troncature à l'appelant.
 *
 * 🚧 Limites assumées :
 *
 * - Le hook lit l'**intégralité** de la réponse avant de tronquer. Pour un
 *   fichier de 500 MB, on téléchargerait 500 MB pour n'en garder que
 *   `maxBytes`. C'est acceptable dans le contexte AKFC (les assets texte
 *   sont des descriptions, mémos, etc. — typiquement quelques KB). Pour
 *   un cas d'usage avec gros fichiers, il faudrait passer en stream avec
 *   un cap réel via `ReadableStream.getReader()`.
 *
 * - On ne distingue pas "fichier vide" et "erreur de fetch" — un fichier
 *   vide légitime renvoie `''` avec `loading: false, error: null`.
 *
 * 🔁 Cancellation via `AbortController` : un changement d'URL pendant un
 * fetch en vol annule la requête précédente (économie réseau et évite
 * d'écrire un résultat obsolète).
 *
 * @param url URL à fetcher, ou null/undefined pour ne rien faire
 * @param options.maxBytes plafond de caractères conservés (default 200_000 ≈ 200 KB)
 */
type UseNodeTextContentResult = {
  content: string | null;
  loading: boolean;
  error: string | null;
  truncated: boolean;
};

const DEFAULT_MAX_BYTES = 200_000;

export function useNodeTextContent(
  url: string | undefined | null,
  options?: { maxBytes?: number },
): UseNodeTextContentResult {
  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    if (!url) {
      setContent(null);
      setLoading(false);
      setError(null);
      setTruncated(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function fetchText() {
      setLoading(true);
      setError(null);
      setTruncated(false);

      try {
        const response = await fetch(url!, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const raw = await response.text();
        if (cancelled) return;

        if (raw.length > maxBytes) {
          setContent(raw.slice(0, maxBytes));
          setTruncated(true);
        } else {
          setContent(raw);
          setTruncated(false);
        }
      } catch (err) {
        if (cancelled) return;
        // L'AbortError n'est pas une vraie erreur — c'est nous qui avons annulé.
        if (err instanceof Error && err.name === 'AbortError') return;

        console.error('[useNodeTextContent]', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
        setContent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchText();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url, maxBytes]);

  return { content, loading, error, truncated };
}
