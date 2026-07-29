"use client";

import type { JSX, ReactNode } from "react";

import type { AudioCollectionBlockV1 } from "@contracts/page";

import { useResolvedMediaList } from "../../components/useResolvedMediaList";

/**
 * Aperçu client de la collection audio, reproduisant `AudioCollectionView` —
 * mêmes cartes, mêmes variables (`--akfc-item-gap`, `--akfc-card-padding`),
 * mêmes lecteurs. L'éditeur ne montrait qu'une liste de vignettes.
 */
export function AudioCollectionPreview({
  block,
}: {
  block: AudioCollectionBlockV1;
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
    return <Notice>Aucune piste : ajoutez-en pour voir la collection.</Notice>;
  }
  if (status === "loading") return <Notice>Chargement des pistes…</Notice>;
  if (status === "error") {
    return <Notice>Échec de la requête de résolution des pistes.</Notice>;
  }
  if (items.length === 0) {
    return (
      <Notice>
        Aucune des pistes sélectionnées n&apos;a pu être résolue.
      </Notice>
    );
  }

  return (
    <div>
      {missing > 0 && (
        <Notice>{missing} piste(s) introuvable(s) — non affichée(s).</Notice>
      )}
      <ul className="flex flex-col" style={{ gap: "var(--akfc-item-gap)" }}>
        {items.map(({ item, media }) => (
          <li
            key={item.mediaId}
            className="rounded-md border border-border bg-card"
            style={{ padding: "var(--akfc-card-padding)" }}
          >
            <p className="mb-2 text-sm font-medium">
              {item.title ?? media.fileName}
            </p>
            <audio
              controls
              preload="metadata"
              src={media.url}
              className="w-full"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }): JSX.Element {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}
