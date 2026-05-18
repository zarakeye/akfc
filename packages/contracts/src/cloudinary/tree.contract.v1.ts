/**
 * Version 1 — Cloudinary Tree Contract
 *
 * Représentation métier de l’arborescence des images Cloudinary
 * telle qu’utilisée par l’application.
 */

export type BaseNode = {
  /**
   * Discriminant du type de nœud.
   * Permet un typage sûr via discriminated unions.
   */
  type: 'folder' | 'file';

  /**
   * Nom lisible du nœud.
   * - Folder : dernier segment du path
   * - File   : nom du fichier (sans extension si souhaité)
   */
  name: string;
};

export type CloudinaryFolderNode = BaseNode & {
  type: 'folder';

  /**
   * Chemin logique complet du dossier.
   * Sert d’identifiant unique dans l’arborescence.
   *
   * Ex: my-app/pending/sport/running
   */
  path: string;

  /**
   * Contenu du dossier.
   * Peut contenir récursivement des dossiers ou des fichiers.
   */
  children: CloudinaryNode[];
};

export type CloudinaryFileNode = BaseNode & {
  type: 'file';

  /**
   * Identifiant Cloudinary du fichier.
   * Utilisé pour :
   * - suppression
   * - déplacement
   * - validation
   */
  publicId: string;

  /**
   * Chemin logique complet du fichier.
   * Sert d’identifiant unique dans l’arborescence.
   *
   * Ex: my-app/pending/sport/running/shoe.jpg
   */
  name?: string; // optionnel, peut être dérivé du publicId si absent

  /**
   * URL sécurisée de l’image.
   * Utilisée uniquement pour l’affichage.
   */
  url?: string;

  /**
   * Format du fichier (jpg, png, etc.).
   * Utile pour les icônes ou les traitements spécifiques.
   */
  format?: string; // optionnel, peut être dérivé du publicId ou de l’URL si absent
};

export type CloudinaryNode = CloudinaryFolderNode | CloudinaryFileNode;