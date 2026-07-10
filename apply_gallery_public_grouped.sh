#!/bin/bash
# Vue publique des galeries : filtre ORIGINE + groupement Structure Y
# (discipline -> categorie Cours/Stage/Event -> galerie -> medias), tous
# niveaux multi-ouverture, groupes vides masques. Groupe "Divers" en fin
# pour les galeries sans discipline / categorie General (vie du club).
# Backend : getPublicIndex expose desormais discipline/category/origin.
# NB : l ordre des disciplines et les libelles Cours/Stage/Event sont des
# constantes dans GalleryGroupedView.tsx (a ajuster si tes noms different).
# À lancer depuis la RACINE du monorepo : bash apply_gallery_public_grouped.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

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
      include: {
        ...galleryWithItems,
        // Facettes nécessaires au groupement/filtrage de la vue publique :
        // discipline (niveau 1), catégorie (niveau 2), origine (filtre).
        discipline: { select: { id: true, name: true } },
        category: { select: { id: true, type: true } },
        origin: { select: { id: true, name: true } },
      },
    });

    return galleries.map((g) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      date: g.date,
      visibility: g.visibility,
      discipline: g.discipline,
      category: g.category,
      origin: g.origin,
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

echo "-> apps/web/src/features/gallery-public/GalleryGroupedView.tsx"
cat > 'apps/web/src/features/gallery-public/GalleryGroupedView.tsx' << 'FILE_EOF'
"use client";

import { useMemo, useState, type JSX } from "react";
import { ChevronRight, Lock } from "lucide-react";

import { GalleryGrid } from "@features/gallery-public/GalleryGrid";
import { type LightboxItem } from "@features/gallery-public/GalleryLightbox";

/**
 * Vue publique groupée des galeries — Structure Y :
 *   niveau 1 : DISCIPLINE (ordre métier ci-dessous ; « Divers » en fin pour
 *              les galeries sans discipline / catégorie General),
 *   niveau 2 : CATÉGORIE (Cours → Stages → Events),
 *   niveau 3 : GALERIE (togglable),
 *   niveau 4 : MÉDIAS (GalleryGrid → lightbox via onItemClick).
 *
 * Tous les niveaux sont MULTI-OUVERTURE (Set d'ids ouverts par niveau).
 * Tout groupe/sous-groupe sans galerie est masqué (construit à partir des
 * données, donc un groupe vide n'existe simplement pas).
 *
 * Le filtrage par origine est fait EN AMONT par le parent (la liste reçue
 * est déjà filtrée) ; ce composant ne s'occupe que du groupement/affichage.
 */

export interface GroupedGallery {
  id: number;
  title: string;
  date: Date | null;
  visibility: string;
  discipline: { id: number; name: string } | null;
  category: { id: number; type: string } | null;
  origin: { id: number; name: string } | null;
  items: LightboxItem[];
}

interface GalleryGroupedViewProps {
  galleries: GroupedGallery[];
  onItemClick: (items: LightboxItem[], index: number) => void;
}

/** Ordre métier des disciplines (par nom). Les absentes suivent, triées
 *  alphabétiquement, avant le groupe « Divers » toujours en dernier. */
const DISCIPLINE_ORDER = [
  "Taolus multi-styles",
  "Tchoy Lee Fut",
  "Taïchi Chuan",
  "Kali",
  "Calligraphie chinoise",
];

/** Ordre des catégories (par type). Les autres ne sont pas affichées ici. */
const CATEGORY_ORDER = ["Cours", "Stage", "Event"];

/** Libellé du groupe « sans discipline » (catégorie General / transverses). */
const DIVERS_LABEL = "Divers";

function disciplineRank(name: string): number {
  const i = DISCIPLINE_ORDER.indexOf(name);
  return i === -1 ? DISCIPLINE_ORDER.length : i;
}

function categoryRank(type: string): number {
  const i = CATEGORY_ORDER.indexOf(type);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

interface CategoryGroup {
  key: string;
  label: string;
  galleries: GroupedGallery[];
}
interface DisciplineGroup {
  key: string;
  label: string;
  isDivers: boolean;
  categories: CategoryGroup[];
  // Galeries directes (groupe Divers : pas de sous-catégorie).
  directGalleries: GroupedGallery[];
}

export function GalleryGroupedView({
  galleries,
  onItemClick,
}: GalleryGroupedViewProps): JSX.Element {
  const [openDisc, setOpenDisc] = useState<Set<string>>(new Set());
  const [openCat, setOpenCat] = useState<Set<string>>(new Set());
  const [openGallery, setOpenGallery] = useState<Set<number>>(new Set());

  // Construction de la hiérarchie discipline → catégorie → galeries. Un
  // groupe n'existe que s'il contient au moins une galerie (donc jamais vide).
  const groups = useMemo<DisciplineGroup[]>(() => {
    // Divers : galeries sans discipline (peu importe la catégorie).
    const divers: GroupedGallery[] = [];
    // discipline name → (catégorie type → galeries)
    const byDiscipline = new Map<string, Map<string, GroupedGallery[]>>();

    for (const g of galleries) {
      const discName = g.discipline?.name ?? null;
      const catType = g.category?.type ?? null;

      // Sans discipline → Divers (contenu transverse / vie du club).
      if (!discName) {
        divers.push(g);
        continue;
      }
      // Avec discipline mais catégorie hors Cours/Stage/Event → Divers aussi
      // (ces galeries n'ont pas de sous-groupe catégorie légitime).
      if (!catType || !CATEGORY_ORDER.includes(catType)) {
        divers.push(g);
        continue;
      }
      if (!byDiscipline.has(discName)) byDiscipline.set(discName, new Map());
      const cats = byDiscipline.get(discName)!;
      if (!cats.has(catType)) cats.set(catType, []);
      cats.get(catType)!.push(g);
    }

    const result: DisciplineGroup[] = [];

    // Disciplines ordonnées (ordre métier puis alpha).
    const discNames = [...byDiscipline.keys()].sort(
      (a, b) => disciplineRank(a) - disciplineRank(b) || a.localeCompare(b),
    );
    for (const discName of discNames) {
      const cats = byDiscipline.get(discName)!;
      const catGroups: CategoryGroup[] = [...cats.keys()]
        .sort((a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b))
        .map((catType) => ({
          key: `${discName}::${catType}`,
          label: catType,
          galleries: cats.get(catType)!,
        }));
      result.push({
        key: discName,
        label: discName,
        isDivers: false,
        categories: catGroups,
        directGalleries: [],
      });
    }

    // Divers en dernier, si non vide.
    if (divers.length > 0) {
      result.push({
        key: DIVERS_LABEL,
        label: DIVERS_LABEL,
        isDivers: true,
        categories: [],
        directGalleries: divers,
      });
    }

    return result;
  }, [galleries]);

  const toggle = <T,>(
    set: Set<T>,
    setSet: (s: Set<T>) => void,
    key: T,
  ): void => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSet(next);
  };

  if (groups.length === 0) {
    return (
      <p className="text-gray-500">Aucune galerie ne correspond à ce filtre.</p>
    );
  }

  const renderGallery = (g: GroupedGallery): JSX.Element => {
    const open = openGallery.has(g.id);
    return (
      <div key={g.id} className="border-l-2 border-gray-100 pl-3">
        <button
          type="button"
          onClick={() => toggle(openGallery, setOpenGallery, g.id)}
          className="flex w-full items-center gap-2 py-2 text-left"
        >
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
          <span className="font-medium text-gray-800">{g.title}</span>
          {g.visibility === "MEMBERS" && (
            <Lock className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className="ml-auto text-xs text-gray-400">
            {g.items.length} média{g.items.length > 1 ? "s" : ""}
          </span>
        </button>
        {open && (
          <div className="pb-3 pl-6">
            <GalleryGrid
              items={g.items}
              onItemClick={(index) => onItemClick(g.items, index)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {groups.map((disc) => {
        const discOpen = openDisc.has(disc.key);
        return (
          <section key={disc.key} className="rounded-lg border border-gray-200">
            {/* Niveau 1 : discipline (ou Divers) */}
            <button
              type="button"
              onClick={() => toggle(openDisc, setOpenDisc, disc.key)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left"
            >
              <ChevronRight
                className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${
                  discOpen ? "rotate-90" : ""
                }`}
              />
              <span className="text-lg font-semibold text-gray-900">
                {disc.label}
              </span>
            </button>

            {discOpen && (
              <div className="px-4 pb-3">
                {disc.isDivers
                  ? // Divers : galeries directes, sans sous-catégorie.
                    disc.directGalleries.map(renderGallery)
                  : // Sinon : niveau 2 = catégories.
                    disc.categories.map((cat) => {
                      const catOpen = openCat.has(cat.key);
                      return (
                        <div key={cat.key} className="mt-1">
                          <button
                            type="button"
                            onClick={() => toggle(openCat, setOpenCat, cat.key)}
                            className="flex w-full items-center gap-2 py-2 text-left"
                          >
                            <ChevronRight
                              className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                                catOpen ? "rotate-90" : ""
                              }`}
                            />
                            <span className="font-semibold uppercase tracking-wide text-gray-600 text-sm">
                              {cat.label}
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                              {cat.galleries.length}
                            </span>
                          </button>
                          {catOpen && (
                            <div className="pl-6">
                              {cat.galleries.map(renderGallery)}
                            </div>
                          )}
                        </div>
                      );
                    })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(public)/gallery/page.tsx"
cat > 'apps/web/src/app/(public)/gallery/page.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useMemo, useState, type JSX } from "react";

import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import {
  GalleryLightbox,
  type LightboxItem,
} from "@features/gallery-public/GalleryLightbox";
import {
  GalleryGroupedView,
  type GroupedGallery,
} from "@features/gallery-public/GalleryGroupedView";

/**
 * Page publique des galeries — `/gallery`.
 *
 * Fetch SESSION-AWARE (anonyme = PUBLIC, connecté = +MEMBERS ; re-fetch au
 * changement de session). Un filtre ORIGINE (choix unique + « toutes »)
 * réduit l'ensemble ; la vue groupée (discipline → catégorie → galerie →
 * médias) fait le reste. Kali n'apparaît naturellement pas quand l'origine
 * filtrée est Chine (aucune galerie kali chinoise → groupe absent).
 */

type PublicGallery = Awaited<
  ReturnType<typeof trpcClient.gallery.getPublicIndex.query>
>[number];

export default function PublicGalleryPage(): JSX.Element {
  const userId = useSessionStore((s) => s.session?.user?.id ?? null);
  const [galleries, setGalleries] = useState<PublicGallery[] | null>(null);
  const [originId, setOriginId] = useState<number | "all">("all");
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

  // Origines présentes dans les galeries (pour peupler le sélecteur — on ne
  // propose que des origines qui ont au moins une galerie).
  const origins = useMemo(() => {
    const map = new Map<number, string>();
    for (const g of galleries ?? []) {
      if (g.origin) map.set(g.origin.id, g.origin.name);
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [galleries]);

  // Galeries non vides, filtrées par origine, projetées pour la vue groupée.
  const visible: GroupedGallery[] = useMemo(() => {
    return (galleries ?? [])
      .filter((g) => g.items.length > 0)
      .filter((g) => originId === "all" || g.origin?.id === originId)
      .map((g) => ({
        id: g.id,
        title: g.title,
        date: g.date,
        visibility: g.visibility,
        discipline: g.discipline,
        category: g.category,
        origin: g.origin,
        items: g.items,
      }));
  }, [galleries, originId]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">La galerie</h1>

      {/* Filtre origine */}
      {origins.length > 0 && (
        <div className="mb-6 flex items-center gap-2">
          <label htmlFor="origin-filter" className="text-sm text-gray-600">
            Origine :
          </label>
          <select
            id="origin-filter"
            value={originId === "all" ? "all" : String(originId)}
            onChange={(e) =>
              setOriginId(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="all">Toutes</option>
            {origins.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {galleries === null ? (
        <p className="text-gray-500">Chargement…</p>
      ) : (
        <GalleryGroupedView
          galleries={visible}
          onItemClick={(items, index) => setLightbox({ items, index })}
        />
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