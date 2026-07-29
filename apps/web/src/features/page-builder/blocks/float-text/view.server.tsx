import { Node } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import type { CSSProperties } from "react";
import { generateHTML } from "@tiptap/html";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { HorizontalRule } from "@/features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node-extension";

import type { FloatTextBlockV1, ResolvedMedia } from "@contracts/page";

import type { BlockViewProps } from "../../BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Nœud image server-only — identique au média-texte et au bloc tiptap.    */
/*  Dupliqué à dessein : chaque View est un module serveur autonome, et le  */
/*  factoriser créerait une dépendance croisée entre blocs pour trois       */
/*  lignes. La règle du projet est l'indépendance des blocs.                */
/* ─────────────────────────────────────────────────────────────────────── */

interface ServerLibraryImageOptions {
  resolveMedia: (mediaId: string) => ResolvedMedia | null;
}

const ServerLibraryImageNode = Node.create<ServerLibraryImageOptions>({
  name: "library-image",
  group: "block",
  atom: true,
  addOptions() {
    return { resolveMedia: () => null };
  },
  addAttributes() {
    return { mediaId: { default: null }, caption: { default: null } };
  },
  renderHTML({ node }) {
    const mediaId = node.attrs.mediaId as string | null;
    const caption = node.attrs.caption as string | null;
    if (!mediaId) return ["span", { class: "hidden", "aria-hidden": "true" }];
    const media = this.options.resolveMedia(mediaId);
    if (!media) return ["span", { class: "hidden", "aria-hidden": "true" }];
    const imgAttrs: Record<string, unknown> = {
      src: media.url,
      alt: caption ?? "",
      loading: "lazy",
      decoding: "async",
    };
    if (media.width !== null) imgAttrs.width = media.width;
    if (media.height !== null) imgAttrs.height = media.height;
    if (caption) {
      return [
        "figure",
        { class: "tiptap-library-image" },
        ["img", imgAttrs],
        ["figcaption", {}, caption],
      ];
    }
    return ["figure", { class: "tiptap-library-image" }, ["img", imgAttrs]];
  },
});

/* ─────────────────────────────────────────────────────────────────────── */
/*  View                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Rendu public d'un bloc « texte enrobant une image ».
 *
 * L'image est `float`-ée du côté choisi (indépendant de l'alternance
 * média-texte : ce côté est une donnée du bloc, pas une décision de position,
 * parce qu'un enrobage n'alterne pas — on choisit où l'illustration se pose).
 * Le texte l'enrobe et se poursuit dessous. Un `clear` en pied empêche le
 * flottant de mordre sur le bloc suivant.
 *
 * Container query : sous 34rem, le float est neutralisé (image pleine largeur
 * au-dessus du texte). En dessous, l'enrobage laisserait trop peu de place au
 * texte pour être lisible.
 */
export function FloatTextView({
  block,
  resolveMedia,
  resolveAvatar,
}: BlockViewProps<FloatTextBlockV1>) {
  const resolvedMedia = !block.media
    ? null
    : block.media.kind === "avatar"
      ? (resolveAvatar?.(block.media.userId) ?? null)
      : resolveMedia(block.media.mediaId);
  const mediaCaption = block.media?.caption;

  const hasText =
    block.content !== undefined &&
    block.content !== null &&
    Object.keys(block.content).length > 0;
  const hasMedia = resolvedMedia !== null;

  if (!hasText && !hasMedia) return null;

  const textHtml = hasText
    ? generateHTML(block.content as JSONContent, [
        StarterKit.configure({ horizontalRule: false }),
        HorizontalRule,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Typography,
        Subscript,
        Superscript,
        ServerLibraryImageNode.configure({ resolveMedia }),
      ])
    : null;

  // Sans image : le bloc dégénère en simple texte, à la mesure. Sans texte :
  // l'image seule, centrée. Le float n'a de sens qu'avec les deux.
  if (!hasMedia || !resolvedMedia) {
    return (
      <div
        className="akfc-measure-block akfc-prose tiptap-rendered prose max-w-none prose-h5:text-base prose-h5:font-semibold prose-h5:mt-6 prose-h6:text-sm prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wide prose-h6:mt-6"
        dangerouslySetInnerHTML={{ __html: textHtml ?? "" }}
      />
    );
  }
  if (!hasText || !textHtml) {
    return (
      <div className="akfc-measure-block">
        <FloatFigure media={resolvedMedia} caption={mediaCaption} />
      </div>
    );
  }

  // Les deux présents : enrobage. `akfc-float-scope` est le conteneur de
  // requête (comme `akfc-block-scope` pour le média-texte) ; `akfc-float`
  // porte le float et le `clear`.
  //
  // PAS de `akfc-measure-block` ici, contrairement aux cas dégénérés. Avec un
  // float, la largeur du texte vaut « conteneur moins image » : brider le
  // conteneur à la mesure ne laisserait au texte que 62 % de 68ch, une
  // quarantaine de caractères. Le conteneur prend donc le puits de page, et
  // le texte enrobant retombe sur la mesure de lui-même (68rem × 62 % ≈ 68ch).
  // La mesure n'est pas imposée au bloc : elle est le résultat de sa géométrie.
  return (
    <div className="akfc-float-scope">
      <div
        className="akfc-float"
        style={
          {
            "--akfc-float-side": block.side === "right" ? "right" : "left",
          } as CSSProperties
        }
      >
        <figure className="akfc-float-figure m-0">
          {resolvedMedia.kind === "video" ? (
            <video
              src={resolvedMedia.url}
              poster={resolvedMedia.posterUrl ?? undefined}
              controls
              className="block w-full rounded-md"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedMedia.url}
              alt={mediaCaption ?? ""}
              width={resolvedMedia.width ?? undefined}
              height={resolvedMedia.height ?? undefined}
              loading="lazy"
              decoding="async"
              className="block w-full rounded-md object-cover"
            />
          )}
          {mediaCaption && (
            <figcaption className="mt-1 text-sm text-muted-foreground">
              {mediaCaption}
            </figcaption>
          )}
        </figure>

        <div
          className="akfc-prose tiptap-rendered prose max-w-none prose-h5:text-base prose-h5:font-semibold prose-h5:mt-6 prose-h6:text-sm prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wide prose-h6:mt-6"
          dangerouslySetInnerHTML={{ __html: textHtml }}
        />

        {/* Referme le flottant : sans lui, une image plus haute que le texte
            déborderait sur le bloc suivant. */}
        <div className="akfc-float-clear" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  FloatFigure — image ou vidéo, pour le cas « image seule »               */
/* ─────────────────────────────────────────────────────────────────────── */

function FloatFigure({
  media,
  caption,
}: {
  media: ResolvedMedia;
  caption?: string;
}) {
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
          alt={caption ?? ""}
          width={media.width ?? undefined}
          height={media.height ?? undefined}
          loading="lazy"
          decoding="async"
          className="block w-full rounded-md object-cover"
        />
      )}
      {caption && (
        <figcaption className="mt-1 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
