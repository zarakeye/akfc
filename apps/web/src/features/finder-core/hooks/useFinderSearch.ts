'use client';

import { useEffect, useRef } from 'react';
import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';
import { useFinderStore, type SearchResultNode } from '@features/finder-core/state/useFinderStore';
import { parentPath } from '@features/finder-core/utils/path';

/**
 * 🔎 Hook qui pilote la recherche récursive depuis `currentPath`.
 *
 * ─── Comportement ────────────────────────────────────────────────────
 *
 * Observe `search.query`, `search.flags`, et `currentPath` dans le store.
 * Quand la query devient non-vide, déclenche un fetch tRPC `media.searchRecursive`
 * après un debounce. Les résultats sont posés dans `search.results` du store.
 *
 * Quand la query est vidée (par clear ou par changement de path qui reset
 * la query via `setPath`), le hook reset les résultats et ne fetch plus.
 *
 * ─── Debounce ────────────────────────────────────────────────────────
 *
 * 300ms — standard. Évite de fire une query par caractère tapé. La query
 * effective est celle de la frappe la plus récente après 300ms sans nouveau
 * caractère.
 *
 * ─── Loading et race conditions ──────────────────────────────────────
 *
 * Pendant le debounce + le fetch, on pose `loading: true` pour que l'UI
 * puisse afficher un spinner. Le tRPC client garantit l'absence de race
 * conditions sur les requêtes superposées (la dernière query "gagne" car
 * le `useEffect` voit la dernière valeur du store).
 *
 * ─── Cleanup ─────────────────────────────────────────────────────────
 *
 * Si la query change pendant un debounce, on cancel le timeout précédent
 * pour éviter de fire l'ancienne version. Le cleanup useEffect le fait
 * automatiquement.
 */
export function useFinderSearch(): void {
  const currentPath = useFinderStore((s) => s.currentPath);
  const query = useFinderStore((s) => s.search.query);
  const flags = useFinderStore((s) => s.search.flags);

  const setSearchResults = useFinderStore((s) => s.setSearchResults);
  const setSearchLoading = useFinderStore((s) => s.setSearchLoading);

  const trpcUtils = trpc.useUtils();

  // Ref vers le timer de debounce pour pouvoir le cancel.
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    // Query vide → reset results, pas de fetch.
    if (query.trim().length === 0) {
      setSearchResults([], false);
      return;
    }

    // Marqueur de loading immédiat (spinner UI dès la frappe, pas après 300ms)
    setSearchLoading(true);

    // Debounce 300ms
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        // Le prefix de recherche est le currentPath. Pour les fichiers
        // Cloudinary, on a besoin du publicId stripped of extension côté
        // backend — mais comme `currentPath` est toujours un dossier (jamais
        // un fichier), il n'a pas d'extension à stripper. On passe tel quel.
        const data = await trpcUtils.media.searchRecursive.fetch({
          appRoot: APP_ROOT,
          prefix: currentPath,
          query: query.trim(),
          caseSensitive: flags.caseSensitive,
          wholeWord: flags.wholeWord,
          useRegex: flags.useRegex,
        });

        // Map vers SearchResultNode (FinderNode + parentPath).
        // Discriminant `kind` côté serveur ('folder' | 'file') → mappé vers
        // `type` côté FinderNode pour rester cohérent avec le reste du finder.
        const results: SearchResultNode[] = data.results.map((r) => {
          if (r.kind === 'folder') {
            return {
              id: r.id,
              path: r.path,
              parentPath: r.parentPath,
              name: r.name,
              type: 'folder' as const,
              meta: {},
            };
          }
          // r.kind === 'file' — tous les fields sont présents
          return {
            id: r.id,
            path: r.path,
            parentPath: r.parentPath,
            name: r.name,
            type: 'file' as const,
            size: r.bytes ?? undefined,
            meta: {
              format: r.format ?? undefined,
              kind: deriveKind(r.mimeType ?? ''),
              createdAt: r.createdAt ?? undefined,
              uploadedBy: r.uploadedBy ?? undefined,
              uploaderId: r.uploaderId ?? undefined,
              mimeType: r.mimeType ?? undefined,
              width: r.width ?? undefined,
              height: r.height ?? undefined,
              duration: r.duration ?? undefined,
              description: r.description ?? undefined,
              bytes: r.bytes ?? undefined,
            },
          };
        });

        setSearchResults(results, data.truncated);
      } catch (err) {
        // Si le fetch fail (réseau ou regex invalide côté serveur retournant
        // []), on pose juste des résultats vides — le loading est reset.
        console.error('[useFinderSearch] fetch failed', err);
        setSearchResults([], false);
      }
    }, 300);

    // Cleanup : cancel le timeout si query/flags/currentPath changent avant la fin
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    query,
    flags.caseSensitive,
    flags.wholeWord,
    flags.useRegex,
    currentPath,
  ]);
}

/**
 * Helper local : déduit le `kind` ('image' | 'video' | 'document') depuis
 * un MIME type. Aligné avec ce que les adapters font côté list().
 */
function deriveKind(mimeType: string): 'image' | 'video' | 'document' | undefined {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'video'; // convention Cloudinary
  // PDF, docx, etc. → document
  if (
    mimeType === 'application/pdf' ||
    mimeType.includes('word') ||
    mimeType === 'text/plain' ||
    mimeType === 'text/markdown'
  )
    return 'document';
  return undefined;
}
