/**
 * Le fichier que produit un recadrage : sa taille en pixels, son format, son nom.
 *
 * Règles pures, sans React ni DOM : elles vivent dans les contrats pour se tester seules
 * (e2e/recadrage.spec.ts). L'encodage lui-même, qui demande au navigateur, est dans
 * apps/web/src/features/gallery-crop/lib/encodeCanvas.ts.
 */

/** Formats préférés pour une photo : AVIF, puis WebP, puis JPEG (que tout navigateur sait écrire). */
export const PHOTO_OUTPUT_TYPES = ["image/avif", "image/webp", "image/jpeg"] as const;

/** Côté le plus long d'un recadrage, au plus (une photo de 48 Mpx n'a pas à rester à 8000 px). */
export const MAX_OUTPUT_SIDE = 4096;

const EXT_BY_TYPE: Record<string, string> = {
  "image/avif": "avif",
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

/** Qualité de compression pour les formats avec perte. */
export const CROP_QUALITY = 0.9;

/**
 * Côté le plus long du fichier produit, en pixels de l'image d'origine.
 *
 * Le cadre est mesuré en pixels de l'établi (l'écran). L'image y est affichée réduite
 * (`containScale`) puis agrandie par le zoom : un pixel d'établi couvre donc
 * 1 / (containScale × zoom) pixels de la photo. On rend ce que la photo contient vraiment,
 * sans l'agrandir au-delà de sa résolution, et sans dépasser `maxSide`.
 */
export function outputSide(params: {
  gridWidth: number;
  gridHeight: number;
  imageWidth: number;
  imageHeight: number;
  workspaceSize: number;
  zoom: number;
  maxSide?: number;
}): number {
  const { gridWidth, gridHeight, imageWidth, imageHeight, workspaceSize, zoom, maxSide = MAX_OUTPUT_SIDE } = params;
  const containScale = Math.min(workspaceSize / imageWidth, workspaceSize / imageHeight);
  const native = Math.max(gridWidth, gridHeight) / (containScale * zoom);
  return Math.max(1, Math.round(Math.min(maxSide, native)));
}

/** Le nom suit le format : « photo.jpg » encodé en WebP devient « photo.webp ». */
export function renameForType(fileName: string, mimeType: string): string {
  const ext = EXT_BY_TYPE[mimeType] ?? "png";
  const dot = fileName.lastIndexOf(".");
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  return `${base}.${ext}`;
}
