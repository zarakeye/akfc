/**
 * 📂 Module `media` — accès aux métadonnées MediaAsset depuis le finder
 *
 * Matching EXACT par `fullPath` : la clé de stockage EST le chemin. (L'époque Cloudinary tolérait un
 * chemin sans extension, `startsWith(path + '.')` ; sur R2 un chemin porte toujours la sienne, et
 * cette tolérance faisait correspondre « photo.jpg » à « photo.jpg.zip ».)
 *
 * Les résultats sont **toujours indexés par le path d'entrée** (UI-facing),
 * pas par le fullPath DB. C'est ce que le frontend attend depuis Phase 1.
 */

import { assertCanTrashPaths } from "@backend/modules/memberGroups/assertCanTrashPaths.service";
import { outsideBin } from '@backend/modules/storage/mediaPaths';
import { assertCanReadPaths } from "@backend/modules/memberGroups/assertCanReadPaths.service";
import { canReadStorageKey } from "@backend/modules/media/services/canReadStorageKey.service";
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '@backend/trpc';
import { sameAppRoot } from '@backend/trpc/middleware';
import type { ResolvedMedia } from '@contracts/page';
import { deriveMediaKind } from '@backend/modules/media/helpers/deriveMediaKind';
import { buildMediaProxyUrl } from '@backend/modules/media/helpers/media-url';
import { assertStatusChangeDoesntUnpublishReferencedAssets } from '@backend/modules/media/services/assertStatusChangeDoesntUnpublishReferencedAssets.service';

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function composeDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
}): string {
  if (user.pseudo && user.pseudo.trim()) return user.pseudo.trim();
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  if (user.lastName) return user.lastName;
  // Pas d'adresse e-mail en repli : ces listes servent aussi aux membres (espaces de groupe).
  return "Membre";
}

function parentOf(path: string, appRoot: string): string {
  if (path === appRoot) return appRoot;
  const lastSlash = path.lastIndexOf('/');
  return lastSlash > 0 ? path.slice(0, lastSlash) : appRoot;
}

/** Dernier segment d'un fullPath → nom de fichier. */
function fileNameOf(fullPath: string): string {
  return fullPath.split('/').pop() ?? fullPath;
}

/* -------------------------------------------------------------------------- */
/*                                 ROUTER                                     */
/* -------------------------------------------------------------------------- */

/** Procédure connectée dont l'`appRoot` éventuel doit être celui du serveur. */
const storageProcedure = protectedProcedure.use(sameAppRoot);

export const mediaRouter = router({
  /**
   * Lookup batch des MediaAsset rows pour une liste de paths (matching exact).
   */
  getByPaths: storageProcedure
    .input(
      z.object({
        appRoot: z.string().min(1),
        paths: z.array(z.string()).max(500),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.paths.length === 0) return {};
      // Statut, auteur, description : la même règle que la lecture du dossier.
      await assertCanReadPaths({ prisma: ctx.prisma, userId: ctx.sessionClient.user.id, paths: input.paths });

      const assets = await ctx.prisma.mediaAsset.findMany({
        where: {
          appRoot: input.appRoot,
          fullPath: { in: input.paths },
        },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              pseudo: true,
            },
          },
        },
      });

      const byPath: Record<
        string,
        {
          status: string;
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
        byPath[asset.fullPath] = {
          // Source de vérité visée du statut (cf. MediaMeta.status).
          status: asset.status,
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
   * Retourne un Record indexé par le path d'entrée. Si un path ne
   * correspond à aucun asset, la valeur est `null` plutôt qu'omise.
   */
  resolveByPaths: storageProcedure
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
      await assertCanReadPaths({ prisma: ctx.prisma, userId: ctx.sessionClient.user.id, paths: input.paths });

      const assets = await ctx.prisma.mediaAsset.findMany({
        where: { appRoot: input.appRoot, fullPath: { in: input.paths } },
        select: { id: true, fullPath: true },
      });

      const byPath: Record<string, string | null> = {};
      for (const p of input.paths) byPath[p] = null;

      for (const asset of assets) byPath[asset.fullPath] = asset.id;

      return byPath;
    }),

  /**
   * 🔗 Résout une liste de `mediaId` (cuid stable) vers les
   * informations nécessaires au rendu d'un asset (URL + metadata).
   *
   * ─── Politique : `published` uniquement ────────────────────────────
   *
   * On filtre `status === 'published'`. Un asset en `pending` ou en
   * `bin` n'est jamais résolu — le caller reçoit `null` pour cet id
   * et affichera son placeholder « média indisponible ».
   *
   * La forme de retour est le type canonique `ResolvedMedia`
   * (`@contracts/page`) — source unique partagée avec le PageRenderer,
   * le MediaListEditor (qui l'infère via inferRouterOutputs) et le
   * MediaItemsEditor.
   *
   * Retourne un Record indexé par mediaId. Les ids absents de la DB
   * ou non-published rendent `null`.
   *
   * ─── Ce que l'appelant peut lire ───────────────────────────────────
   *
   * Un administrateur résout tout. Un autre membre (un instructeur qui rédige sa présentation)
   * ne résout que les fichiers qu'il peut LIRE (`canReadStorageKey` : son espace, ses groupes) ;
   * les autres rendent `null`, comme un fichier introuvable. Sans ce filtre, un identifiant
   * suffisait à apprendre le chemin et le nom d'origine de n'importe quel fichier validé.
   */
  resolveByIds: storageProcedure
    .input(
      z.object({
        mediaIds: z.array(z.string().min(1)).max(500),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.mediaIds.length === 0) {
        return {} as Record<string, ResolvedMedia | null>;
      }

      const found = await ctx.prisma.mediaAsset.findMany({
        where: {
          id: { in: input.mediaIds },
          status: 'published',
          // Un fichier jeté (sa ligne a suivi l'objet dans la corbeille) ne se résout plus.
          ...outsideBin(ctx.appRoot),
        },
        select: {
          id: true,
          fullPath: true,
          displayName: true,
          originalFileName: true,
          mimeType: true,
          width: true,
          height: true,
          duration: true,
        },
      });
      const assets = ctx.sessionClient.user.isAdmin
        ? found
        : (
            await Promise.all(
              found.map(async (asset) =>
                (await canReadStorageKey({ prisma: ctx.prisma, userId: ctx.sessionClient.user.id, key: asset.fullPath }))
                  ? asset
                  : null,
              ),
            )
          ).filter((asset) => asset !== null);

      const byId: Record<string, ResolvedMedia | null> = {};
      for (const id of input.mediaIds) byId[id] = null;

      for (const asset of assets) {
        const kind = deriveMediaKind(asset.mimeType);
        const baseUrl = buildMediaProxyUrl(asset);

        byId[asset.id] = {
          url: baseUrl,
          kind,
          posterUrl: kind === 'video' ? `${baseUrl}&as=poster` : null,
          mimeType: asset.mimeType,
          fileName:
            asset.displayName?.trim() ||
            asset.originalFileName ||
            fileNameOf(asset.fullPath),
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
  searchRecursive: storageProcedure
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
      // On ne cherche que là où l'on peut lire : sans cette garde, la recherche listait les
      // fichiers de toute la bibliothèque (espaces personnels et autres groupes compris).
      await assertCanReadPaths({ prisma: ctx.prisma, userId: ctx.sessionClient.user.id, paths: [input.prefix] });

      // Une expression régulière fournie par l'utilisateur s'exécute sur le serveur : une expression
      // mal construite (« (a+)+$ ») peut le bloquer de longues secondes. Réservée aux administrateurs.
      if (input.useRegex && !ctx.sessionClient.user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "La recherche par expression régulière est réservée aux administrateurs.",
        });
      }

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

      // 2. Lecture par paquets, triés par chemin, jusqu'à avoir assez de fichiers qui correspondent.
      //
      // Le filtre (nom, description, expéditeur, éventuellement une expression régulière) s'exécute
      // ici et non en base : lire « les N premiers » puis filtrer manquerait tout fichier qui
      // correspond au-delà de ces N. On lit donc tout le sous-arbre, paquet par paquet, dans une
      // limite de SCAN_MAX lignes (le résultat est alors signalé tronqué).
      const SCAN_BATCH = 500;
      const SCAN_MAX = 10_000;
      const candidates: Array<Awaited<ReturnType<typeof fetchBatch>>[number]> = [];
      async function fetchBatch(cursor: string | undefined) {
        return ctx.prisma.mediaAsset.findMany({
          where: {
            appRoot: input.appRoot,
            OR: [{ fullPath: input.prefix }, { fullPath: { startsWith: `${input.prefix}/` } }],
            // Depuis la racine, la corbeille n'est pas fouillée : ses fichiers ont leur propre vue.
            ...(input.prefix.startsWith(`${input.appRoot}/bin`) ? {} : outsideBin(input.appRoot)),
          },
          include: {
            uploader: { select: { id: true, firstName: true, lastName: true, pseudo: true } },
          },
          orderBy: { fullPath: 'asc' },
          take: SCAN_BATCH,
          ...(cursor ? { cursor: { fullPath: cursor }, skip: 1 } : {}),
        });
      }
      let scanTruncated = false;
      for (let cursor: string | undefined; ; ) {
        const batch = await fetchBatch(cursor);
        candidates.push(...batch);
        if (batch.length < SCAN_BATCH) break;
        if (candidates.length >= SCAN_MAX) {
          scanTruncated = true;
          break;
        }
        cursor = batch[batch.length - 1].fullPath;
      }

      // 3a. FICHIERS qui matchent : nom d'origine, nom d'affichage, description, expéditeur.
      const filteredFiles = candidates.filter((asset) => {
        if (matcher!(asset.originalFileName)) return true;
        if (asset.displayName && matcher!(asset.displayName)) return true;
        if (asset.description && matcher!(asset.description)) return true;
        const displayName = composeDisplayName(asset.uploader);
        if (matcher!(displayName)) return true;
        return false;
      });

      // 3b. DOSSIERS MÉTIER : dérivés des fullPaths des assets sous le prefix
      const folderPaths = new Set<string>();
      for (const asset of candidates) {
        if (!asset.fullPath) continue;
        const fullPath = asset.fullPath;
        const relative = fullPath.startsWith(`${input.prefix}/`)
          ? fullPath.slice(input.prefix.length + 1)
          : fullPath === input.prefix
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

      // 3c. La corbeille, vrai dossier de la racine, reste cherchable.
      const STATUS_FOLDERS = ['bin'];
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
      const truncated = scanTruncated || totalCount > input.limit;

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
        // `id` reste le cuid `MediaAsset.id` ; le chemin EST la clé de stockage.
        const path = asset.fullPath;
        const lastSlash = path.lastIndexOf('/');
        const parentPath = lastSlash > 0 ? path.slice(0, lastSlash) : input.appRoot;
        const name =
          asset.displayName?.trim() ||
          asset.originalFileName ||
          (lastSlash > 0 ? path.slice(lastSlash + 1) : path);

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
   */
  updateDescription: storageProcedure
    .input(
      z.object({
        appRoot: z.string().min(1),
        path: z.string().min(1),
        description: z.string().max(2000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Même droit que la mise à la corbeille : un administrateur partout, un membre
      // seulement dans l'espace d'un groupe dont il est éditeur.
      await assertCanTrashPaths({ prisma: ctx.prisma, userId: ctx.sessionClient.user.id, paths: [input.path] });

      const result = await ctx.prisma.mediaAsset.updateMany({
        where: {
          appRoot: input.appRoot,
          fullPath: input.path,
        },
        data: {
          description: input.description.trim() || null,
        },
      });

      if (result.count === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Fichier introuvable." });
      }

      return { ok: true, updatedAt: new Date().toISOString() };
    }),

  /**
   * 🔀 Changement de statut — **publier n'est pas un déplacement**.
   *
   * Au temps de Cloudinary, le statut était un segment du chemin (`AKFC/pending/…`,
   * `AKFC/published/…`) : publier déplaçait le binaire, changeait son URL et toutes ses
   * références. Ici, c'est un UPDATE de `MediaAsset.status`, la source de vérité : atomique, sans
   * aller-retour avec le stockage, sans binaire qui bouge.
   *
   *   - `file`   : la ligne dont `fullPath` est ce chemin. Zéro ligne est une anomalie (le statut
   *                n'aurait pas pris sans que personne le sache) : NOT_FOUND.
   *   - `folder` : toutes les lignes SOUS ce dossier (le `/` final évite que `cours` emporte
   *                `cours-avance`). Zéro ligne est légitime : un dossier vide n'a rien à publier.
   *
   * La corbeille n'est pas un statut : y entrer, c'est `trash.trashToBin`.
   */
  setStatus: storageProcedure
    .input(
      z.object({
        appRoot: z.string().min(1),
        sources: z
          .array(
            z.object({
              kind: z.enum(["file", "folder"]),
              path: z.string().min(1),
            }),
          )
          .min(1),
        status: z.enum(["pending", "published"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Valider ou remettre en attente : un administrateur partout, un membre seulement
      // dans l'espace d'un groupe dont il est éditeur (même règle que la corbeille).
      await assertCanTrashPaths({
        prisma: ctx.prisma,
        userId: ctx.sessionClient.user.id,
        paths: input.sources.map((s) => s.path),
      });

      // AVANT le moindre UPDATE : on ne dépublie pas ce qu'une page ou une galerie affiche.
      await assertStatusChangeDoesntUnpublishReferencedAssets(
        ctx.prisma,
        input.sources,
        input.status,
        input.appRoot,
      );

      const results = await Promise.all(
        input.sources.map(async (source) => {
          if (source.kind === "file") {
            const { count } = await ctx.prisma.mediaAsset.updateMany({
              where: { appRoot: input.appRoot, fullPath: source.path },
              data: { status: input.status },
            });
            return { source, count };
          }

          // Dossier : tout ce qui vit SOUS lui. Le `/` final n'est pas cosmétique — sans lui,
          // publier `cours` publierait aussi `cours-avance`.
          const { count } = await ctx.prisma.mediaAsset.updateMany({
            where: {
              appRoot: input.appRoot,
              fullPath: { startsWith: `${source.path}/` },
            },
            data: { status: input.status },
          });
          return { source, count };
        }),
      );

      const silent = results.filter(
        (r) => r.source.kind === "file" && r.count === 0,
      );
      if (silent.length > 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Fichier introuvable : ${silent.map((r) => r.source.path).join(", ")}.`,
        });
      }

      return {
        ok: true,
        updated: results.reduce((n, r) => n + r.count, 0),
      };
    }),
});
