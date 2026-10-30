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
 * agnostique — sans champs d'affichage (url, kind dérivé). Ces champs sont
 * recalculés localement par les mappers ci-dessous.
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
  const name = file.name ?? fallbackName;
  const format = file.metadata?.format;

  // Le chemin EST la clé de stockage. Image : vignette 600 px ; autre fichier : l'original
  // (paramètre ignoré).
  const url = getMediaUrl(file.path, 'medium');

  return {
    id: file.path,
    name,
    path: file.path,
    type: 'file',
    mimeType: file.metadata?.mimeType,
    meta: {
      url,
      format,
      kind: kindFromFormat(format, name),
      status: file.metadata?.status,
      uploaderName: file.metadata?.uploaderName,
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
 *      On envoie une source `file` ou `folder` directe.
 *
 *   2. PLUSIEURS items (multi-sélection).
 *      On utilise `selection` avec tous les paths comme `roots`. Le backend
 *      (`planMoveOperations`) déplace chaque fichier, et chaque dossier d'un bloc,
 *      sous-dossiers compris.
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

/** La cible UI et la cible agnostique ont la même forme : un dossier concret. */
function moveOptionsToTarget(target: MoveOptions['target']): StorageMoveTarget {
  return { type: 'folder', path: target.path };
}

/* -------------------------------------------------------------------------- */
/*  L'adapter                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Adapter `FileAdapter` du finder : lecture et déplacement via le router
 * `storage` (façade `VirtualStorage`, stockage R2).
 *
 *   - `list`        : listing plat des enfants directs
 *   - `getTree`     : sous-arbre récursif (TreeView, DnD)
 *   - `getMetadata` : métadonnées d'un asset (sidebar de preview)
 *   - `moveItems`   : déplacement
 *
 * Non implémentées : `getNode` (pas d'usage UI), `delete` (corbeille dédiée).
 */
export const finderStorageAdapter: FileAdapter = {
  async list(options: ListOptions): Promise<ListResult> {
    // Le statut n'est pas un lieu : c'est une métadonnée de chaque fichier (`meta.status`).
    const { root } = await trpcClient.storage.getTree.query({
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
      path: options.path,
      depth: options.depth ?? 1,
    });

    return { root: mapStorageNodeToFinderNode(root) };
  },

  async getMetadata(path: string): Promise<FinderNodeMetadata | null> {
    const metadata = await trpcClient.storage.getMetadata.query({
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

    // Un DnD réorganise, il ne publie pas : le statut des fichiers déplacés ne change pas.
    await trpcClient.storage.move.mutate({
      intent: { source, target },
    });
  },
};