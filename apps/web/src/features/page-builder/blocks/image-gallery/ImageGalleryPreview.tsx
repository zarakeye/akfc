"use client";

import type { JSX, ReactNode } from "react";

import type { ImageGalleryBlockV1, ResolvedMedia } from "@contracts/page";

import { useResolvedMediaList } from "../../components/useResolvedMediaList";

/**
 * Aperçu client de la galerie, reproduisant `ImageGalleryView`.
 *
 * Les trois dispositions sont recopiées à l'identique — mêmes classes, mêmes
 * variables. C'est le seul moyen de voir ce que « grille », « carrousel » et
 * « mosaïque » veulent dire : l'éditeur les laissait choisir sans jamais les
 * montrer.
 *
 * Limite connue : la vue publique choisit son nombre de colonnes sur des
 * seuils de FENÊTRE (`sm:` / `lg:`) et non de conteneur. Dans le panneau
 * d'édition, plus étroit que la page, le nombre de colonnes est donc juste
 * mais les colonnes sont resserrées. La structure est fidèle, les proportions
 * non — le remède est de passer la galerie en container queries, comme le
 * média-texte, ce qui est un chantier à part.
 */
export function ImageGalleryPreview({
  block,
}: {
  block: ImageGalleryBlockV1;
}): JSX.Element {
  const { byId, status } = useResolvedMediaList(
    block.items.map((i) => i.mediaId),
  );

  const items = block.items.flatMap((item) => {
    const media = byId[item.mediaId];
    return media ? [{ item, media }] : [];
  });

  const missing = block.items.length - items.length;

  if (block.items.length === 0) {
    return <Notice>Aucune image : ajoutez-en pour voir la galerie.</Notice>;
  }
  if (status === "loading") {
    return <Notice>Chargement des images…</Notice>;
  }
  if (status === "error") {
    return <Notice>Échec de la requête de résolution des images.</Notice>;
  }
  if (items.length === 0) {
    return (
      <Notice>
        Aucune des images sélectionnées n&apos;a pu être résolue (supprimées,
        en attente, ou déplacées).
      </Notice>
    );
  }

  return (
    // `@container` ici plutôt que sur chaque disposition : ce composant a
    // déjà une enveloppe commune, et une container query régit ses
    // DESCENDANTS.
    <div className="@container">
      {missing > 0 && (
        <Notice>
          {missing} média(s) sélectionné(s) introuvable(s) — non affiché(s)
          ci-dessous ni sur la page publique.
        </Notice>
      )}
      {block.layout === "grid" && (
        <div
          className="grid grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-3"
          style={{ gap: "var(--akfc-item-gap)" }}
        >
          {items.map(({ item, media }) => (
            <Figure key={item.mediaId} media={media} caption={item.caption} />
          ))}
        </div>
      )}
      {block.layout === "carousel" && (
        <div
          className="flex snap-x snap-mandatory overflow-x-auto pb-2"
          style={{ gap: "var(--akfc-item-gap)" }}
        >
          {items.map(({ item, media }) => (
            <div key={item.mediaId} className="w-64 @md:w-72 flex-shrink-0 snap-start">
              <Figure media={media} caption={item.caption} />
            </div>
          ))}
        </div>
      )}
      {block.layout === "masonry" && (
        <div
          className="columns-1 @md:columns-2 @3xl:columns-3"
          style={{ gap: "var(--akfc-item-gap)" }}
        >
          {items.map(({ item, media }) => (
            <div
              key={item.mediaId}
              className="break-inside-avoid"
              style={{ marginBottom: "var(--akfc-item-gap)" }}
            >
              <Figure media={media} caption={item.caption} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Notice({ children }: { children: ReactNode }): JSX.Element {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

function Figure({
  media,
  caption,
}: {
  media: ResolvedMedia;
  caption?: string;
}): JSX.Element {
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
        <figcaption
          className="mt-1 text-muted-foreground"
          style={{ fontSize: "var(--akfc-caption-size)" }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
