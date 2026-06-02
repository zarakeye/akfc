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
import { pickBackendByExtension } from '@contracts/storage';
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
  const name = file.name ?? fallbackName;
  const format = file.metadata?.format;

  // ─── Dispatch backend pour la preview ──────────────────────────────────
  //
  // Le contrat `StorageNode` ne transporte pas le provider d'origine — c'est
  // intentionnel (l'UI doit être agnostique au backend). Mais pour calculer
  // l'URL de preview, on a besoin de savoir si le fichier est sur Cloudinary
  // (proxy `/api/media/by-public-id/...`) ou sur R2 (proxy `/api/media/r2/...`).
  //
  // On déduit le provider via `pickBackendByExtension` — mêmes règles que
  // le dispatch d'upload :
  //   - image/* + video/*  → Cloudinary (URL transformée)
  //   - tout le reste      → R2 (URL via proxy presigned GET)
  //
  // ⚠️ Subtilité Cloudinary : les `name` issus de Cloudinary n'ont PAS
  // d'extension (Cloudinary stocke le format séparément, exposé via
  // `metadata.format` = "jpg", "mp4", etc.). Sans extension dans le nom,
  // `pickBackendByExtension` fallback systématiquement sur R2, ce qui
  // génère une URL proxy R2 fausse pour les fichiers Cloudinary →
  // plus de thumbnail/preview/vidéo qui marche.
  //
  // Solution : on construit un "nom virtuel avec extension" pour le
  // dispatch quand on dispose d'un `format` explicite. L'`name` réel
  // affiché à l'UI reste inchangé.
  //
  // L'encodage du path pour le proxy R2 doit préserver les '/' structurels
  // (les segments sont des dossiers virtuels), donc on encode segment par
  // segment.

  const nameForDispatch =
    format && !name.toLowerCase().endsWith(`.${format.toLowerCase()}`)
      ? `${name}.${format}`
      : name;
  const backend = pickBackendByExtension(nameForDispatch);

  const url =
    backend === 'cloudinary'
      ? getMediaUrl({ publicId: file.path })
      : `/api/media/r2/${file.path.split('/').map(encodeURIComponent).join('/')}`;

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
 * Adapter `FileAdapter` pour le finder agnostique — **multi-backend en lecture**.
 *
 * Le nom `cloudinaryAdapter` est historique : à l'origine il appelait
 * uniquement Cloudinary. Depuis 6.C, les méthodes de lecture passent par
 * la façade `VirtualStorage` côté backend (interrogation parallèle de
 * Cloudinary ET R2, fusion des résultats) — l'UI voit donc les items des
 * deux backends mélangés, transparent.
 *
 * Côté `moveItems`, on reste sur `provider: 'cloudinary'` explicite —
 * les mutations multi-backend sont un chantier distinct (la sémantique
 * "move un dossier qui contient des items des deux backends" demande sa
 * propre orchestration).
 *
 * ─── Détection du backend pour la preview ─────────────────────────────────
 *
 * Le contrat `StorageNode` ne transporte pas le provider d'origine. Pour
 * calculer l'URL de preview, on déduit le backend depuis l'extension
 * du nom de fichier via `pickBackendByExtension` — cohérent avec la règle
 * de dispatch d'upload (image/video → Cloudinary, reste → R2).
 *
 * ─── Méthodes implémentées ─────────────────────────────────────────────────
 *
 *   - `list`        : listing plat des enfants directs (Cloudinary + R2)
 *   - `getTree`     : sous-arbre récursif (TreeView, DnD) (Cloudinary + R2)
 *   - `getMetadata` : métadonnées d'un asset (sidebar de preview)
 *   - `moveItems`   : déplacement Cloudinary uniquement à ce stade
 *
 * Méthodes non implémentées :
 *
 *   - `getNode`     : non implémentée à ce chantier — l'usage UI n'en a
 *                     pas encore besoin et ça évite un round-trip de plus.
 *   - `delete`      : reportée au chantier "corbeille agnostique".
 */
export const cloudinaryAdapter: FileAdapter = {
  async list(options: ListOptions): Promise<ListResult> {
    // `provider` absent → le router utilise `VirtualStorage` qui interroge
    // Cloudinary ET R2 puis fusionne les résultats. Le finder voit donc
    // les items des deux backends mélangés, transparent pour l'UI.
    const { root } = await trpcClient.storage.getTree.query({
      path: options.path,
      depth: 1,
    });

    const { folders, files } = mapStorageTreeToFinderNodes(root);

     console.log('[cloudinaryAdapter.list]', { path: options.path, folderCount: folders.length, fileCount: files.length, files });

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

    // Move reste explicite sur Cloudinary pour l'instant — les items R2
    // ne sont pas encore manipulables depuis le finder (cf. 6.C.2 pour
    // les uploads R2 + 6.C.3+ pour les mutations multi-backend).
    await trpcClient.storage.move.mutate({
      provider: 'cloudinary',
      intent: { source, target },
    });
  },
};