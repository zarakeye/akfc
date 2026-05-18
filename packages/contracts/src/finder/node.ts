import type { MediaMeta } from "@contracts/finder/meta.types";

/**
 * Types de base pour les nœuds du finder.
 * Un nœud représente un fichier ou un dossier dans le finder, avec des propriétés communes.
 * Chaque adapter peut enrichir ces nœuds avec des métadonnées spécifiques via le champ `meta`.
 * Les chemins (path) des nœuds sont logiques et sont la source de vérité pour le finder, 
 * ils peuvent être différents des chemins physiques ou URLs selon l'adapter.
 */
export type NodeType = 'folder' | 'file';

/**
 * Représente un nœud dans le finder (dossier ou fichier).
 * Chaque adapter peut enrichir cette interface via le champ `meta` sans casser le core.
 */
export interface FinderNode {
  id: string;             // unique (peut être path ou uuid selon adapter)
  name: string;
  path: string;           // chemin logique (source of truth)
  type: NodeType;
  
  hasChildren?: boolean;  // utile pour lazy loading
  size?: number;          // optionnel (files)
  mimeType?: string;      // optionnel

  /**
   * Enfants du node — uniquement renseigné quand le node est issu d'un
   * `getTree(depth > 1)` qui a chargé la sous-arborescence.
   *
   * Convention sémantique :
   *   - `undefined` : non chargé (par exemple à la profondeur max d'un getTree)
   *   - `[]`        : vide pour de vrai
   *   - non vide    : enfants chargés
   *
   * `hasChildren` ci-dessus reste utile pour signaler explicitement la
   * présence d'enfants même quand `children` est `undefined` (cas où on
   * sait qu'il y a quelque chose mais on ne l'a pas encore chargé).
   */
  children?: FinderNode[];

  /**
   * 👉 important pour DnD
   */
  isDraggable?: boolean;
  isDroppable?: boolean;

  // extensible sans casser le core
  meta?: MediaMeta;
}