"use client";

import { type CSSProperties, type JSX } from "react";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";

import type { MediaTextBlockV1 } from "@contracts/page";
import {
  useResolvedPreviewMedia,
  type PreviewResolution as Resolution,
  type ResolvedPreviewMedia,
} from "@features/page-builder/components/useResolvedPreviewMedia";

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

export function MediaTextPreview({
  block,
  mediaSide = "left",
}: {
  block: MediaTextBlockV1;
  mediaSide?: "left" | "right";
}): JSX.Element | null {
  const { media, resolution } = useResolvedPreviewMedia(block.media ?? null);

  const hasText =
    block.content !== undefined &&
    block.content !== null &&
    Object.keys(block.content).length > 0;
  // « Il y a une colonne média » n'est PAS « le média est résolu ». Un média
  // choisi mais non résolu garde sa colonne — sans quoi la mise en page
  // basculerait en une seule colonne et l'admin croirait n'avoir rien
  // sélectionné.
  const hasMedia = block.media != null;

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

  const MediaColumn = media ? (
    <PreviewFigure media={media} />
  ) : hasMedia ? (
    <MediaResolutionNotice resolution={resolution} />
  ) : null;

  const TextColumn = textHtml ? (
    <div
      className="akfc-prose prose max-w-none"
      dangerouslySetInnerHTML={{ __html: textHtml }}
    />
  ) : null;

  // Une seule partie → centré, pleine largeur.
  if (!hasText || !hasMedia) {
    return (
      <div className="akfc-measure-block">
        {hasMedia ? MediaColumn : TextColumn}
      </div>
    );
  }

  // Deux parties → deux colonnes, côté médias selon l'alternance, gouttière nette.
  // `items-start` et non `items-center` : le média s'aligne sur la PREMIÈRE
  // LIGNE du texte, comme en édition imprimée. Centrer les colonnes faisait
  // flotter l'image à mi-hauteur dès que le texte était plus long qu'elle, et
  // ouvrait le bloc sur un vide asymétrique.
  return (
    <div className="akfc-block-scope">
    <div
      className="akfc-block-columns grid items-start"
      style={
        {
          gap: "var(--akfc-column-gap)",
          "--akfc-col-1":
            mediaSide === "left"
              ? "var(--akfc-media-col)"
              : "var(--akfc-text-col)",
          "--akfc-col-2":
            mediaSide === "left"
              ? "var(--akfc-text-col)"
              : "var(--akfc-media-col)",
        } as CSSProperties
      }
    >
      {mediaSide === "left" ? (
        <>
          <div>{MediaColumn}</div>
          <div>{TextColumn}</div>
        </>
      ) : (
        <>
          <div>{TextColumn}</div>
          <div>{MediaColumn}</div>
        </>
      )}
    </div>
    </div>
  );
}

/**
 * Occupe la colonne média quand un média est choisi mais pas affichable, et
 * dit pourquoi. Remplace le rendu vide, qui confondait trois situations.
 */
function MediaResolutionNotice({
  resolution,
}: {
  resolution: Resolution;
}): JSX.Element {
  const message =
    resolution === "loading"
      ? "Chargement du média…"
      : resolution === "error"
        ? "Le média n'a pas pu être chargé (erreur réseau ou serveur)."
        : "Média introuvable : il a peut-être été supprimé, remis en attente, ou l'administrateur choisi n'a pas d'avatar.";

  return (
    <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground">
      {message}
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
