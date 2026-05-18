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

  /** Chemin complet d'origine (tooltip) : "AKFC/pending/cours/cours1" */
  previousPath: string;

  /**
   * Version courte pour sous-texte, générée côté backend (recommandé).
   * Exemple: "…/cours/cours1"
   */
  previousPathShort: string;

  /** Date de mise en corbeille (sert au tri et au suffix de restore si collision) */
  trashedAt: string; // ISO string

  /**
   * Métadonnées Cloudinary utiles à la comparaison.
   * Pour un folder: peut représenter un agrégat (somme des bytes + min(createdAt) ou max(createdAt)).
   */
  sizeBytes?: number;

  /**
   * Cloudinary created_at (ou uploaded_at) pour comparer.
   * Pour folder: même remarque (agrégat).
   */
  createdAt?: string; // ISO string

  /**
   * publicId pour les fichiers Cloudinary, utile pour la preview et la comparaison.
   * Pour les folders, ce champ est absent ou peut contenir un identifiant de dossier virtuel.
   * L'adapter de stockage est responsable de le remplir pour les fichiers, et peut choisir de le faire aussi pour les folders si cela a du sens dans son contexte.
   */
  publicId?: string;

  /**
   * Catégorisation applicative du média.
   * Calculée par l'adapter de stockage qui a déposé l'entry en corbeille.
   * Optionnelle pour deux raisons :
   *   - les folders n'ont pas de mediaKind unique
   *   - les entries antérieures à l'introduction du champ ont NULL en DB
   */
  mediaKind?: "image" | "video" | "document";
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