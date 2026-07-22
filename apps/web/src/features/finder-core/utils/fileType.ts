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
 * URL de la « première image » (poster) d'une vidéo. Le front reçoit une URL
 * proxy `/api/media/by-public-id/…?variant=…` ; le proxy sait servir la 1re
 * frame quand on ajoute `as=poster` (cf. route media + fetchVideoPoster).
 * Renvoie null si l'URL n'est pas une URL média proxy exploitable.
 */
export function videoPosterUrl(url: string): string | null {
  if (!url) return null;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}as=poster`;
}

/**
 * Nom d'affichage AVEC extension. Les publicId Cloudinary ne portent pas
 * l'extension dans leur nom (contrairement aux clés R2) : on la reconstruit
 * depuis `format` quand elle manque.
 */
export function displayName(
  name: string,
  format: string | null | undefined,
): string {
  if (!format) return name;
  const ext = format.toLowerCase();
  return name.toLowerCase().endsWith(`.${ext}`) ? name : `${name}.${ext}`;
}

/**
 * Nom sans son extension — ce que l'utilisateur édite lors d'un renommage.
 *
 * ⚠️ On NE coupe PAS au dernier point : un nom peut légitimement en contenir
 * (« CNI recto PORQUET (ep. BAZZE) Yvonne »), et couper là tronquerait le
 * nom. On retire uniquement le suffixe `.{format}` quand `format` — la
 * source autoritaire, issue du metadata — est connu et présent en fin de nom.
 */
export function baseNameOf(
  name: string,
  format?: string | null,
): string {
  if (format) {
    const suffix = `.${format.toLowerCase()}`;
    if (name.toLowerCase().endsWith(suffix)) {
      return name.slice(0, -suffix.length);
    }
    return name;
  }
  // Sans format : on ne retire un suffixe que s'il A LA FORME d'une extension
  // (1 à 8 caractères alphanumériques). Sinon le nom est déjà la base.
  const match = /\.([A-Za-z0-9]{1,8})$/.exec(name);
  return match ? name.slice(0, -match[0].length) : name;
}
