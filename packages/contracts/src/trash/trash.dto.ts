/**
 * DTOs corbeille (bin)
 *
 * Bin root (AKFC/bin) = liste plate des TrashEntry (tri par trashedAt desc).
 * L'utilisateur ne voit jamais ".trash/<uuid>".
 *
 * createdAt/sizeBytes sont inclus pour aider à comparer sans ouvrir la preview.
 */

export type TrashEntryKind = "folder" | "file";
export type TrashEntryStatus = "IN_BIN" | "RESTORED" | "DELETED";

export type TrashEntryDTO = {
  /** trashId (uuid) */
  id: string;

  /** "AKFC" */
  appRoot: string;

  kind: TrashEntryKind;
  status: TrashEntryStatus;

  /** Nom affiché (ex: "cours1", "image.png") */
  displayName: string;

  /** Chemin complet d'origine (tooltip) : "AKFC/courses/kali" */
  previousPath: string;

  /**
   * Version courte pour sous-texte, générée côté backend (recommandé).
   * Exemple: "…/cours/cours1"
   */
  previousPathShort: string;

  /** Date de mise en corbeille (sert au tri et au suffix de restore si collision) */
  trashedAt: string; // ISO string
  /** Date de la suppression définitive automatique (trashedAt + durée réglée), ISO. */
  purgeAt: string;
  /** Qui a jeté l'élément ; `null` pour une entrée ancienne ou un compte supprimé. */
  trashedByName: string | null;

  /**
   * Taille, utile à la comparaison.
   * Pour un folder: peut représenter un agrégat (somme des bytes + min(createdAt) ou max(createdAt)).
   */
  sizeBytes?: number;

  /**
   * Date de création du fichier (stockage) pour comparer.
   * Pour folder: même remarque (agrégat).
   */
  createdAt?: string; // ISO string

  /**
   * Clé de stockage (R2) d'un fichier en corbeille — sert à l'aperçu.
   * Absente pour les dossiers.
   */
  storageKey?: string;

  /**
   * Catégorisation applicative du média.
   * Calculée par l'adapter de stockage qui a déposé l'entry en corbeille.
   * Optionnelle pour deux raisons :
   *   - les folders n'ont pas de mediaKind unique
   *   - les entries antérieures à l'introduction du champ ont NULL en DB
   */
  mediaKind?: "image" | "video" | "audio" | "document";
};

export type ListBinInput = {
  appRoot: string;
  cursor?: string | null;
  limit?: number;
  /** Filtre displayName / previousPath (optionnel) */
  search?: string;
};

export type ListBinOutput = {
  items: TrashEntryDTO[];
  nextCursor?: string | null;
  totalApprox?: number;
};
/**
 * « Récemment jetés » d'un espace de groupe, vus par un éditeur : ce qui a été jeté dans les
 * espaces où il est éditeur, quel que soit celui qui l'a jeté (trash.listSpacesBin).
 */
export type SpaceBinItem = {
  id: string;
  kind: TrashEntryKind;
  displayName: string;
  /** Chemin d'origine, dans l'espace. */
  previousPath: string;
  /** Le groupe dont l'espace contenait l'élément. */
  groupId: string;
  groupName: string;
  trashedAt: string;
  purgeAt: string;
  trashedByName: string | null;
  sizeBytes?: number;
};
