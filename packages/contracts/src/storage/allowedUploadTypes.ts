/**
 * Formats de fichiers acceptés par la bibliothèque (finder, formulaire d'envoi, espaces de
 * groupe, documents des membres).
 *
 * Une liste d'AUTORISÉS et non d'interdits : tout format non prévu est refusé. Sont exclus en
 * particulier les formats qu'un navigateur peut exécuter ou interpréter comme une page (HTML,
 * SVG, XML, scripts, code source : js, jsx, ts, tsx, mdx…). Le logo du site, seul SVG accepté,
 * a son propre circuit (siteSettings.uploadLogo).
 *
 * Pour chaque extension, les types MIME qu'un navigateur peut déclarer. Le serveur exige que
 * l'extension ET le type déclaré concordent : un « planning.pdf » annoncé comme text/html est
 * refusé. `application/octet-stream` (type inconnu du navigateur, fréquent pour HEIC ou RAR)
 * est toléré pour une extension autorisée : un fichier ainsi typé n'est jamais affiché, seulement
 * téléchargé.
 */
export const ALLOWED_UPLOAD_TYPES: Readonly<Record<string, readonly string[]>> = {
  // Images
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  avif: ["image/avif"],
  gif: ["image/gif"],
  heic: ["image/heic", "image/heif"],
  heif: ["image/heif", "image/heic"],
  // Vidéos
  mp4: ["video/mp4"],
  webm: ["video/webm"],
  mov: ["video/quicktime"],
  // Audio
  mp3: ["audio/mpeg", "audio/mp3"],
  m4a: ["audio/mp4", "audio/x-m4a", "audio/m4a"],
  ogg: ["audio/ogg", "video/ogg", "application/ogg"],
  wav: ["audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"],
  // Documents
  pdf: ["application/pdf"],
  txt: ["text/plain"],
  md: ["text/markdown", "text/x-markdown", "text/plain"],
  csv: ["text/csv", "application/vnd.ms-excel", "text/plain"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  odt: ["application/vnd.oasis.opendocument.text"],
  ods: ["application/vnd.oasis.opendocument.spreadsheet"],
  odp: ["application/vnd.oasis.opendocument.presentation"],
  // Archives
  zip: ["application/zip", "application/x-zip-compressed"],
  rar: ["application/vnd.rar", "application/x-rar-compressed", "application/x-rar"],
};

/** Extensions acceptées, pour l'attribut `accept` d'un champ de fichier ou un message d'erreur. */
export const ALLOWED_UPLOAD_EXTENSIONS: readonly string[] = Object.keys(ALLOWED_UPLOAD_TYPES);

/**
 * Le fichier est-il accepté ? Renvoie `null` si oui, sinon le message d'erreur à afficher.
 * @param fileName - nom d'origine (seule son extension compte)
 * @param mimeType - type déclaré par le navigateur
 */
export function uploadTypeError(fileName: string, mimeType: string): string | null {
  const dot = fileName.lastIndexOf(".");
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase() : "";
  const mimes = ALLOWED_UPLOAD_TYPES[ext];
  if (!mimes) {
    return `Format non accepté${ext ? ` (.${ext})` : ""}. Formats acceptés : ${ALLOWED_UPLOAD_EXTENSIONS.join(", ")}.`;
  }
  const mime = mimeType.trim().toLowerCase().split(";")[0];
  if (mime !== "application/octet-stream" && !mimes.includes(mime)) {
    return `Le contenu de « ${fileName} » ne correspond pas à son extension .${ext}.`;
  }
  return null;
}
