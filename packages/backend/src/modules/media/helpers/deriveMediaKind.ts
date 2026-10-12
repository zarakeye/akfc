/**
 * deriveMediaKind.ts
 *
 * Source UNIQUE de la dérivation du `kind` d'un média à partir de son type
 * MIME. Auparavant cette logique était dupliquée inline dans
 * `media.resolveByIds` ET `gallery.getCarousel`, avec le risque qu'elles
 * divergent. On la centralise ici.
 *
 * Tout ce qui n'est ni vidéo, ni audio, ni image (pdf, docs, archives…) →
 * `document`.
 */

export type MediaKind = "image" | "video" | "audio" | "document";

export function deriveMediaKind(mimeType: string | null): MediaKind {
  const mime = mimeType ?? "";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("image/")) return "image";
  return "document";
}
