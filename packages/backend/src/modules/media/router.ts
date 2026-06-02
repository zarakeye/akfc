/**
 * 📂 Module `media` — accès aux métadonnées MediaAsset depuis le finder
 *
 * Phase 2 + fix : matching par `fullPath`, avec **tolérance d'extension**
 * pour les fichiers Cloudinary.
 *
 * ─── Pourquoi le matching tolérant ────────────────────────────────────
 *
 * Convention Cloudinary : les publicIds sont SANS extension (Cloudinary
 * stocke le format séparément). Le finder frontend reçoit donc
 * `path = "AKFC/pending/cours/foo/trotinette"` pour une image Cloudinary.
 *
 * Convention R2 : les keys S3 contiennent l'extension. Le finder reçoit
 * `path = "AKFC/pending/cours/foo/bernhoft.mp3"` directement.
 *
 * Mais en DB, on a unifié sur `fullPath = publicId + '.' + format` côté
 * Cloudinary pour avoir une clé universelle (Phase 2). Du coup :
 *   - R2 : `path` UI === `fullPath` DB ✓
 *   - Cloudinary : `path` UI === `publicId` MAIS `fullPath` DB === `publicId + '.' + format`
 *
 * Conséquence : matcher par `fullPath = path` strict casse pour Cloudinary.
 * On accepte donc DEUX patterns :
 *   1. `fullPath === path` (cas R2, match direct)
 *   2. `fullPath startsWith path + '.'` (cas Cloudinary, path sans extension)
 *
 * Le `+ '.'` dans le startsWith évite de matcher accidentellement
 * `foobar.jpg` quand on cherche `foo` (foobar.jpg ne commence pas par
 * "foo.", il commence par "foob").
 *
 * Les résultats sont **toujours indexés par le path d'entrée** (UI-facing),
 * pas par le fullPath DB. C'est ce que le frontend attend depuis Phase 1.
 */

import { z } from 'zod';
import { router, protectedProcedure } from '@backend/trpc';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

/**
 * Forme du retour de `resolveByIds` pour un asset trouvé.
 *
 * Réutilisable côté frontend via :
 *   `inferRouterOutputs<AppRouter>['media']['resolveByIds'][string]`
 *
 * On expose le type explicitement pour qu'il puisse être référencé
 * directement par d'autres modules backend (notamment futur module
 * `page-renderer` server-side du sous-chantier 6).
 */
export type ResolvedMedia = {
  url: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  duration: number | null;
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function composeDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  email: string;
}): string {
  if (user.pseudo && user.pseudo.trim()) return user.pseudo.trim();
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  if (user.lastName) return user.lastName;
  return user.email;
}

function parentOf(path: string, appRoot: string): string {
  if (path === appRoot) return appRoot;
  const lastSlash = path.lastIndexOf('/');
  return lastSlash > 0 ? path.slice(0, lastSlash) : appRoot;
}

/**
 * Détermine si un `fullPath` DB matche un `path` d'entrée frontend.
 * Cf. doc en tête de fichier.
 */
function matchesPath(fullPath: string, inputPath: string): boolean {
  if (fullPath === inputPath) return true;
  if (fullPath.startsWith(`${inputPath}.`)) return true;
  return false;
}

/**
 * Construit l'URL relative qui sert un asset au navigateur.
 *
 * Le projet a deux routes de proxy :
 *   - `/api/media/by-public-id/<publicId>` pour les assets Cloudinary
 *   - `/api/media/r2/<fullPath>` pour les assets R2 (presigned redirect)
 *
 * On discrimine par la présence de `publicId` — non-null = Cloudinary,
 * null = R2. Les segments sont URL-encodés pour gérer les caractères
 * spéciaux dans les noms de dossier ou de fichier.
 *
 * Variant Cloudinary forcé à `large` par défaut — c'est ce qui marche
 * pour un usage typique en édition et en lecture publique. Si on veut
 * un autre variant (`thumb`, `original`...), on l'overridera côté
 * appelant en post-traitant l'URL ou en ajoutant un paramètre à la
 * procédure.
 */
function buildMediaProxyUrl(asset: {
  publicId: string | null;
  fullPath: string;
}): string {
  const encodeSegments = (path: string) =>
    path.split('/').map(encodeURIComponent).join('/');

  if (asset.publicId !== null) {
    return `/api/media/by-public-id/${encodeSegments(asset.publicId)}?variant=large`;
  }
  return `/api/media/r2/${encodeSegments(asset.fullPath)}`;
}

/* -------------------------------------------------------------------------- */
/*                                 ROUTER                                     */
/* -------------------------------------------------------------------------- */

export const mediaRouter = router({
  /**
   * Lookup batch des MediaAsset rows pour une liste de paths.
   * Matching tolérant à l'extension (cf. doc en tête de fichier).
   */
  getByPaths: protectedProcedure
    .input(
      z.object({
        appRoot: z.string().min(1),
        paths: z.array(z.string()).max(500),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.paths.length === 0) return {};

      // Construit les conditions OR : pour chaque path, on essaie
      // (exact match) OU (match avec extension).
      const orConditions = input.paths.flatMap((p) => [
        { fullPath: p },
        { fullPath: { startsWith: `${p}.` } },
      ]);

      const assets = await ctx.prisma.mediaAsset.findMany({
        where: {
          appRoot: input.appRoot,
          OR: orConditions,
        },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              pseudo: true,
              email: true,
            },
          },
        },
      });

      const byPath: Record<
        string,
        {
          createdAt: string;
          uploadedBy: string;
          uploaderId: string;
          mimeType: string;
          width: number | null;
          height: number | null;
          duration: number | null;
          description: string | null;
          bytes: number;
        }
      > = {};

      for (const asset of assets) {
        if (!asset.fullPath) continue;
        // Retrouve le path d'entrée qui matche cet asset.
        // O(N) par asset, donc O(N*M) global — acceptable pour N,M ≤ 500.
        const inputPath = input.paths.find((p) => matchesPath(asset.fullPath!, p));
        if (!inputPath) continue;

        byPath[inputPath] = {
          createdAt: asset.uploadedAt.toISOString(),
          uploadedBy: composeDisplayName(asset.uploader),
          uploaderId: asset.uploader.id,
          mimeType: asset.mimeType,
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
          description: asset.description,
          bytes: asset.bytes,
        };
      }

      return byPath;
    }),

  /**
   * 🔗 Résout une liste de paths (côté UI/finder) vers leur `mediaId`
   * stable correspondant.
   *
   * Consommé typiquement par le toolbar TipTap après un retour du
   * MediaPicker : le picker rend des paths, on les convertit en
   * mediaIds avant de les pousser dans les attrs du nœud
   * `library-image`.
   *
   * Matching tolérant à l'extension (cf. doc en tête de fichier) —
   * même mécanique que `getByPaths`, juste un retour plus restreint.
   *
   * Retourne un Record indexé par le path d'entrée. Si un path ne
   * correspond à aucun asset (cas anormal vu que les paths viennent
   * d'un picker qui liste ce qui existe), la valeur est `null` plutôt
   * que omise — ça simplifie la consommation côté client.
   */
  resolveByPaths: protectedProcedure
    .input(
      z.object({
        appRoot: z.string().min(1),
        paths: z.array(z.string().min(1)).max(500),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.paths.length === 0) {
        return {} as Record<string, string | null>;
      }

      const orConditions = input.paths.flatMap((p) => [
        { fullPath: p },
        { fullPath: { startsWith: `${p}.` } },
      ]);

      const assets = await ctx.prisma.mediaAsset.findMany({
        where: { appRoot: input.appRoot, OR: orConditions },
        select: { id: true, fullPath: true },
      });

      const byPath: Record<string, string | null> = {};
      for (const p of input.paths) byPath[p] = null;

      for (const asset of assets) {
        if (!asset.fullPath) continue;
        const inputPath = input.paths.find((p) =>
          matchesPath(asset.fullPath!, p),
        );
        if (inputPath) byPath[inputPath] = asset.id;
      }

      return byPath;
    }),

  /**
   * 🔗 Résout une liste de `mediaId` (cuid stable) vers les
   * informations nécessaires au rendu d'un asset (URL + metadata).
   *
   * Consommé par :
   *   - la NodeView `library-image` (un seul mediaId à chaque mount)
   *   - le `View` server-side d'un bloc tiptap (batch, depuis le
   *     walker ProseMirror — futur sous-chantier 6)
   *   - le `View` des blocs `image-gallery` / `audio-collection` /
   *     `document-list`
   *
   * ─── Politique : `published` uniquement ────────────────────────────
   *
   * On filtre `status === 'published'`. Un asset en `pending` ou en
   * `bin` n'est jamais résolu — le caller reçoit `null` pour cet id
   * et affichera son placeholder « média indisponible ». C'est cette
   * procédure qui matérialise la règle métier décidée au cadrage :
   * « ce qui est rendu provenant de la bibliothèque ne peut être pris
   * que sous published ».
   *
   * Retourne un Record indexé par mediaId. Les ids absents de la DB
   * ou non-published rendent `null`.
   */
  resolveByIds: protectedProcedure
    .input(
      z.object({
        mediaIds: z.array(z.string().min(1)).max(500),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.mediaIds.length === 0) {
        return {} as Record<string, ResolvedMedia | null>;
      }

      const assets = await ctx.prisma.mediaAsset.findMany({
        where: {
          id: { in: input.mediaIds },
          status: 'published',
        },
        select: {
          id: true,
          publicId: true,
          fullPath: true,
          mimeType: true,
          width: true,
          height: true,
          duration: true,
        },
      });

      const byId: Record<string, ResolvedMedia | null> = {};
      for (const id of input.mediaIds) byId[id] = null;

      for (const asset of assets) {
        byId[asset.id] = {
          url: buildMediaProxyUrl(asset),
          mimeType: asset.mimeType,
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
        };
      }

      return byId;
    }),

  /**
   * 🔎 Recherche récursive — files + folders (status + métier).
   * Matche par `fullPath` (clé universelle).
   */
  searchRecursive: protectedProcedure
    .input(
      z.object({
        appRoot: z.string().min(1),
        prefix: z.string().min(1),
        query: z.string().min(1).max(200),
        caseSensitive: z.boolean().default(false),
        wholeWord: z.boolean().default(false),
        useRegex: z.boolean().default(false),
        limit: z.number().int().positive().max(500).default(200),
      }),
    )
    .query(async ({ input, ctx }) => {
      // 1. Compile le matcher selon les flags
      let matcher: ((s: string) => boolean) | null = null;
      try {
        if (input.useRegex) {
          const flags = input.caseSensitive ? '' : 'i';
          const re = new RegExp(input.query, flags);
          matcher = (s: string) => re.test(s);
        } else {
          const escaped = input.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = input.wholeWord ? `\\b${escaped}\\b` : escaped;
          const flags = input.caseSensitive ? '' : 'i';
          const re = new RegExp(pattern, flags);
          matcher = (s: string) => re.test(s);
        }
      } catch {
        return { results: [], truncated: false };
      }

      // 2. Lookup DB — match par fullPath
      const candidates = await ctx.prisma.mediaAsset.findMany({
        where: {
          appRoot: input.appRoot,
          OR: [
            { fullPath: input.prefix },
            { fullPath: { startsWith: `${input.prefix}/` } },
          ],
        },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              pseudo: true,
              email: true,
            },
          },
        },
        take: input.limit * 5,
      });

      // 3a. FICHIERS qui matchent
      const filteredFiles = candidates.filter((asset) => {
        if (matcher!(asset.originalFileName)) return true;
        if (asset.description && matcher!(asset.description)) return true;
        const displayName = composeDisplayName(asset.uploader);
        if (matcher!(displayName)) return true;
        return false;
      });

      // 3b. DOSSIERS MÉTIER : dérivés des fullPaths des assets sous le prefix
      const folderPaths = new Set<string>();
      for (const asset of candidates) {
        if (!asset.fullPath) continue;
        const relative = asset.fullPath.startsWith(`${input.prefix}/`)
          ? asset.fullPath.slice(input.prefix.length + 1)
          : asset.fullPath === input.prefix
            ? ''
            : null;
        if (relative === null) continue;

        const segments = relative.split('/');
        if (segments.length <= 1) continue;

        let acc = input.prefix;
        for (let i = 0; i < segments.length - 1; i++) {
          acc = `${acc}/${segments[i]}`;
          folderPaths.add(acc);
        }
      }

      const matchedFolders: Array<{ path: string; name: string }> = [];
      for (const path of folderPaths) {
        const lastSlash = path.lastIndexOf('/');
        const name = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;
        if (matcher!(name)) {
          matchedFolders.push({ path, name });
        }
      }

      // 3c. STATUS FOLDERS — exposés depuis la racine
      const STATUS_FOLDERS = ['pending', 'published', 'bin'];
      const statusFolders: Array<{ path: string; name: string }> = [];
      if (input.prefix === input.appRoot) {
        for (const folder of STATUS_FOLDERS) {
          if (matcher!(folder)) {
            statusFolders.push({
              path: `${input.appRoot}/${folder}`,
              name: folder,
            });
          }
        }
      }

      // 4. Concat + truncation
      matchedFolders.sort((a, b) => a.path.localeCompare(b.path));
      const totalCount = statusFolders.length + matchedFolders.length + filteredFiles.length;
      const truncated = totalCount > input.limit;

      const folderResultsCount = statusFolders.length + matchedFolders.length;
      const fileBudget = Math.max(0, input.limit - folderResultsCount);
      const limitedFiles = filteredFiles.slice(0, fileBudget);

      // 5. Projection
      const folderResults = [...statusFolders, ...matchedFolders].map((f) => ({
        kind: 'folder' as const,
        id: `folder:${f.path}`,
        path: f.path,
        parentPath: parentOf(f.path, input.appRoot),
        name: f.name,
        mimeType: null,
        format: null,
        bytes: null,
        createdAt: null,
        uploadedBy: null,
        uploaderId: null,
        description: null,
        width: null,
        height: null,
        duration: null,
      }));

      const fileResults = limitedFiles.map((asset) => {
        const path = asset.fullPath!;
        const lastSlash = path.lastIndexOf('/');
        const parentPath = lastSlash > 0 ? path.slice(0, lastSlash) : input.appRoot;
        const name = lastSlash > 0 ? path.slice(lastSlash + 1) : path;

        return {
          kind: 'file' as const,
          id: asset.id,
          path,
          parentPath,
          name,
          mimeType: asset.mimeType,
          format: asset.format,
          bytes: asset.bytes,
          createdAt: asset.uploadedAt.toISOString(),
          uploadedBy: composeDisplayName(asset.uploader),
          uploaderId: asset.uploader.id,
          description: asset.description,
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
        };
      });

      return { results: [...folderResults, ...fileResults], truncated };
    }),

  /**
   * ✏️ Mise à jour de la description d'un fichier.
   * Matching tolérant à l'extension (cf. doc en tête de fichier).
   */
  updateDescription: protectedProcedure
    .input(
      z.object({
        appRoot: z.string().min(1),
        path: z.string().min(1),
        description: z.string().max(2000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.prisma.mediaAsset.updateMany({
        where: {
          appRoot: input.appRoot,
          OR: [
            { fullPath: input.path },
            { fullPath: { startsWith: `${input.path}.` } },
          ],
        },
        data: {
          description: input.description.trim() || null,
        },
      });

      if (result.count === 0) {
        throw new Error(
          `Aucune MediaAsset trouvée pour ce fichier (path: ${input.path}). ` +
            `Si c'est un fichier R2 historique, lance le backfill ` +
            `via /api/admin/backfill-r2-assets.`,
        );
      }

      if (result.count > 1) {
        // Cas improbable mais on log : deux Cloudinary "trotinette.jpg" et "trotinette.png"
        // au même path racine matcheraient tous les deux. À ce stade c'est très peu
        // probable dans la convention AKFC, mais on garde la trace en cas de.
        console.warn(
          `[media.updateDescription] ${result.count} rows updated pour path="${input.path}" ` +
            `— le path matche plusieurs MediaAssets. À investiguer si non intentionnel.`,
        );
      }

      return { ok: true, updatedAt: new Date().toISOString() };
    }),
});
