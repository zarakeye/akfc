/**
 * Utilitaires de l'adapter du finder : ce que le contrat `StorageNode`
 * (agnostique) ne transporte volontairement pas.
 *   - `getMediaUrl(path)` : URL d'affichage via le proxy R2.
 *   - `kindFromFormat(format)` : 'image' | 'video' | 'document'.
 */

export type MediaVariant = 'thumb' | 'small' | 'medium' | 'large' | 'original';

/**
 * Encodage RFC 3986 d'un segment de chemin.
 *
 * `encodeURIComponent` laisse littéraux six caractères — ( ) ! ' * ~ — qui
 * traversent alors le routage Next et le cache HTTP sans garantie de
 * traitement uniforme. On les encode explicitement : sans effet sur les noms
 * ordinaires, et sans risque puisque le serveur décode.
 */
function encodeSegment(segment: string): string {
  return encodeURIComponent(segment).replace(
    /[!'()*~]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/**
 * URL d'affichage d'un fichier stocké sur R2 (proxy admin, session requise).
 * Une image est servie en vignette (`variant`), un autre fichier tel quel.
 */
export function getMediaUrl(storagePath: string, variant: MediaVariant = 'thumb'): string {
  const encoded = storagePath.split('/').map(encodeSegment).join('/');
  return variant === 'original'
    ? `/api/media/r2/${encoded}`
    : `/api/media/r2/${encoded}?variant=${variant}`;
}

/**
 * Déduit le `kind` applicatif ('image' | 'video' | 'document') à partir
 * du format technique et, en fallback, de l'extension du nom de fichier
 * (le contrat agnostique ne transporte pas toujours `format`).
 *
 * Si ni `format` ni une extension reconnaissable ne sont disponibles,
 * on retombe sur 'document' — un fichier inconnu est affiché comme un
 * document plutôt que comme une image cassée.
 *
 * @param format format technique (`'jpg'`, `'mp4'`, `'pdf'`, …)
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
  if (/^(jpg|jpeg|png|webp|avif|gif|svg|heic|heif)$/i.test(token)) return 'image';
  if (/^(mp4|webm|mov|m4v|avi|mkv)$/i.test(token)) return 'video';
  return null;
}
