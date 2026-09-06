#!/usr/bin/env bash
#
# AKFC — FINDER, LOT C : racines principales visibles MÊME VIDES (point 2).
#
# Cloudinary/R2 n'ont pas de vrais dossiers vides → une racine sans contenu
# s'évapore du listing. On injecte les racines qui REÇOIVENT le contenu, dans
# l'arbre (getTree) ET la grille (list à la racine) :
#   courses (via categoryStorageSegment), seminars, events, personal-spaces,
#   collaborative-group-spaces, common-repository.
# L'affichage humain est résolu ensuite par les FolderLabel (inc 4) — on pose
# ici le chemin physique EN, les libellés « Stages »/« Cours »/… s'appliquent.
#
# PRÉREQUIS : inc 3 (categoryStorageSegment.ts). Périmètre : BACKEND. Un typecheck.
# Usage : bash apply-finder-C-empty-roots.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
NEW="packages/backend/src/modules/storage/ensureContentRoots.service.ts"
DEP="packages/backend/src/modules/cloudinary/services/categoryStorageSegment.ts"
[ -f "$DEP" ] || { echo "ERREUR: inc 3 requis d'abord (categoryStorageSegment.ts absent)." >&2; exit 1; }
if [ -f "$NEW" ]; then echo "— déjà appliqué (ensureContentRoots.service.ts existe)"; exit 0; fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

cat > "$NEW" <<'EOF'
import type { PrismaClient } from "@prisma/client";
import type { StorageFolderNode } from "@contracts/storage";
import { categoryStorageSegment } from "@backend/modules/cloudinary/services/categoryStorageSegment";

/**
 * Racines principales du finder — celles qui REÇOIVENT le contenu — qui doivent
 * apparaître dès le premier rendu, même vides (Cloudinary/R2 n'ont pas de vrais
 * dossiers vides). Chemin physique EN ; l'affichage humain est résolu ensuite
 * par les FolderLabel (applyGroupSpaceNames).
 */
async function requiredRootPaths(
  prisma: PrismaClient,
  appRoot: string,
): Promise<string[]> {
  const categories = await prisma.category.findMany({ select: { type: true } });
  return [
    ...categories.map((c) => `${appRoot}/${categoryStorageSegment(c.type)}`),
    `${appRoot}/seminars`,
    `${appRoot}/events`,
    `${appRoot}/personal-spaces`,
    `${appRoot}/collaborative-group-spaces`,
    `${appRoot}/common-repository`,
  ];
}

function emptyRootNode(path: string): StorageFolderNode {
  return {
    type: "folder",
    name: path.slice(path.lastIndexOf("/") + 1),
    path,
    hasChildren: false,
    children: [],
  };
}

/** getTree : complète les enfants directs de la racine avec celles qui manquent. */
export async function ensureContentRootsInTree(
  root: StorageFolderNode,
  prisma: PrismaClient,
  appRoot: string,
): Promise<StorageFolderNode> {
  const required = await requiredRootPaths(prisma, appRoot);
  const present = new Set((root.children ?? []).map((c) => c.path));
  const missing = required.filter((p) => !present.has(p)).map(emptyRootNode);
  if (missing.length === 0) return root;
  return {
    ...root,
    hasChildren: true,
    children: [...(root.children ?? []), ...missing],
  };
}

/** list à la racine : les dossiers des racines manquantes parmi `existingPaths`. */
export async function missingContentRootFolders(
  existingPaths: ReadonlyArray<string>,
  prisma: PrismaClient,
  appRoot: string,
): Promise<StorageFolderNode[]> {
  const required = await requiredRootPaths(prisma, appRoot);
  const present = new Set(existingPaths);
  return required.filter((p) => !present.has(p)).map(emptyRootNode);
}
EOF
echo "  créé  $NEW"

python3 - <<'PY'
import pathlib
R = "packages/backend/src/modules/storage/router.ts"
s = pathlib.Path(R).read_text(encoding="utf-8")

def sub(old, new, label):
    global s
    n = s.count(old)
    assert n == 1, f"ancre {label} : attendu 1, trouvé {n}"
    s = s.replace(old, new)

# 1) import du service
sub(
    'import {\n'
    '  mergeGroupSpaceFolders,\n'
    '  mergeGroupSpaceFoldersIntoTree,\n'
    '} from "@backend/modules/storage/mergeGroupSpaceFolders.service";',
    'import {\n'
    '  mergeGroupSpaceFolders,\n'
    '  mergeGroupSpaceFoldersIntoTree,\n'
    '} from "@backend/modules/storage/mergeGroupSpaceFolders.service";\n'
    'import {\n'
    '  ensureContentRootsInTree,\n'
    '  missingContentRootFolders,\n'
    '} from "@backend/modules/storage/ensureContentRoots.service";',
    "import service",
)

# 2) getTree : injecter après mergeGroupSpaceFoldersIntoTree
sub(
    '''      result.root = await mergeGroupSpaceFoldersIntoTree({
        root: result.root,
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
        userId: ctx.user.id,
      });
''',
    '''      result.root = await mergeGroupSpaceFoldersIntoTree({
        root: result.root,
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
        userId: ctx.user.id,
      });
      // Racines principales visibles même vides (courses/seminars/events/
      // personal-spaces/collaborative-group-spaces/common-repository).
      result.root = await ensureContentRootsInTree(
        result.root,
        ctx.prisma,
        ctx.appRoot,
      );
''',
    "getTree inject",
)

# 3) list : brancher la racine juste avant `return result;` final
sub(
    '''        return {
          ...merged,
          folders: await applyGroupSpaceNamesToFolders(
            merged.folders,
            ctx.prisma,
          ),
        };
      }
      return result;
    }),''',
    '''        return {
          ...merged,
          folders: await applyGroupSpaceNamesToFolders(
            merged.folders,
            ctx.prisma,
          ),
        };
      }
      // Racine du finder : racines principales visibles même vides (grille).
      if (input.path === ctx.appRoot) {
        const missing = await missingContentRootFolders(
          result.folders.map((f) => f.path),
          ctx.prisma,
          ctx.appRoot,
        );
        return {
          ...result,
          folders: await applyGroupSpaceNamesToFolders(
            [...result.folders, ...missing],
            ctx.prisma,
          ),
        };
      }
      return result;
    }),''',
    "list inject",
)

pathlib.Path(R).write_text(s, encoding="utf-8")
print("Lot C appliqué au router.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
if git commit -m "feat(finder): racines principales visibles même vides (arbre + grille)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "→ Pense à: pnpm clean puis relance le dev."
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi