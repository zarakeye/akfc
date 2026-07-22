/**
 * Utilitaires Cloudinary spécifiques à l'adapter du finder agnostique.
 *
 * Ces helpers servent à reconstituer côté UI ce que le contrat
 * `StorageNode` (agnostique) ne transporte volontairement pas :
 *   - `getMediaUrl(publicId)` : reconstruction de l'URL d'affichage à
 *     partir du publicId reçu via `path`.
 *   - `kindFromFormat(format)` : déduction du kind 'image'|'video'|'document'
 *     à partir du format technique transporté en `metadata.format`.
 *
 * Ces deux opérations sont Cloudinary-spécifiques par nature et ont donc
 * leur place dans l'adapter Cloudinary, pas dans le contrat agnostique.
 */

type Variant = 'thumb' | 'large' | 'original';

/**
 * Encodage RFC 3986 d'un segment de chemin.
 *
 * `encodeURIComponent` laisse littéraux six caractères — ( ) ! ' * ~ — qui
 * traversent alors le routage Next, la signature Cloudinary et le cache HTTP
 * sans garantie de traitement uniforme. On les encode explicitement : sans
 * effet sur les noms ordinaires, et sans risque puisque le serveur décode.
 */
function encodeSegment(segment: string): string {
  return encodeURIComponent(segment).replace(
    /[!'()*~]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/**
 * Construit l'URL d'affichage d'un asset Cloudinary à partir de son publicId.
 *
 * L'endpoint `/api/media/by-public-id/...` est un proxy maison qui sait
 * gérer les publicId Cloudinary (encodage, signature, transformations).
 * On encode chaque segment du publicId pour préserver les caractères
 * spéciaux dans les noms de dossiers ou de fichiers.
 */
export function getMediaUrl(
  source: { publicId: string; format?: string },
  variant: Variant = 'thumb',
): string {
  const encoded = source.publicId
    .split('/')
    .map(encodeSegment)
    .join('/');

  // Le format part avec l'URL quand on le connaît : c'est lui qui rend le
  // public_id non ambigu côté Cloudinary pour les noms contenant un point.
  // Inutile si le publicId porte déjà son extension (assets R2 / raw).
  const { format } = source;
  const suffix =
    format && !source.publicId.toLowerCase().endsWith(`.${format.toLowerCase()}`)
      ? `&format=${encodeURIComponent(format)}`
      : '';

  return `/api/media/by-public-id/${encoded}?variant=${variant}${suffix}`;
}

/**
 * Déduit le `kind` applicatif ('image' | 'video' | 'document') à partir
 * du format Cloudinary et, en fallback, de l'extension du nom de fichier.
 *
 * Cette logique vit aussi côté backend (`mapCloudinaryFolderToClient`),
 * mais le contrat agnostique ne transporte pas toujours le `format` brut
 * dans `StorageMetadata` (selon ce que renvoie effectivement la route
 * `storage.getTree`). Quand `format` est absent, on tente une déduction
 * à partir de l'extension du `name`, ce qui couvre la majorité des cas
 * réels où Cloudinary n'a pas posé de `format` explicite sur l'asset.
 *
 * Si ni `format` ni une extension reconnaissable ne sont disponibles,
 * on retombe sur 'document' — un fichier inconnu est affiché comme un
 * document plutôt que comme une image cassée.
 *
 * @param format format technique Cloudinary (`'jpg'`, `'mp4'`, `'pdf'`, …)
 * @param name nom du fichier, utilisé en fallback pour extraire l'extension
 */
export function kindFromFormat(
  format: string | undefined,
  name?: string,
): 'image' | 'video' | 'document' {
  // Source primaire : le format technique transporté par metadata.
  const fromFormat = matchKind(format);
  if (fromFormat) return fromFormat;

  // Fallback : extension du nom de fichier (ex: 'foo.jpg' → 'jpg').
  // Utile quand le backend ne pose pas de `format` dans le metadata du tree.
  if (name) {
    const ext = name.includes('.') ? name.split('.').pop() : undefined;
    const fromName = matchKind(ext);
    if (fromName) return fromName;
  }

  return 'document';
}

function matchKind(token: string | undefined): 'image' | 'video' | 'document' | null {
  if (!token) return null;
  if (/^(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(token)) return 'image';
  if (/^(mp4|webm|mov|avi|mkv)$/i.test(token)) return 'video';
  return null;
}
