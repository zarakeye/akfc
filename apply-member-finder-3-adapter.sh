#!/usr/bin/env bash
#
# AKFC — Finder membre (b'), BRIQUE 3 : l'ADAPTATEUR membre.
#
# Un `FileAdapter` qui donne au Finder l'arbre RESTREINT du membre :
#   - à la racine VIRTUELLE (MEMBER_FINDER_ROOT) : ses groupes de plus haut
#     niveau accessibles (vrais chemins, noms conviviaux via myCollaborativeSpaces) ;
#   - sous un espace : délègue au lecteur normal (finderStorageAdapter,
#     read-guardé) PUIS injecte ses sous-groupes accessibles (vrais nœuds →
#     enfants déjà chargés, pas de spinner — même principe que le correctif B-2) ;
#   - assemblage récursif via buildSpaceNode (un getTree par espace).
#
# Source de l'arbre accessible : `storage.myCollaborativeSpaces` (déjà top-level
# + descendants, avec path + parentGroupId + name). Aucune nouvelle query.
#
# Nouveau fichier (pas d'ancre). Front NON testé → valider (brique 4 = câblage).
# Pas de migration. Perf : un getTree par espace accessible (ok pour un club).
# Usage : bash apply-member-finder-3-adapter.sh
#         AKFC_APPLY_ONLY=1 bash apply-member-finder-3-adapter.sh   (clone)
#
set -euo pipefail

ADAPTER="apps/web/src/features/finder-adapters/member/memberFinder.adapter.ts"

if [ ! -f "package.json" ]; then
  echo "ERREUR: lance depuis la racine du repo." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

mkdir -p "$(dirname "$ADAPTER")"
cat > "$ADAPTER" <<'TS'
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
TS
echo "adaptateur écrit : $ADAPTER"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(finder): adaptateur membre (racine virtuelle Mes espaces + injection des sous-groupes)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "ℹ️  Rien de visible encore — brique 4 = câbler /mes-espaces sur <Finder adapter={memberFinderAdapter} rootPath={MEMBER_FINDER_ROOT} readOnly /> + dépôt."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi