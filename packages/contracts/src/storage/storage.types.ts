import { z } from 'zod';

/**
 * Types primitifs du contrat StorageAdapter.
 *
 * Ce fichier définit le vocabulaire neutre que tout backend de stockage
 * (R2, S3, FS local…) doit savoir parler. Aucune mention de
 * provider concret ici, par construction.
 *
 * Les choix de design notables :
 *   - Le `path` est une string opaque. Le contrat ne fait aucune hypothèse
 *     sur sa structure (séparateur, racine, encoding). Chaque adapter sait
 *     comment l'interpréter pour lui-même.
 *   - Les nodes utilisent un discriminated union sur `type` ('folder' | 'file').
 *     C'est le même pattern que `FinderNode` côté frontend, mais c'est un
 *     type backend distinct — la frontière entre les deux est traversée
 *     par les adapters frontend qui mappent `StorageNode` → `FinderNode`
 *     en y ajoutant des notions UI (isDraggable, meta.url, etc.).
 *   - `ReadonlyArray` partout pour les retours, pour signaler aux
 *     consommateurs qu'ils ne doivent pas muter la donnée reçue.
 */

/**
 * Chemin logique d'un asset ou d'un dossier dans le stockage.
 *
 * Pour R2, c'est la key de l'objet dans le bucket (avec extension). Pour un
 * FS local, ce serait un chemin POSIX. Le contrat ne tranche pas.
 */
export type StoragePath = string;

/**
 * Métadonnées brutes d'un asset, telles que rapportées par le stockage.
 *
 * Tous les champs sont optionnels parce que tous les providers ne les
 * exposent pas tous, et qu'un asset orphelin de métadonnées doit pouvoir
 * exister dans le contrat sans bloquer.
 */
export type StorageMetadata = {
  bytes?: number;
  /** ISO 8601, fuseau UTC */
  createdAt?: string;
  /** ISO 8601, fuseau UTC */
  updatedAt?: string;
  /** Format technique (extension du fichier) */
  format?: string;
  /** MIME type complet quand disponible */
  mimeType?: string;
  /** Nom lisible de l'expéditeur (depuis MediaAsset.uploaderUserId). */
  uploaderName?: string;
  /**
   * Statut de cycle de vie, depuis `MediaAsset.status` en DB. Rempli par le
   * listing (adapter) — le chemin étant désormais plat, il ne peut plus être
   * dérivé du path.
   */
  status?: 'pending' | 'published' | 'bin';
};

/**
 * Un dossier dans le stockage.
 *
 * `children` peut être :
 *   - `undefined` : pas chargé (ex: profondeur max atteinte dans getTree)
 *   - `[]`        : vide pour de vrai
 *   - non vide    : enfants chargés
 *
 * Cette distinction sémantique permet à un consommateur (TreeView par ex.)
 * de savoir si un dossier "déplié non chargé" mérite un appel supplémentaire.
 *
 * `hasChildren` est un hint optionnel : un adapter qui peut le calculer
 * à bas coût (sans charger les enfants) le remplit, ce qui permet à la
 * TreeView de décorer correctement les dossiers vides vs pleins même
 * quand `children` est undefined.
 */
export interface StorageFolderNode {
  type: 'folder';
  name: string;
  path: StoragePath;
  children?: ReadonlyArray<StorageNode>;
  hasChildren?: boolean;
}

/**
 * Un fichier dans le stockage.
 *
 * Le contrat est volontairement minimaliste : `path` (opaque) + `name` +
 * éventuellement `metadata`. Toute information provider-spécifique
 * (URL de diffusion, signature) reste à l'extérieur de ce type —
 * les adapters frontend peuvent l'enrichir au moment du mapping vers
 * `FinderNode` si la UI en a besoin.
 */
export interface StorageFileNode {
  type: 'file';
  name: string;
  path: StoragePath;
  metadata?: StorageMetadata;
}

export type StorageNode = StorageFolderNode | StorageFileNode;

/* -------------------------------------------------------------------------- */
/*  Options et résultats des méthodes du contrat                              */
/* -------------------------------------------------------------------------- */

export type ListOptions = {
  path: StoragePath;
  /** Curseur de pagination, opaque, défini par l'adapter. */
  cursor?: string;
  /** Borne souple côté adapter — pas de hard cap dans le contrat. */
  limit?: number;
};

export type ListResult = {
  folders: ReadonlyArray<StorageFolderNode>;
  files: ReadonlyArray<StorageFileNode>;
  /** null si pas de page suivante. */
  nextCursor: string | null;
};

export type GetTreeOptions = {
  path: StoragePath;
  /**
   * Profondeur maximale du sous-arbre retourné.
   * - `1` (default) : équivalent à `list` en couverture, retour structuré en arbre.
   * - `N > 1`       : descend N niveaux. La frontière `depth max` se signale
   *                   par `children: undefined` sur les folders feuilles.
   * - Borne souple recommandée : ≤ 5 sur de vrais volumes.
   */
  depth?: number;
};

export type GetTreeResult = {
  /** Le folder racine à `path`, avec ses enfants jusqu'à `depth`. */
  root: StorageFolderNode;
};

/**
 * Opération de déplacement bas-niveau, telle que comprise par un adapter.
 *
 * ⚠️ À ne pas confondre avec `StorageMoveIntent` (cf. move.intent.ts) qui
 *    est l'intention de haut niveau exprimée par l'utilisateur (avec
 *    multi-sélection, cibles par statut applicatif, etc.).
 *
 *    StorageMoveIntent     →  expression riche de l'intention (couche 3)
 *    planMoveOperations()  →  service de résolution agnostique  (couche 2)
 *    StorageMoveOperation  →  opération atomique sur un adapter  (couche 1)
 *
 * À ce niveau, on parle d'un seul item, d'un path source concret, et d'un
 * path target concret. C'est ce que l'adapter (R2, FS…) sait
 * effectivement faire dans son API native (un rename, un copy + delete…).
 */
export type StorageMoveOperation = {
  source: { type: 'file' | 'folder'; path: StoragePath };
  target: { path: StoragePath };
};

/* -------------------------------------------------------------------------- */
/*  Liste des providers supportés                                             */
/* -------------------------------------------------------------------------- */

/**
 * Liste fermée des providers de stockage actuellement supportés.
 *
 * Cette enum est dans le contrat parce que les procédures tRPC du router
 * storage ont besoin de la valider à l'input (un client ne doit pas pouvoir
 * demander un provider inconnu). Ajouter un nouveau provider demain
 * implique :
 *   1) Étendre cette enum avec sa nouvelle valeur.
 *   2) Implémenter son adapter (factory satisfaisant `StorageAdapter`).
 *   3) L'enregistrer dans le registry backend (`providerRegistry`).
 *
 * Le contrat ne dicte rien sur l'implémentation : il déclare juste quels
 * providers sont actuellement câblés.
 *
 * ─── AKFC ───────────────────────────────────────────────────────────────
 *
 * Un seul provider : R2 (Cloudflare, bucket en juridiction UE). Images, vidéos, documents : tout y est stocké ; les
 * déclinaisons (vignettes AVIF, affiches de vidéo) sont fabriquées par le
 * serveur (mediaDerivatives.service).
 */
export const storageProviderSchema = z.enum(['r2']);
export type StorageProvider = z.infer<typeof storageProviderSchema>;
