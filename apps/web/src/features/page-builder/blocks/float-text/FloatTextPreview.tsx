"use client";

import { useState, type CSSProperties, type JSX } from "react";
import { hasRichText, richTextHtml } from "../../richTextHtml";

import type { FloatTextBlockV1 } from "@contracts/page";
import { useResolvedPreviewMedia } from "@features/page-builder/components/useResolvedPreviewMedia";

/**
 * Aperçu CLIENT du bloc float, affiché sous l'éditeur dans le builder.
 *
 * Reproduit le rendu public (FloatTextView, Server Component non montable
 * ici) : même enrobage, même côté. La résolution des médias suit exactement
 * le patron du MediaTextPreview — les deux blocs partagent le modèle de
 * média, il n'y avait aucune raison d'en inventer un autre.
 *
 * Le texte passe par `richTextHtml`, sans résolution de médias : une image
 * insérée DANS le texte n'apparaît pas dans l'aperçu, ce qui est acceptable.
 */

export function FloatTextPreview({
  block,
}: {
  block: FloatTextBlockV1;
}): JSX.Element | null {
  const { media, resolution } = useResolvedPreviewMedia(block.media ?? null);
  // Distinct de `resolution` : la résolution peut réussir (on a une URL) et le binaire échouer
  // quand même. Avec un `alt` vide, une image cassée n'occupe aucune place — l'écran reste blanc
  // sans le moindre signe. L'échec est noté pour une URL : choisir un autre média l'efface de
  // lui-même, sans effet à écrire.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageFailed = media !== null && failedUrl === media.url;

  const hasText = hasRichText(block.content);

  const textHtml = hasText ? richTextHtml(block.content) : null;

  // Rien à montrer : on dit LAQUELLE des situations c'est, plutôt que de
  // rendre du vide indistinct.
  if (!hasText && !media) {
    return (
      <p className="text-sm text-muted-foreground">
        {resolution === "loading"
          ? "Chargement du média…"
          : resolution === "missing"
            ? "Média sélectionné introuvable (supprimé, en attente, ou avatar d'un autre membre, qui ne peut plus être posé)."
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
                  ? "Média sélectionné introuvable (supprimé, en attente, ou avatar d'un autre membre, qui ne peut plus être posé)."
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
                onError={() => setFailedUrl(media.url)}
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
