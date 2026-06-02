import type { ImageGalleryBlockV1, ResolvedMedia } from "@contracts/page";

import type { BlockViewProps } from "../../BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  View                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Rendu public d'un bloc `image-gallery`.
 *
 * Filtre d'entrée les items dont le mediaId ne résout pas (asset absent
 * ou hors `published`) — c'est silencieux côté visiteur ; pas de
 * placeholder « média indisponible » sur le site public, on saute
 * simplement l'item. Trois layouts CSS-only (pas de JS) :
 *
 *   - `grid`     : CSS Grid responsive (1 / 2 / 3 colonnes selon largeur)
 *   - `carousel` : flex horizontal avec scroll-snap (mobile-first ; pas
 *                  d'arrows pour v1, le scroll natif suffit)
 *   - `masonry`  : CSS columns avec break-inside-avoid
 *
 * Tout reste en Server Component (sync, pas de hook, pas de JS bundle).
 */
export function ImageGalleryView({
  block,
  resolveMedia,
}: BlockViewProps<ImageGalleryBlockV1>) {
  const items = block.items.flatMap((item) => {
    const media = resolveMedia(item.mediaId);
    return media ? [{ item, media }] : [];
  });

  if (items.length === 0) return null;

  switch (block.layout) {
    case "grid":
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ item, media }) => (
            <Figure key={item.mediaId} media={media} caption={item.caption} />
          ))}
        </div>
      );

    case "carousel":
      return (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {items.map(({ item, media }) => (
            <div
              key={item.mediaId}
              className="w-72 flex-shrink-0 snap-start"
            >
              <Figure media={media} caption={item.caption} />
            </div>
          ))}
        </div>
      );

    case "masonry":
      return (
        <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
          {items.map(({ item, media }) => (
            <div key={item.mediaId} className="mb-3 break-inside-avoid">
              <Figure media={media} caption={item.caption} />
            </div>
          ))}
        </div>
      );
  }
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Figure                                                                 */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Rendu d'une image unique avec légende optionnelle.
 *
 * On émet `width` / `height` quand disponibles pour éviter le layout
 * shift (CLS). `loading="lazy"` + `decoding="async"` pour la perf —
 * pertinent surtout en grid/masonry avec plusieurs images sous la fold.
 *
 * `<img>` direct plutôt que `next/image` parce que notre URL pointe
 * vers une route Next interne (`/api/media/...`) — `next/image`
 * demanderait une config remotePatterns inutile pour des chemins
 * relatifs servis par notre propre app.
 */
function Figure({
  media,
  caption,
}: {
  media: ResolvedMedia;
  caption?: string;
}) {
  return (
    <figure className="m-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.url}
        alt={caption ?? ""}
        width={media.width ?? undefined}
        height={media.height ?? undefined}
        loading="lazy"
        decoding="async"
        className="block w-full rounded-md object-cover"
      />
      {caption && (
        <figcaption className="mt-1 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
