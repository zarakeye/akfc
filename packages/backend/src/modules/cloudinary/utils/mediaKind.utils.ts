/**
 * Traduit un `resource_type` Cloudinary en `mediaKind` applicatif.
 *
 * Cloudinary expose trois resource_type :
 *   - "image" : tous les formats raster/vectoriels traités comme images
 *   - "video" : vidéos ET pistes audio (Cloudinary les confond)
 *   - "raw"   : tout le reste (PDF, ZIP, txt, etc.)
 *
 * Notre vocabulaire applicatif `mediaKind` est volontairement plus pauvre
 * (image | video | document) parce qu'il vit côté UI/contrats, où on n'a
 * pas besoin de la distinction interne Cloudinary.
 *
 * Ce helper VIT dans la couche Cloudinary parce que la traduction est
 * provider-spécifique. Quand R2 viendra, il aura son propre helper
 * (probablement `mediaKindFromContentType` qui regardera le mime type
 * complet) et alimentera la même colonne SQL agnostique `mediaKind`.
 */

export type CloudinaryResourceType = "image" | "video" | "raw";
export type MediaKind = "image" | "video" | "document";

export function mediaKindFromCloudinaryResourceType(
  resourceType: CloudinaryResourceType
): MediaKind {
  switch (resourceType) {
    case "image":
      return "image";
    case "video":
      return "video";
    case "raw":
      return "document";
  }
}
