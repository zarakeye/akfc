import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";
import { deriveMediaKind } from "@backend/modules/media/helpers/deriveMediaKind";

const CAROUSEL_SLUG = "home-carousel";

const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: "Public",
  MEMBERS: "Membres",
};

/**
 * Présentation admin d'une galerie — `/(admin)/dashboard/galleries/[id]`.
 * Métadonnées + grille de vignettes (items ordonnés). L'édition des items
 * (ajout / retrait / réordonnancement) reste sur `[id]/edit`.
 */
export default async function GalleryPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const galleryId = Number(id);
  if (!Number.isFinite(galleryId)) notFound();

  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    include: {
      items: { orderBy: { sortOrder: "asc" }, include: { mediaAsset: true } },
      discipline: { select: { name: true } },
      stage: { select: { label: true } },
      event: { select: { label: true } },
    },
  });
  if (!gallery) notFound();

  const theme =
    gallery.discipline?.name ??
    gallery.stage?.label ??
    gallery.event?.label ??
    (gallery.slug === CAROUSEL_SLUG ? "Carousel d'accueil" : "—");

  return (
    <PresentationShell
      title={gallery.title ?? gallery.slug}
      listHref="/dashboard/galleries"
      editHref={`/dashboard/galleries/${gallery.id}/edit`}
    >
      <dl className="mb-6 grid grid-cols-1 gap-3 border-b border-border pb-6 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-medium text-muted-foreground">Slug</dt>
          <dd className="font-mono text-xs">{gallery.slug}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Thème</dt>
          <dd>{theme}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Visibilité</dt>
          <dd>{VISIBILITY_LABELS[gallery.visibility] ?? gallery.visibility}</dd>
        </div>
      </dl>

      {gallery.items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucune image. Clique sur « Éditer » pour en ajouter.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {gallery.items.map((item) => {
            // URL de base de l'asset. Pour Cloudinary :
            // `/api/media/by-public-id/<publicId>?variant=large`.
            const baseUrl = buildMediaProxyUrl({
              publicId: item.mediaAsset.publicId,
              fullPath: item.mediaAsset.fullPath,
            });

            // Une vidéo ne peut pas s'afficher dans un <img> : on demande son
            // POSTER (première frame) via `&as=poster`, servi par la route
            // proxy. Image / doc : on garde l'URL de base telle quelle.
            const kind = deriveMediaKind(
              item.mediaAsset.resourceType,
              item.mediaAsset.mimeType,
            );
            const thumbUrl = kind === "video" ? `${baseUrl}&as=poster` : baseUrl;

            return (
              <li
                key={item.id}
                className="relative overflow-hidden rounded-lg border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbUrl}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                {kind === "video" && (
                  <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Vidéo
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PresentationShell>
  );
}