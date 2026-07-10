/**
 * deriveMediaKind.ts
 *
 * Source UNIQUE de la dérivation du `kind` d'un média à partir du couple
 * (resourceType Cloudinary, mimeType). Auparavant cette logique était
 * dupliquée inline dans `media.resolveByIds` ET `gallery.getCarousel`, avec
 * le risque qu'elles divergent. On la centralise ici.
 *
 * ─── Règles ─────────────────────────────────────────────────────────────────
 *
 *   - `resourceType` fait foi en priorité (le mimeType a pu être corrompu à
 *     l'upload, ex. l'ancien bug `image/mp4`).
 *   - Cloudinary range l'AUDIO sous `resource_type: "video"` → on désambiguïse
 *     l'audio par le mimeType (`audio/*`).
 *   - En l'absence de resourceType fiable (assets R2 : resourceType null), on
 *     retombe sur le mimeType.
 *   - Tout le reste (pdf, docs, archives…) → `document`.
 */

export type MediaKind = "image" | "video" | "audio" | "document";

export function deriveMediaKind(
  resourceType: string | null,
  mimeType: string | null,
): MediaKind {
  const mime = mimeType ?? "";

  if (resourceType === "video") {
    return mime.startsWith("audio/") ? "audio" : "video";
  }
  if (resourceType === "image") {
    return "image";
  }

  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("image/")) return "image";

  return "document";
}