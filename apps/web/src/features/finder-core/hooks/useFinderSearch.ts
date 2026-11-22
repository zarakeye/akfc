'use client';

import { useEffect, useRef } from 'react';
import { trpc } from '#core/trpc/trpcClient.ts';
import { APP_ROOT } from '@akfc/config/app.ts';
import { useFinderStore, type SearchResultNode } from '#features/finder-core/state/useFinderStore.ts';
import { useSessionStore } from '#lib/stores/useSessionStore.ts';

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
 * puisse afficher un spinner. Deux requêtes peuvent se croiser (« pho »,
 * puis « photo » tapé après le départ de la première) : la réponse d'une
 * recherche dépassée est ignorée grâce au drapeau `cancelled`, posé par le
 * nettoyage de l'effet dès que la requête, les options ou le dossier changent.
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
  const setSearchError = useFinderStore((s) => s.setSearchError);
  const isAdmin = useSessionStore((st) => st.session?.user?.isAdmin ?? false);

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
    let cancelled = false;
    debounceRef.current = window.setTimeout(async () => {
      try {
        // Où chercher : sous le dossier courant, sauf si l'adapter en décide
        // autrement (racine inventée, sous-espaces rangés ailleurs).
        const adapter = useFinderStore.getState().boundAdapter;
        const scopes = (await adapter?.searchScopes?.(currentPath)) ?? [currentPath];
        if (cancelled) return;
        const pages = await Promise.all(
          scopes.map((prefix) =>
            trpcUtils.media.searchRecursive.fetch({
              appRoot: APP_ROOT,
              prefix,
              query: query.trim(),
              caseSensitive: flags.caseSensitive,
              wholeWord: flags.wholeWord,
              // Réservée aux administrateurs côté serveur : un choix resté dans
              // les préférences d'un membre ne doit pas faire échouer sa recherche.
              useRegex: flags.useRegex && isAdmin,
            }),
          ),
        );
        // Un résultat peut venir de deux préfixes qui se recouvrent : une fois suffit.
        const seen = new Set<string>();
        const data = {
          results: pages
            .flatMap((p) => p.results)
            .filter((r) => (seen.has(r.path) ? false : (seen.add(r.path), true))),
          truncated: pages.some((p) => p.truncated),
        };

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

        if (cancelled) return;
        setSearchResults(results, data.truncated);
      } catch (err) {
        // Un refus ou une panne ne doit pas se faire passer pour « aucun
        // résultat » : le message s'affiche au-dessus de la liste.
        if (cancelled) return;
        setSearchResults([], false);
        setSearchError(err instanceof Error ? err.message : 'La recherche a échoué.');
      }
    }, 300);

    // Nettoyage : si la requête, les options ou le dossier changent, le minuteur en attente
    // est annulé, et la réponse d'une recherche déjà partie sera ignorée.
    return () => {
      cancelled = true;
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
    isAdmin,
  ]);
}

/**
 * Helper local : déduit le `kind` ('image' | 'video' | 'document') depuis
 * un MIME type. Aligné avec ce que les adapters font côté list().
 */
function deriveKind(mimeType: string): 'image' | 'video' | 'document' | undefined {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'video'; // lecteur audio/vidéo commun
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