/**
 * Métadonnées d'un media asset, telles qu'exposées au finder côté UI.
 *
 * Tous les champs sont optionnels parce que la source de vérité varie :
 *
 *   - `url`, `format`, `kind` : produits par l'adapter au moment du `list()`,
 *     toujours présents pour les fichiers (vides pour les folders).
 *   - Les champs depuis `createdAt` vers le bas sont enrichis par le hook
 *     `useMediaAssetEnrichment` après le list, en cherchant la row
 *     `MediaAsset` correspondante en DB. Si pas de row (fichier antérieur
 *     au tracking, ou upload R2 non encore couvert), ces champs restent
 *     `undefined` et le finder retombe sur les valeurs par défaut
 *     ("Date inconnue", "Expéditeur inconnu", etc.).
 *
 * Pour les fichiers via R2, le tracking sera couvert en Phase 2 ; en
 * attendant, ils s'affichent comme orphelins (date/sender inconnus).
 */
export type MediaMeta = {
  url?: string;
  format?: string;
  kind?: 'image' | 'video' | 'document';

  // ─── Enrichissement Phase 1 (depuis MediaAsset DB) ──────────────────────
  /** Date d'upload du fichier (ISO 8601). Pour le tri/groupage par Date. */
  createdAt?: string;
  /** Display name composé : pseudo > firstName lastName > email. */
  uploadedBy?: string;
  /** User ID brut, pour des filtres "fichiers de X" futurs. */
  uploaderId?: string;
  /** MIME type (ex: "image/jpeg", "audio/mpeg"). */
  mimeType?: string;
  /** Dimensions pour images/vidéos. */
  width?: number;
  height?: number;
  /** Durée en secondes pour vidéos/audios. */
  duration?: number;
  /** Description libre éditée par l'utilisateur (Phase 3). */
  description?: string;
  /** Taille en octets (DB). Doublon potentiel avec FinderNode.size, peut diverger
   * (FinderNode.size vient du storage, MediaMeta.bytes vient de la DB au moment
   * de l'upload). Garder les deux pour audit si besoin. */
  bytes?: number;
};
