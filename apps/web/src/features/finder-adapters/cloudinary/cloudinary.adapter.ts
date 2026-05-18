import type {
  FileAdapter,
  ListOptions,
  ListResult,
  GetTreeOptions,
  GetTreeResult,
  FinderNode,
  FinderNodeMetadata,
  MoveOptions,
} from '@contracts/finder';
import { trpcClient } from '@/core/trpc/trpcClient';
import type { inferRouterOutputs, inferRouterInputs } from '@trpc/server';
import type { AppRouter } from '@backend/modules';

import { getMediaUrl, kindFromFormat } from './utils';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Type exact retourné par `storage.getTree`.
 * Chaque node est un `StorageFolderNode` ou `StorageFileNode` du contrat
 * agnostique — sans champs Cloudinary-spécifiques (url, kind dérivé). Ces
 * champs sont recalculés localement par les mappers ci-dessous.
 */
type StorageGetTreeResult = RouterOutputs['storage']['getTree'];
type StorageRootFolder = StorageGetTreeResult['root'];
type StorageNodeFromTree = NonNullable<StorageRootFolder['children']>[number];

/**
 * Type exact de l'intent de move accepté par `storage.move`.
 * Reconstitué depuis le router pour le typage des helpers de traduction.
 */
type StorageMoveIntent = RouterInputs['storage']['move']['intent'];
type StorageMoveSource = StorageMoveIntent['source'];
type StorageMoveTarget = StorageMoveIntent['target'];

/* -------------------------------------------------------------------------- */
/*  Mappers : StorageNode (agnostique) → FinderNode (UI)                      */
/* -------------------------------------------------------------------------- */

/**
 * Mappe la racine d'un `storage.getTree` vers les listes plates `folders`
 * et `files` que `list` retourne.
 *
 * Volontairement non récursif : `list` ne s'intéresse qu'aux enfants
 * directs. Pour un retour récursif structuré en arbre, utiliser
 * `mapStorageNodeToFinderNode` ci-dessous.
 */
function mapStorageTreeToFinderNodes(tree: StorageRootFolder): {
  folders: FinderNode[];
  files: FinderNode[];
} {
  const folders: FinderNode[] = [];
  const files: FinderNode[] = [];

  for (const child of tree.children ?? []) {
    if (child.type === 'folder') {
      folders.push(mapFolderShallowToFinderNode(child));
      continue;
    }

    if (child.type === 'file') {
      files.push(mapFileToFinderNode(child));
    }
  }

  return { folders, files };
}

/**
 * Version "plate" : ne descend pas dans les children, mais préserve
 * l'information `hasChildren` pour que la UI sache qu'il y a quelque
 * chose en dessous sans avoir à charger.
 */
function mapFolderShallowToFinderNode(
  folder: Extract<StorageNodeFromTree, { type: 'folder' }>,
): FinderNode {
  return {
    id: folder.path,
    name: folder.name,
    path: folder.path,
    type: 'folder',
    hasChildren: folder.hasChildren ?? (folder.children?.length ?? 0) > 0,
  };
}

/**
 * Mappe un node agnostique vers un `FinderNode`, en RÉCURSANT dans les
 * children s'ils sont présents. C'est le mapping utilisé par `getTree`.
 *
 * Logique de profondeur :
 *   - Si `node.children` est `undefined` : on est à la frontière de depth
 *     côté backend, on retourne le node sans children chargés (la TreeView
 *     saura qu'il faut un appel supplémentaire pour descendre).
 *   - Si `node.children` est `[]` : le folder est vide pour de vrai.
 *   - Si `node.children` est rempli : on récurse.
 */
function mapStorageNodeToFinderNode(
  node: StorageRootFolder | StorageNodeFromTree,
): FinderNode {
  if (node.type === 'file') {
    return mapFileToFinderNode(node);
  }

  // node.type === 'folder'
  const childrenLoaded = node.children !== undefined;
  const mappedChildren = childrenLoaded
    ? node.children!.map(mapStorageNodeToFinderNode)
    : undefined;

  return {
    id: node.path,
    name: node.name,
    path: node.path,
    type: 'folder',
    hasChildren: node.hasChildren ?? (mappedChildren?.length ?? 0) > 0,
    children: mappedChildren,
  };
}

function mapFileToFinderNode(
  file: Extract<StorageNodeFromTree, { type: 'file' }>,
): FinderNode {
  const fallbackName = file.path.split('/').pop() ?? 'file';

  return {
    id: file.path,
    name: file.name ?? fallbackName,
    path: file.path,
    type: 'file',
    meta: {
      url: getMediaUrl({ publicId: file.path }),
      format: file.metadata?.format,
      kind: kindFromFormat(file.metadata?.format, file.name ?? fallbackName),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Traduction MoveOptions (UI) → StorageMoveIntent (agnostique)              */
/* -------------------------------------------------------------------------- */

/**
 * Construit le `source` de l'intent de move à partir des items UI.
 *
 * Stratégie en deux cas :
 *
 *   1. UN SEUL item (cas dominant : DnD d'un fichier ou d'un dossier).
 *      On envoie une source `file` ou `folder` directe. Pour un dossier,
 *      l'adapter Cloudinary backend pourra alors utiliser un rename
 *      récursif natif (un seul appel API), au lieu d'expanser en N
 *      fichiers individuels.
 *
 *   2. PLUSIEURS items (multi-sélection).
 *      On utilise `selection` avec tous les paths comme `roots`. Le
 *      backend `resolveMoveIntent` expansera chaque root selon son type
 *      (file pris tel quel, folder listé récursivement). On perd
 *      l'optimisation folder-rename pour les sous-folders contenus dans
 *      la sélection, mais c'est inhérent à la sémantique multi-items.
 */
function moveOptionsToSource(items: MoveOptions['items']): StorageMoveSource {
  if (items.length === 1) {
    const only = items[0];
    return { type: only.type, path: only.path };
  }

  return {
    type: 'selection',
    roots: items.map((it) => it.path),
  };
}

/**
 * Traduit la `MoveTarget` UI (discriminée par `type`) vers la
 * `StorageMoveTarget` agnostique. Le parallélisme structurel des deux
 * unions rend la traduction triviale — un simple narrowing par
 * discriminant.
 */
function moveOptionsToTarget(target: MoveOptions['target']): StorageMoveTarget {
  if (target.type === 'folder') {
    return { type: 'folder', path: target.path };
  }
  // target.type === 'status-folder'
  return { type: 'status-folder', status: target.status };
}

/* -------------------------------------------------------------------------- */
/*  L'adapter                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Adapter Cloudinary pour le finder générique.
 *
 * Implémente le contrat `FileAdapter` de `@contracts/finder` en s'appuyant
 * sur le router agnostique `storage.*` avec `provider: 'cloudinary'`. Toute
 * logique Cloudinary-spécifique côté UI (reconstruction d'URL, déduction
 * du kind depuis le format) est concentrée dans `./utils.ts`.
 *
 * ─── Méthodes implémentées ─────────────────────────────────────────────────
 *
 *   - `list`        : listing plat des enfants directs d'un dossier.
 *   - `getTree`     : sous-arbre récursif jusqu'à `depth` (TreeView, DnD).
 *   - `getMetadata` : métadonnées riches d'un asset (sidebar de preview).
 *   - `moveItems`   : déplacement d'un ou plusieurs items, avec cibles
 *                     concrètes (`folder`) ou applicatives (`status-folder`).
 *
 * Méthodes non implémentées :
 *
 *   - `getNode`     : non implémentée à ce chantier — l'usage UI n'en a
 *                     pas encore besoin et ça évite un round-trip de plus.
 *                     Sera ajoutée si un cas d'usage le demande.
 *   - `delete`      : reportée au chantier "corbeille agnostique" qui
 *                     décidera de la sémantique du soft-delete agnostique.
 */
export const cloudinaryAdapter: FileAdapter = {
  async list(options: ListOptions): Promise<ListResult> {
    const { root } = await trpcClient.storage.getTree.query({
      provider: 'cloudinary',
      path: options.path,
      depth: 1,
    });

    const { folders, files } = mapStorageTreeToFinderNodes(root);

    return {
      folders,
      files,
      nextCursor: null,
    };
  },

  async getTree(options: GetTreeOptions): Promise<GetTreeResult> {
    const { root } = await trpcClient.storage.getTree.query({
      provider: 'cloudinary',
      path: options.path,
      depth: options.depth ?? 1,
    });

    return { root: mapStorageNodeToFinderNode(root) };
  },

  async getMetadata(path: string): Promise<FinderNodeMetadata | null> {
    const metadata = await trpcClient.storage.getMetadata.query({
      provider: 'cloudinary',
      path,
    });

    // Le contrat agnostique `StorageMetadata` et `FinderNodeMetadata` ont
    // exactement la même forme — on peut renvoyer tel quel, c'est un
    // passe-plat assumé. Si un jour les deux divergent, c'est ici qu'on
    // ajoutera le mapping explicite.
    return metadata;
  },

  async moveItems(options: MoveOptions): Promise<void> {
    const source = moveOptionsToSource(options.items);
    const target = moveOptionsToTarget(options.target);

    await trpcClient.storage.move.mutate({
      provider: 'cloudinary',
      intent: { source, target },
    });
  },
};