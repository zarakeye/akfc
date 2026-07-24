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
import { publicIdToUrl } from "@features/social/userDisplay";

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

/**
 * État de la résolution du média.
 *
 * `missing` = la requête a abouti mais n'a rien rendu (média absent de la
 * base, ou administrateur sans avatar). `error` = la requête elle-même a
 * échoué. Les deux méritaient d'être distingués : le premier est un
 * problème de contenu, le second un problème de transport.
 */
type Resolution = "idle" | "loading" | "ready" | "missing" | "error";

interface ResolvedPreviewMedia {
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
  const [media, setMedia] = useState<ResolvedPreviewMedia | null>(null);

  // Pourquoi un état explicite et pas seulement `media | null` : « aucun
  // média choisi », « requête en cours » et « choisi mais introuvable »
  // produisaient le même rendu — rien. L'admin ne pouvait pas les
  // distinguer, et nous non plus au diagnostic.
  const [resolution, setResolution] = useState<Resolution>("idle");

  const m = block.media ?? null;
  // Clé de dépendance stable selon le kind.
  const mediaKey =
    m == null ? null : m.kind === "avatar" ? `avatar:${m.userId}` : m.mediaId;

  useEffect(() => {
    let cancelled = false;
    if (!m) {
      setMedia(null);
      setResolution("idle");
      return;
    }

    setMedia(null);
    setResolution("loading");

    if (m.kind === "avatar") {
      // Référence avatar : on récupère l'avatar courant du user (via la liste
      // des candidats) et on construit l'URL comme le portrait du header.
      void trpcClient.user.listAvatarCandidates
        .query()
        .then((admins) => {
          if (cancelled) return;
          const user = admins.find((a) => a.id === m.userId);
          if (user?.avatar) {
            setMedia({
              url: publicIdToUrl(user.avatar),
              kind: "image",
              posterUrl: null,
              caption: m.caption,
            });
            setResolution("ready");
          } else {
            // L'administrateur existe mais n'a pas d'avatar — ou n'est plus
            // dans la liste des candidats (rôle changé depuis la sélection).
            setMedia(null);
            setResolution("missing");
          }
        })
        .catch(() => {
          if (cancelled) return;
          setMedia(null);
          setResolution("error");
        });
    } else {
      // Média de bibliothèque.
      void trpcClient.media.resolveByIds
        .query({ mediaIds: [m.mediaId] })
        .then((resolved) => {
          if (cancelled) return;
          const r = resolved[m.mediaId];
          if (r) {
            setMedia({
              url: r.url,
              kind: r.kind,
              posterUrl: r.posterUrl,
              caption: m.caption,
            });
            setResolution("ready");
          } else {
            // `resolveByIds` filtre sur `status: 'published'` : un média
            // repassé en attente ou envoyé à la corbeille APRÈS avoir été
            // choisi revient `null` ici, sans que rien ne le signale.
            setMedia(null);
            setResolution("missing");
          }
        })
        .catch(() => {
          if (cancelled) return;
          setMedia(null);
          setResolution("error");
        });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaKey]);

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
  // `items-start` et non `items-center` : le média s'aligne sur la PREMIÈRE
  // LIGNE du texte, comme en édition imprimée. Centrer les colonnes faisait
  // flotter l'image à mi-hauteur dès que le texte était plus long qu'elle, et
  // ouvrait le bloc sur un vide asymétrique.
  return (
    <div className="grid items-start gap-10 md:grid-cols-2">
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
