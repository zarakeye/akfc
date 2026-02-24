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
   * ➜ À définir côté backend (voir commentaire).
   */
  sizeBytes?: number;

  /**
   * Cloudinary created_at (ou uploaded_at) pour comparer.
   * Pour folder: même remarque (agrégat).
   */
  createdAt?: string; // ISO string

  /**
   * Optionnel: preview pour file (thumbnail)
   * Pour folder: généralement absent.
   */
  previewUrl?: string;
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