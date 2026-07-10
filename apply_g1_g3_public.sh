#!/bin/bash
# Chantier galeries — G.1→G.3 : getPublicIndex session-aware + garde
# visibilité sur getBySlug, page publique /gallery (exit le stub),
# lightbox carousel (lecture auto, chevrons, clavier).
# À lancer depuis la RACINE du monorepo : bash apply_g1_g3_public.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

mkdir -p apps/web/src/features/gallery-public

echo "-> packages/backend/src/modules/galleries/router.ts"
cat > 'packages/backend/src/modules/galleries/router.ts' << 'FILE_EOF'
import {
  router,
  protectedProcedure,
  publicProcedure,
} from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";
import { slugSchema } from "@contracts/slug/slug.schema";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import { deriveMediaKind } from "@backend/modules/media/helpers/deriveMediaKind";
import { z } from "zod";

/**
 * Router `gallery`.
 *
 * Une Gallery réutilise des MediaAsset existants via GalleryItem (jointure
 * ordonnée). Rattachements optionnels et CUMULABLES (discipline,
 * catégorie, stage, event, origine) — les facettes de la future
 * recherche. Une galerie sans rattachement au slug réservé
 * `CAROUSEL_SLUG` sert de carousel d'accueil.
 *
 * - Lectures publiques : `getBySlug`, `getCarousel`.
 * - Écritures + lectures admin : `requirePermission("manage_galleries")`.
 */

/** Slug réservé pour le carousel de la page d'accueil. */
export const CAROUSEL_SLUG = "home-carousel";

type GalleryItemWithAsset = Prisma.GalleryItemGetPayload<{
  include: { mediaAsset: true };
}>;

/**
 * Items publiés → shape publique (URL proxy audience `public`, kind dérivé,
 * poster vidéo). Partagé par `getCarousel` et `getPublicIndex`.
 */
function mapPublicItems(items: GalleryItemWithAsset[]) {
  return items
    .filter((it) => it.mediaAsset.status === "published")
    .map((it) => {
      const a = it.mediaAsset;
      const kind = deriveMediaKind(a.resourceType, a.mimeType);
      const url = buildMediaProxyUrl(
        { publicId: a.publicId, fullPath: a.fullPath },
        "public",
      );

      return {
        mediaAssetId: it.mediaAssetId,
        url,
        kind,
        posterUrl: kind === "video" ? `${url}&as=poster` : null,
        mimeType: a.mimeType,
        fileName: a.fullPath.split("/").pop() ?? a.fullPath,
        width: a.width,
        height: a.height,
      };
    });
}

/** include standard : items ordonnés + l'asset média de chaque item. */
const galleryWithItems = {
  items: {
    orderBy: { sortOrder: "asc" },
    include: { mediaAsset: true },
  },
} satisfies Prisma.GalleryInclude;

const themeFields = {
  disciplineId: z.number().int().positive().nullable().optional(),
  stageId: z.number().int().positive().nullable().optional(),
  eventId: z.number().int().positive().nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  originId: z.number().int().positive().nullable().optional(),
};

const createInput = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Le titre est obligatoire.").max(120),
  date: z.coerce.date().nullable().optional(),
  visibility: z.enum(["PUBLIC", "MEMBERS"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
  ...themeFields,
});

const updateInput = z.object({
  id: z.number().int().positive(),
  slug: slugSchema.optional(),
  title: z.string().trim().min(1).max(120).optional(),
  date: z.coerce.date().nullable().optional(),
  visibility: z.enum(["PUBLIC", "MEMBERS"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
  ...themeFields,
});

export const galleryRouter = router({
  /* ----- Lectures admin ----- */

  getAll: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .query(async ({ ctx }) => {
      return ctx.prisma.gallery.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { items: true } },
          discipline: { select: { id: true, name: true } },
          stage: { select: { id: true, label: true } },
          event: { select: { id: true, label: true } },
          category: { select: { id: true, type: true } },
          origin: { select: { id: true, name: true } },
        },
      });
    }),

  getById: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const gallery = await ctx.prisma.gallery.findUnique({
        where: { id: input.id },
        include: galleryWithItems,
      });
      if (!gallery) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Galerie introuvable.",
        });
      }
      return gallery;
    }),

  /* ----- Lectures publiques ----- */

  getBySlug: publicProcedure
    .input(z.object({ slug: slugSchema }))
    .query(async ({ ctx, input }) => {
      const gallery = await ctx.prisma.gallery.findUnique({
        where: { slug: input.slug },
        include: galleryWithItems,
      });
      if (
        !gallery ||
        (gallery.visibility === "MEMBERS" && !ctx.sessionClient?.user)
      ) {
        // NOT_FOUND aussi pour MEMBERS+anonyme : ne pas révéler l'existence.
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Galerie introuvable.",
        });
      }
      return gallery;
    }),

  /**
   * Récupère la galerie du carousel d'accueil (slug `CAROUSEL_SLUG`) avec ses
   * items filtrés (assets publiés uniquement) et transformés (URL de proxy +
   * métadonnées + kind/posterUrl).
   *
   * Accessible publiquement pour afficher le carousel sur la page d'accueil
   * sans authentification.
   *
   * Le `kind` est dérivé via le helper partagé `deriveMediaKind` (même logique
   * que `media.resolveByIds`), et le poster vidéo via la route proxy `&as=poster`.
   * Les URLs sont construites pour l'audience `public` (les assets R2
   * éventuels passent alors par la route publique).
   */
  getCarousel: publicProcedure.query(async ({ ctx }) => {
    const gallery = await ctx.prisma.gallery.findUnique({
      where: { slug: CAROUSEL_SLUG },
      include: galleryWithItems,
    });
    if (!gallery) return null;

    return {
      id: gallery.id,
      slug: gallery.slug,
      title: gallery.title,
      items: mapPublicItems(gallery.items),
    };
  }),

  /**
   * Index public des galeries — SESSION-AWARE : un visiteur anonyme ne
   * reçoit que les galeries PUBLIC ; un membre connecté reçoit aussi les
   * MEMBERS (droit à l'image : la visibilité se décide PAR galerie). Le
   * carousel d'accueil (slug réservé) est exclu — il a sa page. Items
   * publiés uniquement, même mapping que le carousel. Tri : date desc
   * (sans date en dernier), puis sortOrder.
   */
  getPublicIndex: publicProcedure.query(async ({ ctx }) => {
    const galleries = await ctx.prisma.gallery.findMany({
      where: {
        slug: { not: CAROUSEL_SLUG },
        ...(ctx.sessionClient?.user ? {} : { visibility: "PUBLIC" as const }),
      },
      orderBy: [
        { date: { sort: "desc", nulls: "last" } },
        { sortOrder: "asc" },
      ],
      include: galleryWithItems,
    });

    return galleries.map((g) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      date: g.date,
      visibility: g.visibility,
      items: mapPublicItems(g.items),
    }));
  }),

  /* ----- Écritures ----- */

  create: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.gallery.create({ data: input });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ce slug de galerie est déjà utilisé.",
          });
        }
        throw e;
      }
    }),

  update: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      try {
        return await ctx.prisma.gallery.update({ where: { id }, data });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ce slug de galerie est déjà utilisé.",
          });
        }
        throw e;
      }
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Les GalleryItem sont supprimés en cascade (FK onDelete: Cascade).
      return ctx.prisma.gallery.delete({ where: { id: input.id } });
    }),

  /* ----- Gestion des items (ajout / retrait / réordonnancement) ----- */

  /**
   * Remplace l'intégralité des items d'une galerie par la liste ordonnée
   * `mediaAssetIds` (le `sortOrder` suit l'index du tableau). Couvre en une
   * seule opération l'ajout, le retrait et le réordonnancement — pratique
   * pour un écran admin en drag-and-drop. Transactionnel.
   */
  setItems: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(
      z.object({
        galleryId: z.number().int().positive(),
        mediaAssetIds: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        await tx.galleryItem.deleteMany({
          where: { galleryId: input.galleryId },
        });

        if (input.mediaAssetIds.length > 0) {
          await tx.galleryItem.createMany({
            data: input.mediaAssetIds.map((mediaAssetId, index) => ({
              galleryId: input.galleryId,
              mediaAssetId,
              sortOrder: index,
            })),
            skipDuplicates: true,
          });
        }

        return tx.gallery.findUnique({
          where: { id: input.galleryId },
          include: galleryWithItems,
        });
      });
    }),
});

export default galleryRouter;
FILE_EOF

echo "-> apps/web/src/features/gallery-public/GalleryLightbox.tsx"
cat > 'apps/web/src/features/gallery-public/GalleryLightbox.tsx' << 'FILE_EOF'
"use client";

import { useCallback, useEffect, useState, type JSX } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";

/**
 * Lightbox carousel des galeries publiques — overlay plein écran à fond
 * translucide (noir 80 % + blur), la liste des contenus de la galerie
 * cliquée se lit sur place : chevrons, flèches clavier, Escape / clic
 * sur le fond / croix pour fermer, compteur, et LECTURE AUTO togglable
 * (~4 s par slide). L'autoplay se coupe sur toute navigation manuelle
 * et pour les vidéos (on ne coupe pas quelqu'un qui regarde).
 */

export interface LightboxItem {
  mediaAssetId: string;
  url: string;
  kind: string;
  posterUrl: string | null;
  fileName: string;
}

interface GalleryLightboxProps {
  items: LightboxItem[];
  initialIndex: number;
  onClose: () => void;
}

const AUTOPLAY_MS = 4000;

export function GalleryLightbox({
  items,
  initialIndex,
  onClose,
}: GalleryLightboxProps): JSX.Element | null {
  const [index, setIndex] = useState(initialIndex);
  const [autoplay, setAutoplay] = useState(false);

  const count = items.length;
  const current = items[index];

  const goTo = useCallback(
    (next: number, manual: boolean) => {
      setIndex(((next % count) + count) % count);
      if (manual) setAutoplay(false);
    },
    [count],
  );

  // Lecture auto — jamais sur une vidéo (elle a son propre temps).
  useEffect(() => {
    if (!autoplay || count < 2) return;
    if (current?.kind === "video") return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [autoplay, count, current?.kind]);

  // Clavier : ← → naviguent (manuel), Escape ferme.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goTo(index + 1, true);
      else if (e.key === "ArrowLeft") goTo(index - 1, true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo, onClose]);

  if (!current) return null;

  const controlClass =
    "rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse de la galerie"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Contenu — le clic n'y ferme pas (stopPropagation) */}
      <div
        className="relative flex max-h-[90dvh] max-w-[92vw] flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {current.kind === "video" ? (
          <video
            key={current.mediaAssetId}
            src={current.url}
            poster={current.posterUrl ?? undefined}
            controls
            className="max-h-[78dvh] max-w-[92vw] rounded-md"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- URL proxy signée, dimensions inconnues
          <img
            key={current.mediaAssetId}
            src={current.url}
            alt={current.fileName}
            className="max-h-[78dvh] max-w-[92vw] rounded-md object-contain"
          />
        )}

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Média précédent"
            onClick={() => goTo(index - 1, true)}
            className={controlClass}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-pressed={autoplay}
            aria-label={
              autoplay ? "Arrêter la lecture auto" : "Lancer la lecture auto"
            }
            onClick={() => setAutoplay((a) => !a)}
            className={controlClass}
          >
            {autoplay ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>

          <span className="text-sm tabular-nums text-white/80">
            {index + 1} / {count}
          </span>

          <button
            type="button"
            aria-label="Média suivant"
            onClick={() => goTo(index + 1, true)}
            className={controlClass}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label="Fermer la visionneuse"
        autoFocus
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(public)/gallery/page.tsx"
cat > 'apps/web/src/app/(public)/gallery/page.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useState, type JSX } from "react";
import { Lock, Play } from "lucide-react";

import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import {
  GalleryLightbox,
  type LightboxItem,
} from "@features/gallery-public/GalleryLightbox";

/**
 * Page publique des galeries — `/gallery`.
 *
 * Client Component assumé (choix G.2) : la visibilité dépend de la
 * session, `gallery.getPublicIndex` est SESSION-AWARE côté serveur (le
 * cookie voyage avec la requête) — une seule logique, une seule requête,
 * pour l'anonyme comme pour le membre. Un membre voit en plus les
 * galeries MEMBERS, marquées d'un cadenas (droit à l'image : visibilité
 * décidée PAR galerie).
 *
 * Clic sur un contenu → la galerie entière se lit en lightbox carousel
 * (GalleryLightbox), à l'index cliqué.
 */

type PublicGallery = Awaited<
  ReturnType<typeof trpcClient.gallery.getPublicIndex.query>
>[number];

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PublicGalleryPage(): JSX.Element {
  // Re-fetch quand la session apparaît/disparaît (les MEMBERS suivent).
  const userId = useSessionStore((s) => s.session?.user?.id ?? null);
  const [galleries, setGalleries] = useState<PublicGallery[] | null>(null);
  const [lightbox, setLightbox] = useState<{
    items: LightboxItem[];
    index: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void trpcClient.gallery.getPublicIndex.query().then((data) => {
      if (!cancelled) setGalleries(data);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const visible = (galleries ?? []).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">La galerie</h1>

      {galleries === null ? (
        <p className="text-gray-500">Chargement…</p>
      ) : visible.length === 0 ? (
        <p className="text-gray-500">Aucune galerie pour l&apos;instant.</p>
      ) : (
        <div className="flex flex-col gap-12">
          {visible.map((g) => (
            <section key={g.id} aria-label={g.title}>
              <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-xl font-semibold">{g.title}</h2>
                {g.date && (
                  <time className="text-sm text-gray-500">
                    {formatDate(g.date)}
                  </time>
                )}
                {g.visibility === "MEMBERS" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    <Lock className="h-3 w-3" />
                    Membres
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {g.items.map((item, i) => (
                  <button
                    key={item.mediaAssetId}
                    type="button"
                    onClick={() => setLightbox({ items: g.items, index: i })}
                    className="group relative aspect-square overflow-hidden rounded-md bg-gray-100"
                    aria-label={`Ouvrir ${item.fileName} dans la visionneuse`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- URLs proxy signées */}
                    <img
                      src={
                        item.kind === "video"
                          ? (item.posterUrl ?? item.url)
                          : item.url
                      }
                      alt={item.fileName}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {item.kind === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <Play className="h-8 w-8 text-white drop-shadow" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {lightbox && (
        <GalleryLightbox
          items={lightbox.items}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
FILE_EOF

echo
pnpm --filter backend typecheck && pnpm --filter web typecheck