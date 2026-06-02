'use client';

import { useEffect } from 'react';
import { trpc } from '@trpc/trpcClient';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import type { FinderNode } from '@contracts/finder';
import { APP_ROOT } from '@config/app';

/**
 * 🪝 useMediaAssetEnrichment — enrichit les FinderNodes avec les metadata DB
 *
 * ─── Quoi ────────────────────────────────────────────────────────────
 *
 * Après chaque chargement de contenu dans le finder (via `useFinderData`
 * ou cache hit), on appelle la procédure tRPC `media.getByPaths` pour
 * récupérer les rows `MediaAsset` correspondantes. Les metadata retournées
 * (createdAt, uploadedBy, dimensions, etc.) sont mergées dans le `meta`
 * de chaque node concerné via `setContent`.
 *
 * Effet visible : le tri/groupage par Date et Expéditeur fonctionne
 * réellement, les infos sont disponibles pour la preview, etc.
 *
 * Note : l'appRoot est lu côté backend depuis le contexte tRPC
 * (`ctx.appRoot`, toujours présent — cf. `createTRPCContext`). Pas besoin
 * de le passer en input ici.
 *
 * ─── Pourquoi en hook séparé ────────────────────────────────────────
 *
 * Plutôt que de coupler `useFinderData` (qui pourrait théoriquement
 * récupérer les metadata en même temps que le `list()`), on fait un
 * hook découplé pour 3 raisons :
 *
 *   1. **Découplage backend** : les metadata sont en DB, le `list()` lit
 *      les adapters (Cloudinary/R2). Deux sources, deux requêtes
 *      indépendantes — on garde le coupling lâche.
 *   2. **Lazy loading** : si le réseau est lent ou que la requête échoue,
 *      la grille s'affiche quand même avec les infos de base. L'enrichissement
 *      arrive après, sans bloquer le rendu initial.
 *   3. **Réutilisabilité** : ce hook peut s'attacher à d'autres vues
 *      (TreeView, future searchbar) sans toucher à `useFinderData`.
 *
 * ─── Loading state ───────────────────────────────────────────────────
 *
 * Aucun spinner exposé — l'enrichissement est silencieux. Si l'utilisateur
 * trie par Date avant que les meta soient arrivées, il voit l'ordre
 * stable (par nom) puis l'ordre se réajuste discrètement quand les meta
 * arrivent. Plus fluide qu'un loading bloquant.
 *
 * ─── Idempotence ─────────────────────────────────────────────────────
 *
 * Le hook se redéclenche à chaque changement de `folders` ou `files` du
 * store (typiquement après nav ou reload). Le `setContent` reset le
 * cache du path courant, donc pas de risque d'accumuler des metadata
 * obsolètes après une mutation.
 */
export function useMediaAssetEnrichment(): void {
  const folders = useFinderStore((s) => s.folders);
  const files = useFinderStore((s) => s.files);
  const setContent = useFinderStore((s) => s.setContent);

  // Les paths des FILES uniquement — les folders n'ont pas de MediaAsset
  // associée (le model ne track que les assets fichiers).
  // Stringifier pour stabilité de la dépendance React (sinon ré-render
  // à chaque ref change même quand contenu identique).
  const filePaths = files.map((f) => f.path);
  const filePathsKey = filePaths.join('|');

  // tRPC query. `enabled: filePaths.length > 0` évite un fetch inutile
  // quand le dossier courant ne contient que des sous-dossiers.
  const { data } = trpc.media.getByPaths.useQuery(
    { appRoot: APP_ROOT, paths: filePaths },
    {
      enabled: filePaths.length > 0,
      // Cache court (60s) : les meta changent rarement après l'upload,
      // mais on veut les voir vite sur une description fraîchement éditée.
      staleTime: 60_000,
    },
  );

  useEffect(() => {
    if (!data) return;
    // Si aucune des metas n'a apporté de nouveauté, on ne setContent pas
    // (éviterait un ré-render gratuit). On compare les paths qui ont reçu
    // de la metadata vs ceux qui ont déjà la metadata posée.
    const hasNewData = files.some((f) => {
      const meta = data[f.path];
      if (!meta) return false;
      // Si on a déjà appliqué cette createdAt, pas la peine de refaire.
      return f.meta?.createdAt !== meta.createdAt;
    });
    if (!hasNewData) return;

    // Merge : pour chaque file, si on a des meta DB, on les fusionne au
    // meta existant (qui contient déjà url/format/kind depuis l'adapter).
    const enrichedFiles: FinderNode[] = files.map((f) => {
      const meta = data[f.path];
      if (!meta) return f;
      return {
        ...f,
        meta: {
          ...f.meta,
          createdAt: meta.createdAt,
          uploadedBy: meta.uploadedBy,
          uploaderId: meta.uploaderId,
          mimeType: meta.mimeType,
          width: meta.width ?? undefined,
          height: meta.height ?? undefined,
          duration: meta.duration ?? undefined,
          description: meta.description ?? undefined,
          bytes: meta.bytes,
        },
      };
    });

    setContent({ folders, files: enrichedFiles });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filePathsKey]);
}
