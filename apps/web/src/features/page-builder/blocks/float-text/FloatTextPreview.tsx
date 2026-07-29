"use client";

import { useEffect, useState, type CSSProperties, type JSX } from "react";
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
import type { FloatTextBlockV1 } from "@contracts/page";
import { publicIdToUrl } from "@features/social/userDisplay";

/**
 * Aperçu CLIENT du bloc float, affiché sous l'éditeur dans le builder.
 *
 * Reproduit le rendu public (FloatTextView, Server Component non montable
 * ici) : même enrobage, même côté. La résolution des médias suit exactement
 * le patron du MediaTextPreview — les deux blocs partagent le modèle de
 * média, il n'y avait aucune raison d'en inventer un autre.
 *
 * Le nœud `library-image` inline n'est pas résolu ici (pas de résolution
 * serveur côté client) : les images insérées DANS le texte n'apparaissent
 * donc pas dans l'aperçu, ce qui est acceptable.
 */

/**
 * État de la résolution du média.
 *
 * `missing` = la requête a abouti mais n'a rien rendu (média absent, ou
 * administrateur sans avatar). `error` = la requête elle-même a échoué.
 */
type Resolution = "idle" | "loading" | "ready" | "missing" | "error";

interface ResolvedPreviewMedia {
  url: string;
  kind: string;
  posterUrl: string | null;
  caption?: string;
}

export function FloatTextPreview({
  block,
}: {
  block: FloatTextBlockV1;
}): JSX.Element | null {
  const [media, setMedia] = useState<ResolvedPreviewMedia | null>(null);
  const [resolution, setResolution] = useState<Resolution>("idle");
  // Distinct de `resolution` : la résolution peut réussir (on a une URL) et
  // le binaire échouer quand même. Avec un `alt` vide, une image cassée
  // n'occupe aucune place — l'écran reste blanc sans le moindre signe.
  const [imageFailed, setImageFailed] = useState(false);

  // Capture locale : c'est elle qui permet à TypeScript de conserver le
  // rétrécissement obtenu par `m.kind === "avatar"` jusque dans les closures
  // asynchrones. Un `block.media!` à l'intérieur du `.then()` le perdrait.
  const m = block.media ?? null;
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
    setImageFailed(false);
    setResolution("loading");

    if (m.kind === "avatar") {
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

  // Rien à montrer : on dit LAQUELLE des situations c'est, plutôt que de
  // rendre du vide indistinct.
  if (!hasText && !media) {
    return (
      <p className="text-sm text-muted-foreground">
        {resolution === "loading"
          ? "Chargement du média…"
          : resolution === "missing"
            ? "Média sélectionné introuvable (supprimé, en attente, ou administrateur sans avatar)."
            : resolution === "error"
              ? "Échec du chargement du média."
              : "Bloc vide : ajoutez une image et du texte."}
      </p>
    );
  }

  return (
    <div className="akfc-float-scope akfc-measure-block">
      {(!media || imageFailed) && (
        <p className="mb-2 text-xs text-muted-foreground">
          {imageFailed
            ? `Image résolue mais non chargée (le binaire n'a pas répondu) : ${media?.url ?? ""}`
            : resolution === "idle"
              ? "Aucune image n'est associée à ce bloc : le choix d'avatar n'a rien enregistré, ou aucune image n'a encore été sélectionnée."
              : resolution === "loading"
                ? "Chargement du média…"
                : resolution === "missing"
                  ? "Média sélectionné introuvable (supprimé, en attente, ou administrateur sans avatar)."
                  : "Échec de la requête de résolution du média."}
        </p>
      )}
      <div
        className="akfc-float"
        style={
          {
            "--akfc-float-side": block.side === "right" ? "right" : "left",
          } as CSSProperties
        }
      >
        {media && (
          <figure className="akfc-float-figure m-0">
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
                onError={() => setImageFailed(true)}
                className="block w-full rounded-md object-cover"
              />
            )}
            {media.caption && (
              <figcaption className="mt-1 text-sm text-muted-foreground">
                {media.caption}
              </figcaption>
            )}
          </figure>
        )}
        {textHtml && (
          <div
            className="akfc-prose tiptap-rendered prose max-w-none"
            dangerouslySetInnerHTML={{ __html: textHtml }}
          />
        )}
        <div className="akfc-float-clear" />
      </div>
    </div>
  );
}
