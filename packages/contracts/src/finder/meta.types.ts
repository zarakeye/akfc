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
  /**
   * Emplacement RÉEL du binaire chez le provider, quand il diffère de
   * `FinderNode.path`.
   *
   * ─── Pourquoi ce champ vit dans `meta` et pas dans `id` ───────────────
   *
   * Le chantier « arbre sans strate de statut » sépare pour de bon le chemin
   * LOGIQUE (ce par quoi la UI navigue) du chemin PHYSIQUE (où vit le
   * binaire) :
   *
   *   path         : AKFC/cours/tchoy-lee-fut/photo
   *   storagePath  : AKFC/pending/cours/tchoy-lee-fut/photo
   *
   * Tout ce qui parle au PROVIDER ou à la DB — URL de preview, lecture de
   * métadonnées, source d'un move, mise en corbeille, jointure avec
   * `MediaAsset.fullPath` — a besoin du second. Tout ce qui parle à
   * l'UTILISATEUR a besoin du premier.
   *
   * `id` ne peut PAS jouer ce rôle. Il est l'identité d'unicité du nœud, et
   * le contrat le dit : « peut être path ou uuid selon adapter ». De fait il
   * l'est déjà — un fichier remonté par le finder porte son chemin, le même
   * fichier remonté par la recherche porte son cuid `MediaAsset.id`. Les
   * deux sont légitimes, les deux sont uniques, aucun n'est un localisateur.
   * D'où ce champ dédié : un seul accès, valable quelle que soit la
   * provenance du nœud.
   *
   * ─── Durée de vie ─────────────────────────────────────────────────────
   *
   * TRANSITOIRE. À l'étape 5 du chantier (migration des binaires en chemins
   * plats), `storagePath === path` pour tout le monde et le champ se
   * supprime. Ne rien construire d'autre dessus.
   */
  storagePath?: string;

  url?: string;
  format?: string;
  kind?: 'image' | 'video' | 'document';

  /** Nom lisible de l'expéditeur (Dépôt commun) — depuis MediaAsset. */
  uploaderName?: string;

  // ─── Enrichissement Phase 1 (depuis MediaAsset DB) ──────────────────────
  /**
   * Statut de cycle de vie, depuis `MediaAsset.status` en DB.
   *
   * C'est la source de vérité VISÉE : à terme le statut ne sera plus déduit
   * du chemin (`statusFromPath`), qui encode aujourd'hui la même information
   * dans le path — d'où les moves physiques à chaque publication.
   *
   * `undefined` = pas de row MediaAsset (fichier antérieur au tracking) : les
   * consommateurs retombent alors sur `statusFromPath`.
   */
  status?: 'pending' | 'published' | 'bin';
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
