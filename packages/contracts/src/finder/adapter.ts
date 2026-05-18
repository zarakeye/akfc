import type { FinderNode } from "@contracts/finder/node";

/**
 * Ce fichier définit les types liés à l'adapter de fichiers pour le Finder.
 * Un adapter est responsable de fournir les données des fichiers et dossiers
 * à afficher dans le Finder, ainsi que d'implémenter les actions de base
 * comme la navigation, la sélection, etc.
 */

/**
 * Options pour la méthode `list` de l'adapter, qui liste le contenu d'un dossier.
 * Le chemin fourni est un chemin logique, qui est la source de vérité pour le Finder.
 * L'adapter peut le mapper à un chemin physique ou une URL selon son implémentation.
 * Les options de pagination sont optionnelles et peuvent être utilisées selon les besoins de l'adapter.
 */
export interface ListOptions {
  path: string;          // chemin logique du dossier à lister
  cursor?: string | null; // pour pagination (optionnel)
  limit?: number;       // nombre maximum d'items à retourner (optionnel)
}

/**
 * Résultat de la méthode `list` de l'adapter. Contient les dossiers et fichiers enfants du dossier demandé,
 * ainsi qu'un curseur pour la pagination si nécessaire.
 * Les chemins des nodes retournés sont des chemins logiques, qui sont la source de vérité pour le Finder.
 */
export interface ListResult {
  folders: FinderNode[]; // dossiers enfants
  files: FinderNode[]; // fichiers enfants
  
  nextCursor: string | null; // pour pagination, null si pas de page suivante
}

/**
 * Options pour la méthode `getTree` de l'adapter, qui retourne un sous-arbre
 * dépliable.
 *
 * Pour la TreeView du finder, qui doit pouvoir afficher plusieurs niveaux
 * en même temps pour rendre fluide le DnD entre branches voisines.
 */
export interface GetTreeOptions {
  path: string;
  /**
   * Profondeur maximale du sous-arbre retourné.
   * - `1` (default) : équivalent à `list` en couverture, mais retour structuré.
   * - `N > 1`       : descend N niveaux. Au-delà de `depth`, les folders feuilles
   *                   ont `children: undefined` (signal "non chargé").
   *
   * Borne souple recommandée : ≤ 5. Au-delà, l'adapter peut choisir de
   * tronquer ou d'échouer selon ses contraintes propres.
   */
  depth?: number;
}

/**
 * Résultat de `getTree`.
 *
 * `root` est le folder à `path`, avec ses enfants chargés jusqu'à la
 * profondeur demandée. Pour des paths qui résolvaient un fichier, le
 * comportement est à la charge de l'adapter (typiquement : exception
 * ou folder vide).
 */
export interface GetTreeResult {
  root: FinderNode;
}

/**
 * Métadonnées riches d'un asset, telles qu'utiles pour une sidebar de
 * preview ou un panneau de détails.
 *
 * Ces champs ne sont pas portés par `FinderNode.meta` parce qu'ils ne
 * sont pas nécessaires à l'affichage standard d'une grille ou d'un arbre.
 * `getMetadata` est l'opération à privilégier quand on veut "ouvrir" un
 * node pour en voir les détails.
 *
 * Tous les champs sont optionnels parce que les providers ne les
 * exposent pas tous — un asset orphelin de métadonnées doit pouvoir
 * exister sans bloquer.
 */
export interface FinderNodeMetadata {
  bytes?: number;
  /** ISO 8601, fuseau UTC */
  createdAt?: string;
  /** ISO 8601, fuseau UTC */
  updatedAt?: string;
  /** Format technique (extension, content-type technique) */
  format?: string;
  /** MIME type complet quand disponible */
  mimeType?: string;
}

/**
 * Interface de l'adapter de fichiers pour le Finder.
 * Un adapter doit implémenter au minimum la méthode `list` pour fournir les données.
 * Les autres méthodes sont optionnelles et peuvent être implémentées selon les besoins.
 * L'adapter doit travailler avec des chemins logiques (path) qui sont la source de vérité,
 * et peuvent être différents des chemins physiques ou URLs.
 */
export interface FileAdapter {
  /**
   * Liste le contenu d'un dossier donné par son chemin logique.
   * @param options
   */
  list(options: ListOptions): Promise<ListResult>;

  /**
   * (optionnel) Récupère un sous-arbre dépliable.
   *
   * Pour la TreeView qui doit pouvoir tenir plusieurs branches dépliées
   * simultanément avec leurs enfants. Un adapter qui n'expose qu'une
   * vue plate peut omettre cette méthode — la TreeView retombera alors
   * sur des appels `list` cascadés.
   */
  getTree?(options: GetTreeOptions): Promise<GetTreeResult>;

  /**
   * (optionnel) Récupérer un node précis
   */
  getNode?(path: string): Promise<FinderNode | null>;

  /**
   * (optionnel) Récupère les métadonnées riches d'un asset.
   *
   * Pour la sidebar de preview détaillée (taille, dates, format complet).
   * `null` si le path n'existe pas ou ne porte pas de métadonnées.
   */
  getMetadata?(path: string): Promise<FinderNodeMetadata | null>;

  /**
   * Déplace un ou plusieurs items vers une cible.
   *
   * Verbe canonique pour tous les déplacements — y compris ceux d'un seul
   * élément (auquel cas `items` contient un seul MoveItem). Le DnD du
   * Finder, qu'il porte une sélection unique ou multiple, passe toujours
   * par cette méthode.
   *
   * La cible peut être exprimée :
   *   - par un path concret (`target: { type: 'folder', path }`)
   *   - par un statut applicatif (`target: { type: 'status-folder', status }`)
   * Voir `MoveTarget` pour la sémantique exacte.
   *
   * Optionnel : un adapter en lecture seule peut ne pas l'implémenter.
   */
  moveItems?(options: MoveOptions): Promise<void>;

  /**
   * (optionnel) delete
   * @param path
   */
  delete?(path: string): Promise<void>;
}

/**
 * Segments d'un chemin pour la navigation (ex: "Dossier1 > SousDossierA > ...")
 * Utile pour construire le breadcrumb et gérer la navigation dans le Finder.
 * Chaque segment contient un nom à afficher et un chemin logique correspondant.
 * Le chemin logique est la source de vérité pour l'adapter, il peut être différent du chemin physique.
 */
export interface PartSegment {
  name: string;
  path: string;
}

/* -------------------------------------------------------------------------- */
/*                                 MOVE TYPES                                 */
/* -------------------------------------------------------------------------- */

export interface MoveItem {
  id: string;
  path: string;
  type: 'file' | 'folder';
}

/**
 * Cible d'un move, discriminée par `type`.
 *
 * - `folder`        : cible exprimée par un path concret (déplacement
 *                     classique vers un dossier connu).
 * - `status-folder` : cible exprimée par un statut applicatif
 *                     (`pending` / `published` / `bin`). C'est l'adapter
 *                     qui calcule le path concret en respectant la
 *                     convention applicative (typiquement : préserver
 *                     la structure post-statut de la source).
 *
 * La cohérence avec `StorageMoveTarget` côté backend est volontaire :
 * ce contrat frontend exprime les mêmes intentions que le contrat
 * agnostique, en vocabulaire UI.
 */
export type MoveTarget =
  | { type: 'folder'; path: string }
  | { type: 'status-folder'; status: 'pending' | 'published' | 'bin' };

export interface MoveOptions {
  items: MoveItem[];

  target: MoveTarget;

  /**
   * comportement en cas de conflit
   */
  strategy?: 'overwrite' | 'skip' | 'rename';
}
