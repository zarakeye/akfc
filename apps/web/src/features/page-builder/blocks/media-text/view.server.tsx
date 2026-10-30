import type { CSSProperties } from "react";

import type { MediaTextBlockV1, ResolvedMedia } from "@contracts/page";

import type { BlockViewProps } from "../../BlockDefinition.types";
import { hasRichText, richTextHtml } from "../../richTextHtml";
import { SiteLogoImage } from "../../components/SiteLogoImage";

/* ─────────────────────────────────────────────────────────────────────── */
/*  View                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Rendu public d'un bloc `media-text`.
 *
 * Mise en page éditoriale : médias d'un côté, texte de l'autre, avec
 * ALTERNANCE automatique du côté des médias d'un bloc media-text au suivant
 * (`mediaSide`, calculé par le PageRenderer selon la position). Si une seule
 * des deux parties est présente, le bloc s'affiche centré, pleine largeur.
 *
 * Server Component pur (sync, pas de hook). Les vidéos sont rendues avec un
 * `<video controls>` + poster ; les images en grille.
 */
export function MediaTextView({
  block,
  resolveMedia,
  resolveAvatar,
  siteLogo,
  mediaSide = "left",
}: BlockViewProps<MediaTextBlockV1>) {
  // Média unique résolu (ou null). Selon le kind : média de bibliothèque
  // (resolveMedia) ou référence avatar résolue dynamiquement (resolveAvatar).
  const resolvedMedia = !block.media
    ? null
    : block.media.kind === "avatar"
      ? (resolveAvatar?.(block.media.userId) ?? null)
      : block.media.kind === "site-logo"
        ? (siteLogo ?? null)
        : resolveMedia(block.media.mediaId);
  const mediaCaption = block.media?.caption;

  // Texte : présent uniquement si content non vide.
  const hasText = hasRichText(block.content);

  const hasMedia = resolvedMedia !== null;

  // Bloc vide (ni texte ni média résolu) → rien.
  if (!hasText && !hasMedia) return null;

  const textHtml = hasText ? richTextHtml(block.content, resolveMedia) : null;

  const MediaColumn =
    hasMedia && resolvedMedia ? (
      <MediaFigure media={resolvedMedia} caption={mediaCaption} isLogo={block.media?.kind === "site-logo"} />
    ) : null;

  const TextColumn = textHtml ? (
    <div
      // `prose` s'arrête à h4 : sans ces deux variantes, un h5 ou un h6 se
      // rendrait comme du texte courant en gras, indiscernable d'un
      // paragraphe. On les pose explicitement.
      className="akfc-prose tiptap-rendered prose max-w-none prose-h5:text-base prose-h5:font-semibold prose-h5:mt-6 prose-h6:text-sm prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wide prose-h6:mt-6"
      dangerouslySetInnerHTML={{ __html: textHtml }}
    />
  ) : null;

  // Une seule partie → centré sur la MESURE, pas sur une largeur d'écran.
  // `max-w-3xl` valait 768px, soit ~96 caractères par ligne : au-delà de la
  // plage lisible. La mesure est en `ch`, donc elle suit la taille du texte
  // au lieu de la contredire.
  if (!hasText || !hasMedia) {
    return (
      <div className="akfc-measure-block">
        {hasMedia ? MediaColumn : TextColumn}
      </div>
    );
  }

  // Deux parties → deux colonnes, côté médias selon l'alternance.
  // `order` disparaît : les largeurs étant portées par les variables, c'est
  // l'ORDRE DU DOM qui décide, et il suffit de le construire dans le bon
  // sens (cf. plus bas).
  // `items-start` et non `items-center` : le média s'aligne sur la PREMIÈRE
  // LIGNE du texte, comme en édition imprimée. Centrer les colonnes faisait
  // flotter l'image à mi-hauteur dès que le texte était plus long qu'elle, et
  // ouvrait le bloc sur un vide asymétrique.
  return (
    // `akfc-block-scope` est le conteneur de requête ; la grille qu'il
    // enveloppe est l'élément interrogé. Les deux ne peuvent pas être le
    // même nœud (cf. globals.css).
    // La gouttière passe par la variable : le laboratoire la règle, et le
    // filet vertical facultatif se peint au milieu.
    <div className="akfc-block-scope">
    <div
      className="akfc-block-columns grid items-start"
      style={
        {
          gap: "var(--akfc-column-gap)",
          // L'inversion gauche/droite échange les LARGEURS, elle ne joue pas
          // sur `order` : avec des colonnes inégales, `order` déplacerait le
          // contenu sans déplacer les largeurs — le média atterrirait dans
          // la colonne taillée pour le texte.
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

/* ─────────────────────────────────────────────────────────────────────── */
/*  MediaFigure — image ou vidéo selon le kind résolu                       */
/* ─────────────────────────────────────────────────────────────────────── */

function MediaFigure({
  media,
  caption,
  isLogo = false,
}: {
  media: ResolvedMedia;
  caption?: string;
  /** Logo du site : présenté sur un fond adapté à sa couleur (un logo blanc sur blanc disparaît). */
  isLogo?: boolean;
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
      ) : isLogo ? (
        <SiteLogoImage src={media.url} alt={caption ?? "Logo du site"} />
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
