"use client";

import { useEffect, useState, type JSX } from "react";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";

import { trpcClient } from "@trpc/trpcClient";
import type { MediaTextBlockV1 } from "@contracts/page";

/**
 * Preview CLIENT du bloc media-text, affichée sous l'éditeur dans le builder.
 *
 * Reproduit fidèlement le rendu public (MediaTextView, qui est un Server
 * Component non montable ici) : résolution des médias via trpcClient,
 * alternance gauche/droite selon `mediaSide` (fourni par le PageBuilder), et
 * mêmes règles de disposition (1 média = pleine largeur ; plusieurs = grille ;
 * une seule partie = centré, gouttière nette entre colonnes).
 *
 * Le rendu du texte réutilise generateHTML avec les mêmes extensions que la
 * vue publique (sans le nœud library-image, dont la résolution serveur n'est
 * pas disponible ici — les images insérées dans le texte n'apparaissent donc
 * pas dans la preview, ce qui est acceptable pour un aperçu).
 */

interface ResolvedPreviewMedia {
  mediaId: string;
  url: string;
  kind: string;
  posterUrl: string | null;
  caption?: string;
}

export function MediaTextPreview({
  block,
  mediaSide = "left",
}: {
  block: MediaTextBlockV1;
  mediaSide?: "left" | "right";
}): JSX.Element | null {
  const [media, setMedia] = useState<ResolvedPreviewMedia[]>([]);

  const mediaKey = block.media.map((m) => m.mediaId).join(",");

  useEffect(() => {
    let cancelled = false;
    const ids = block.media.map((m) => m.mediaId);
    if (ids.length === 0) {
      setMedia([]);
      return;
    }
    void trpcClient.media.resolveByIds
      .query({ mediaIds: ids })
      .then((resolved) => {
        if (cancelled) return;
        const out: ResolvedPreviewMedia[] = [];
        for (const item of block.media) {
          const r = resolved[item.mediaId];
          if (r) {
            out.push({
              mediaId: item.mediaId,
              url: r.url,
              kind: r.kind,
              posterUrl: r.posterUrl,
              caption: item.caption,
            });
          }
        }
        setMedia(out);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaKey]);

  const hasText =
    block.content !== undefined &&
    block.content !== null &&
    Object.keys(block.content).length > 0;
  const hasMedia = media.length > 0;

  if (!hasText && !hasMedia) {
    return (
      <p className="text-xs italic text-muted-foreground">
        Aperçu : bloc vide (ajoute du texte et/ou des médias).
      </p>
    );
  }

  const textHtml = hasText
    ? generateHTML(block.content as JSONContent, [
        StarterKit.configure({ horizontalRule: false }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Typography,
        Subscript,
        Superscript,
      ])
    : null;

  const MediaColumn = hasMedia ? (
    media.length === 1 ? (
      <PreviewFigure media={media[0]} />
    ) : (
      <div className="grid grid-cols-2 gap-3">
        {media.map((m) => (
          <PreviewFigure key={m.mediaId} media={m} />
        ))}
      </div>
    )
  ) : null;

  const TextColumn = textHtml ? (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: textHtml }}
    />
  ) : null;

  // Une seule partie → centré, pleine largeur.
  if (!hasText || !hasMedia) {
    return (
      <div className="mx-auto max-w-2xl">
        {hasMedia ? MediaColumn : TextColumn}
      </div>
    );
  }

  // Deux parties → deux colonnes, côté médias selon l'alternance, gouttière nette.
  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      {mediaSide === "left" ? (
        <>
          <div>{MediaColumn}</div>
          <div>{TextColumn}</div>
        </>
      ) : (
        <>
          <div className="md:order-2">{MediaColumn}</div>
          <div className="md:order-1">{TextColumn}</div>
        </>
      )}
    </div>
  );
}

function PreviewFigure({
  media,
}: {
  media: ResolvedPreviewMedia;
}): JSX.Element {
  return (
    <figure className="m-0">
      {media.kind === "video" ? (
        <video
          src={media.url}
          poster={media.posterUrl ?? undefined}
          controls
          className="block w-full rounded-md"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt={media.caption ?? ""}
          className="block w-full rounded-md object-cover"
        />
      )}
      {media.caption && (
        <figcaption className="mt-1 text-xs text-muted-foreground">
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}
