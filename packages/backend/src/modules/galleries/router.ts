import {
  router,
  protectedProcedure,
  publicProcedure,
} from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
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
 * - Écritures + lectures admin : `isAdmin`.
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
    .use(isAdmin)
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
    .use(isAdmin)
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
    .use(isAdmin)
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
    .use(isAdmin)
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
    .use(isAdmin)
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
    .use(isAdmin)
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
