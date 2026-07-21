/**
 * Détection de type de fichier — source unique, partagée entre la grid
 * (GridItem) et la tree (FinderTreeFile). Évite deux logiques divergentes.
 *
 * `meta.kind` (contrat) ne distingue pas audio de document (les deux sont
 * 'document'). On raffine ici par extension du nom de fichier — l'info
 * toujours disponible en UI.
 */

const AUDIO_EXTENSIONS = new Set([
  'mp3', 'wav', 'ogg', 'oga', 'm4a', 'opus', 'flac',
]);

const PDF_EXTENSIONS = new Set(['pdf']);

export function getFileExtension(name: string): string | null {
  const idx = name.lastIndexOf('.');
  if (idx === -1 || idx === name.length - 1) return null;
  return name.slice(idx + 1).toLowerCase();
}

export function isAudioFile(extension: string | null): boolean {
  return extension !== null && AUDIO_EXTENSIONS.has(extension);
}

export function isPdfFile(extension: string | null): boolean {
  return extension !== null && PDF_EXTENSIONS.has(extension);
}

/**
 * Extension effective d'un nœud : le `format` Cloudinary (qui n'inclut pas
 * l'extension dans le nom) en priorité, sinon l'extension du nom (cas R2).
 */
export function effectiveExtension(
  format: string | null | undefined,
  name: string,
): string | null {
  return format?.toLowerCase() ?? getFileExtension(name);
}

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'csv', 'json', 'log', 'yml', 'yaml',
]);

export function isTextFile(extension: string | null): boolean {
  return extension !== null && TEXT_EXTENSIONS.has(extension);
}

/**
 * Transforme une URL Cloudinary de vidéo en URL de thumbnail JPG (première
 * image via `so_auto`). Extrait de GridItem pour partage grid/tree.
 */
export function getCloudinaryVideoThumbnail(url: string): string | null {
  if (!url.includes('/video/upload/')) return null;
  const withSoAuto = url.includes('/upload/so_auto/')
    ? url
    : url.replace('/upload/', '/upload/so_auto/');
  return withSoAuto.replace(
    /\.(mp4|webm|mov|avi|mkv|m4v|ogv|flv|wmv)$/i,
    '.jpg',
  );
}
