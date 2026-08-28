#!/usr/bin/env bash
#
# AKFC — Découplage nom/libellé, R3 : résolution du libellé dans le listing.
#
# Chaîne de priorité pour le NOM AFFICHÉ d'un dossier :
#   1. FolderLabel[path]        (override explicite, R2)
#   2. memberGroup.name         (espace de groupe)
#   3. nom brut                 (repli ; le front title-case le slug)
#
# On FUSIONNE ça dans `applyGroupSpaceNames.service.ts` : mêmes noms de fonctions
# et mêmes signatures → si le router les appelle déjà (via fix-finder-space-exact-names),
# rien à changer côté router ; sinon, ce script les câble aussi (list + getTree).
# Marche donc dans les deux cas.
#
# Prérequis : R2 appliqué ET migré (le client Prisma connaît `folderLabel`).
# Backend seul, typecheck backend. Pas de migration.
#
# Usage : bash apply-r3-folder-label-resolution.sh
#         AKFC_APPLY_ONLY=1 bash apply-r3-folder-label-resolution.sh   (clone)
#
set -euo pipefail

SVC="packages/backend/src/modules/storage/applyGroupSpaceNames.service.ts"
ROUTER="packages/backend/src/modules/storage/router.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$ROUTER" ]      || { echo "ERREUR: $ROUTER introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Service : chaîne FolderLabel > nom de groupe > repli ──────────────────
cat > "$SVC" <<'TS'
import type { PrismaClient } from "@prisma/client";

import type { StorageFolderNode, StorageNode } from "@contracts/storage";

/**
 * Résout le NOM AFFICHÉ des dossiers dans le listing, sans jamais toucher au
 * chemin (identité de stockage). Priorité :
 *
 *   1. FolderLabel[path]   — libellé explicite édité par un admin (découplage).
 *   2. memberGroup.name    — pour un espace de groupe `…/groups/<slug>-<cuid>`.
 *   3. nom brut            — repli ; le front title-case le slug si besoin.
 *
 * Appliqué côté `list` (liste plate) et `getTree` (récursif) → toutes les vues
 * du finder et le picker en profitent.
 */

const GROUP_SPACE_RE = /\/groups\/[^/]+-(c[a-z0-9]{24})$/;

type NameMaps = {
  labelByPath: Map<string, string>;
  groupNameByCuid: Map<string, string>;
};

function treeHasGroupSpace(node: StorageNode): boolean {
  if (node.type !== "folder") return false;
  if (GROUP_SPACE_RE.test(node.path)) return true;
  return (node.children ?? []).some(treeHasGroupSpace);
}

async function loadNameMaps(
  prisma: PrismaClient,
  needGroups: boolean,
): Promise<NameMaps> {
  const [labels, groups] = await Promise.all([
    prisma.folderLabel.findMany({ select: { path: true, displayName: true } }),
    needGroups
      ? prisma.memberGroup.findMany({ select: { id: true, name: true } })
      : Promise.resolve([] as { id: string; name: string }[]),
  ]);
  return {
    labelByPath: new Map(labels.map((l) => [l.path, l.displayName] as const)),
    groupNameByCuid: new Map(groups.map((g) => [g.id, g.name] as const)),
  };
}

function displayNameFor(node: StorageFolderNode, maps: NameMaps): string {
  const label = maps.labelByPath.get(node.path);
  if (label) return label;
  const m = node.path.match(GROUP_SPACE_RE);
  if (m) {
    const g = maps.groupNameByCuid.get(m[1]);
    if (g) return g;
  }
  return node.name;
}

/** Résout les libellés d'une liste plate (résultat de `list`). */
export async function applyGroupSpaceNamesToFolders(
  folders: ReadonlyArray<StorageFolderNode>,
  prisma: PrismaClient,
): Promise<StorageFolderNode[]> {
  const maps = await loadNameMaps(
    prisma,
    folders.some((f) => GROUP_SPACE_RE.test(f.path)),
  );
  if (maps.labelByPath.size === 0 && maps.groupNameByCuid.size === 0) {
    return [...folders];
  }
  return folders.map((f) => {
    const name = displayNameFor(f, maps);
    return name === f.name ? f : { ...f, name };
  });
}

/** Résout récursivement les libellés d'un arbre (résultat de `getTree`). */
export async function applyGroupSpaceNamesToTree(
  root: StorageFolderNode,
  prisma: PrismaClient,
): Promise<StorageFolderNode> {
  const maps = await loadNameMaps(prisma, treeHasGroupSpace(root));
  if (maps.labelByPath.size === 0 && maps.groupNameByCuid.size === 0) {
    return root;
  }
  const walk = (node: StorageNode): StorageNode => {
    if (node.type !== "folder") return node;
    const name = displayNameFor(node, maps);
    const r = name === node.name ? node : { ...node, name };
    if (!node.children) return r;
    return { ...r, children: node.children.map(walk) };
  };
  return walk(root) as StorageFolderNode;
}
TS
echo "écrit  $SVC"

# ── 2. Router : câbler SI pas déjà fait (exact-names non appliqué) ───────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "applyGroupSpaceNames" in s:
    print("router appelle déjà le service — service réécrit, rien à câbler"); sys.exit(0)

# import (après mergeGroupSpaceFolders, présent depuis fix-finder-empty-group-spaces)
imp_anchor = 'import { mergeGroupSpaceFolders } from "@backend/modules/storage/mergeGroupSpaceFolders.service";\n'
assert s.count(imp_anchor) == 1, "ancre import mergeGroupSpaceFolders introuvable/multiple"
s = s.replace(
    imp_anchor,
    imp_anchor
    + 'import {\n'
    + '  applyGroupSpaceNamesToFolders,\n'
    + '  applyGroupSpaceNamesToTree,\n'
    + '} from "@backend/modules/storage/applyGroupSpaceNames.service";\n',
)

# branche list (renomme le résultat mergé)
list_old = (
    "      if (input.path === `${ctx.appRoot}/groups`) {\n"
    "        return mergeGroupSpaceFolders({\n"
    "          result,\n"
    "          prisma: ctx.prisma,\n"
    "          appRoot: ctx.appRoot,\n"
    "          userId: ctx.user.id,\n"
    "        });\n"
    "      }\n"
)
assert s.count(list_old) == 1, "ancre branche list introuvable/multiple"
list_new = (
    "      if (input.path === `${ctx.appRoot}/groups`) {\n"
    "        const merged = await mergeGroupSpaceFolders({\n"
    "          result,\n"
    "          prisma: ctx.prisma,\n"
    "          appRoot: ctx.appRoot,\n"
    "          userId: ctx.user.id,\n"
    "        });\n"
    "        return {\n"
    "          ...merged,\n"
    "          folders: await applyGroupSpaceNamesToFolders(\n"
    "            merged.folders,\n"
    "            ctx.prisma,\n"
    "          ),\n"
    "        };\n"
    "      }\n"
)
s = s.replace(list_old, list_new)

# getTree
tree_old = (
    "      const result = await reader.getTree({\n"
    "        path: input.path,\n"
    "        depth: input.depth,\n"
    "      });\n"
    "      await enrichTreeWithStatus(ctx.prisma, ctx.appRoot, result.root);\n"
    "      return result;\n"
    "    }),\n"
)
assert s.count(tree_old) == 1, "ancre getTree introuvable/multiple"
tree_new = (
    "      const result = await reader.getTree({\n"
    "        path: input.path,\n"
    "        depth: input.depth,\n"
    "      });\n"
    "      await enrichTreeWithStatus(ctx.prisma, ctx.appRoot, result.root);\n"
    "      return {\n"
    "        ...result,\n"
    "        root: await applyGroupSpaceNamesToTree(result.root, ctx.prisma),\n"
    "      };\n"
    "    }),\n"
)
s = s.replace(tree_old, tree_new)

p.write_text(s, encoding="utf-8")
print("router câblé (list + getTree appellent le service)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(storage): résolution du libellé de dossier (FolderLabel > nom de groupe > repli) dans le listing" \
  && echo "commit $(git rev-parse --short HEAD)"