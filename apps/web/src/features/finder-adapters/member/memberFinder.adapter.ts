import type {
  FileAdapter,
  FinderNode,
  ListOptions,
  ListResult,
  GetTreeOptions,
  GetTreeResult,
} from "@contracts/finder";

import { trpcClient } from "@/core/trpc/trpcClient";
import { finderStorageAdapter } from "@features/finder-adapters/cloudinary/finderStorage.adapter";

/**
 * Racine VIRTUELLE du finder membre. Ce n'est pas un chemin physique : à cet
 * emplacement, l'adaptateur renvoie les groupes de plus haut niveau accessibles.
 */
export const MEMBER_FINDER_ROOT = "__mes-espaces__";

type Space = Awaited<
  ReturnType<typeof trpcClient.storage.myCollaborativeSpaces.query>
>[number];

/** Nœud d'espace (dossier de groupe) affiché avec son nom convivial. */
function spaceNode(space: Space, children?: FinderNode[]): FinderNode {
  return {
    id: space.path,
    name: space.name,
    path: space.path,
    type: "folder",
    hasChildren: true,
    ...(children ? { children } : {}),
  };
}

function pathByGroupIdOf(spaces: Space[]): Map<string, string> {
  return new Map(spaces.map((s) => [s.groupId, s.path]));
}

/** Espaces de plus haut niveau (racines) : parent absent ou hors périmètre. */
function rootSpaces(spaces: Space[]): Space[] {
  const byId = pathByGroupIdOf(spaces);
  return spaces.filter((s) => !s.parentGroupId || !byId.has(s.parentGroupId));
}

/** Espaces enfants directs d'un chemin d'espace donné. */
function childSpacesOf(spaces: Space[], parentPath: string): Space[] {
  const byId = pathByGroupIdOf(spaces);
  return spaces.filter(
    (s) => s.parentGroupId && byId.get(s.parentGroupId) === parentPath,
  );
}

/**
 * Sous-arbre complet d'un espace : son contenu PHYSIQUE (lecteur normal,
 * read-guardé) + ses sous-groupes accessibles (récursif). Les nœuds sont RÉELS
 * (chemins physiques), donc navigables et sans spinner.
 */
async function buildSpaceNode(
  space: Space,
  spaces: Space[],
  depth?: number,
): Promise<FinderNode> {
  const base = await finderStorageAdapter.getTree!({ path: space.path, depth });
  const physicalChildren = base.root.children ?? [];
  const childNodes = await Promise.all(
    childSpacesOf(spaces, space.path).map((cs) =>
      buildSpaceNode(cs, spaces, depth),
    ),
  );
  const children = [...physicalChildren, ...childNodes];
  return {
    ...base.root,
    name: space.name,
    hasChildren: children.length > 0,
    children,
  };
}

export const memberFinderAdapter: FileAdapter = {
  async list(options: ListOptions): Promise<ListResult> {
    const spaces = await trpcClient.storage.myCollaborativeSpaces.query();

    if (options.path === MEMBER_FINDER_ROOT) {
      return {
        folders: rootSpaces(spaces).map((s) => spaceNode(s)),
        files: [],
        nextCursor: null,
      };
    }

    const base = await finderStorageAdapter.list(options);
    const childFolders = childSpacesOf(spaces, options.path).map((s) =>
      spaceNode(s),
    );
    return { ...base, folders: [...base.folders, ...childFolders] };
  },

  async getTree(options: GetTreeOptions): Promise<GetTreeResult> {
    const spaces = await trpcClient.storage.myCollaborativeSpaces.query();

    if (options.path === MEMBER_FINDER_ROOT) {
      const children = await Promise.all(
        rootSpaces(spaces).map((s) => buildSpaceNode(s, spaces, options.depth)),
      );
      return {
        root: {
          id: MEMBER_FINDER_ROOT,
          name: "Mes espaces",
          path: MEMBER_FINDER_ROOT,
          type: "folder",
          hasChildren: children.length > 0,
          children,
        },
      };
    }

    const space = spaces.find((s) => s.path === options.path);
    if (space) {
      return { root: await buildSpaceNode(space, spaces, options.depth) };
    }

    // Chemin sous un espace (sous-dossier ordinaire) : contenu physique seul.
    return finderStorageAdapter.getTree!(options);
  },

  async getNode(path: string): Promise<FinderNode | null> {
    if (path === MEMBER_FINDER_ROOT) {
      return {
        id: MEMBER_FINDER_ROOT,
        name: "Mes espaces",
        path: MEMBER_FINDER_ROOT,
        type: "folder",
        hasChildren: true,
      };
    }
    return finderStorageAdapter.getNode
      ? finderStorageAdapter.getNode(path)
      : null;
  },
};
