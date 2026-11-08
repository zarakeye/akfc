import {
  router,
  protectedProcedure,
  publicProcedure,
} from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import { deriveMediaKind } from "@backend/modules/media/helpers/deriveMediaKind";
import { z } from "zod";
import { CAROUSEL_SLUG } from "@contracts/legal/mediaPeople";
import { galleryRightsError, refusedMediaIds } from "@backend/modules/mediaPeople/mediaPeople.service";

/**
 * Router `gallery`.
 *
 * Une Gallery réutilise des MediaAsset existants via GalleryItem (jointure
 * ordonnée). Rattachements optionnels et CUMULABLES (discipline,
 * catégorie, stage, event, origine) — les facettes de la future
 * recherche. Une galerie sans rattachement au slug réservé
 * `CAROUSEL_SLUG` sert de carousel d'accueil.
 *
 * - Lecture publique : `getCarousel`.
 * - Écritures + lectures admin : `isAdmin`.
 */

/** Slug réservé pour le carousel de la page d'accueil (défini dans les contrats, partagé avec l'admin). */
export { CAROUSEL_SLUG };

type GalleryItemWithAsset = Prisma.GalleryItemGetPayload<{
  include: { mediaAsset: true };
}>;

/**
 * Items publiés → shape publique (URL proxy audience `public`, kind dérivé,
 * poster vidéo). Partagé par `getCarousel` et `getPublicIndex`.
 *
 * `hidden` : médias masqués par le droit à l'image (une personne taguée a refusé
 * l'usage de la galerie). La galerie n'est pas modifiée : ils reviennent dès que
 * la personne change d'avis ou que son tag est retiré.
 */
function mapPublicItems(items: GalleryItemWithAsset[], hidden: ReadonlySet<string> = new Set()) {
  return items
    .filter((it) => it.mediaAsset.status === "published" && !hidden.has(it.mediaAssetId))
    .map((it) => {
      const a = it.mediaAsset;
      const kind = deriveMediaKind(a.mimeType);
      const url = buildMediaProxyUrl({ fullPath: a.fullPath }, "public");

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
          seminar: { select: { id: true, label: true } },
          event: { select: { id: true, label: true } },
          category: { select: { id: true, key: true, type: true } },
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
    const hidden = await refusedMediaIds(ctx.prisma, gallery.items.map((it) => it.mediaAssetId), "PUBLIC_SITE");

    return {
      id: gallery.id,
      slug: gallery.slug,
      title: gallery.title,
      items: mapPublicItems(gallery.items, hidden),
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
        // discipline (niveau 1, rangée comme le menu : sa famille compte), catégorie (niveau 2),
        // origine (filtre).
        discipline: { select: { id: true, name: true, family: { select: { name: true, sortOrder: true } } } },
        category: { select: { id: true, key: true, type: true } },
        origin: { select: { id: true, name: true } },
      },
    });

    // Droit à l'image : une galerie publique saute les médias dont une personne taguée a refusé le
    // site public. Une galerie réservée aux membres les garde (l'espace membres avertit seulement).
    const hidden = await refusedMediaIds(
      ctx.prisma,
      galleries.filter((g) => g.visibility === "PUBLIC").flatMap((g) => g.items.map((it) => it.mediaAssetId)),
      "PUBLIC_SITE",
    );

    return galleries.map((g) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      date: g.date,
      visibility: g.visibility,
      discipline: g.discipline,
      category: g.category,
      origin: g.origin,
      items: mapPublicItems(g.items, g.visibility === "PUBLIC" ? hidden : undefined),
    }));
  }),

  /* ----- Écritures ----- */

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
      const gallery = await ctx.prisma.gallery.findUnique({
        where: { id: input.galleryId },
        select: { slug: true, visibility: true },
      });
      if (!gallery) throw new TRPCError({ code: "NOT_FOUND", message: "Galerie introuvable." });
      // Droit à l'image : un refus d'une personne taguée, pour la destination de la galerie, bloque.
      const rightsError = await galleryRightsError(ctx.prisma, gallery, input.mediaAssetIds);
      if (rightsError) throw new TRPCError({ code: "BAD_REQUEST", message: rightsError });

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
