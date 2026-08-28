#!/usr/bin/env bash
#
# AKFC — Finder : nom EXACT des dossiers d'espace de groupe (accents inclus).
#
# Remplace, dans le listing, le segment technique `<slug>-<cuid>` par le nom
# RÉEL du groupe en base (`memberGroup.name`). Le CHEMIN reste inchangé (identité
# de stockage) ; seul le `name` affiché change → toutes les vues (grille, table,
# compacte, arbre, picker) montrent « Administrateurs », « Comité Directeur »…
# Le `friendlySpaceFolderLabel` du front devient un no-op (plus de cuid dans le
# nom). Robuste à un groupe renommé (clé = cuid, stable).
#
# IMPORTANT : le finder (adapter Cloudinary → picker) lit via `getTree`, PAS
# `storage.list`. On branche donc `getTree` (ce qui corrige réellement l'UI) ET
# `list` (cohérence pour d'éventuels autres appelants).
#
# 1 fichier neuf (service) + 3 ancrages sur router.ts (import, branche `list`,
# `getTree`) — ancrés sur TON code actuel (pasté). Backend seul, typecheck backend.
#
# Prérequis : fix-finder-empty-group-spaces appliqué (le service `mergeGroupSpaceFolders`
# est importé dans le router — sert d'ancre à l'import).
#
# Usage : bash fix-finder-space-exact-names.sh
#         AKFC_APPLY_ONLY=1 bash fix-finder-space-exact-names.sh   (clone)
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

# ── 1. Service ───────────────────────────────────────────────────────────────
cat > "$SVC" <<'TS'
import type { PrismaClient } from "@prisma/client";

import type { StorageFolderNode, StorageNode } from "@contracts/storage";

/**
 * Renomme les dossiers d'ESPACE DE GROUPE avec le nom EXACT du groupe en base
 * (accents/casse d'origine), au lieu du segment technique `<slug>-<cuid>`.
 *
 * Le CHEMIN reste intact (`…/groups/<slug>-<cuid>` = identité de stockage) ;
 * seul le `name` affiché change. Clé = cuid, stable même si le groupe est
 * renommé (le slug du chemin peut être périmé, le nom retourné reste courant).
 *
 * Appliqué côté listing (`getTree` + `list`) : toutes les vues du finder en
 * profitent, et `friendlySpaceFolderLabel` (front) devient un no-op.
 *
 * Ne couvre QUE les espaces de groupe ; les espaces perso gardent le repli
 * front (à étendre avec une map userId → nom si besoin).
 */

const GROUP_SPACE_RE = /\/groups\/[^/]+-(c[a-z0-9]{24})$/;

function hasGroupSpace(node: StorageNode): boolean {
  if (node.type === "folder") {
    if (GROUP_SPACE_RE.test(node.path)) return true;
    return (node.children ?? []).some(hasGroupSpace);
  }
  return false;
}

async function groupNameByCuid(
  prisma: PrismaClient,
): Promise<Map<string, string>> {
  const groups = await prisma.memberGroup.findMany({
    select: { id: true, name: true },
  });
  return new Map(groups.map((g) => [g.id, g.name] as const));
}

function renamed(
  node: StorageFolderNode,
  names: Map<string, string>,
): StorageFolderNode {
  const m = node.path.match(GROUP_SPACE_RE);
  if (!m) return node;
  const exact = names.get(m[1]);
  return exact ? { ...node, name: exact } : node;
}

/** Renomme les dossiers de groupe d'une liste plate (résultat de `list`). */
export async function applyGroupSpaceNamesToFolders(
  folders: ReadonlyArray<StorageFolderNode>,
  prisma: PrismaClient,
): Promise<StorageFolderNode[]> {
  if (!folders.some((f) => GROUP_SPACE_RE.test(f.path))) return [...folders];
  const names = await groupNameByCuid(prisma);
  return folders.map((f) => renamed(f, names));
}

/** Renomme récursivement les dossiers de groupe d'un arbre (résultat de `getTree`). */
export async function applyGroupSpaceNamesToTree(
  root: StorageFolderNode,
  prisma: PrismaClient,
): Promise<StorageFolderNode> {
  if (!hasGroupSpace(root)) return root;
  const names = await groupNameByCuid(prisma);
  const walk = (node: StorageNode): StorageNode => {
    if (node.type !== "folder") return node;
    const r = renamed(node, names);
    if (!node.children) return r;
    return { ...r, children: node.children.map(walk) };
  };
  return walk(root) as StorageFolderNode;
}
TS
echo "écrit  $SVC"

# ── 2. Câblage router (ancré sur ton code actuel) ────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "applyGroupSpaceNames" in s:
    print("router déjà câblé (noms exacts)"); sys.exit(0)

# 2a. import (après celui de mergeGroupSpaceFolders)
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

# 2b. branche `list` (renomme les dossiers du résultat mergé)
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

# 2c. getTree (renomme l'arbre — c'est ce que lit réellement le finder)
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
    "      // Nom EXACT des dossiers d'espace de groupe (accents) — c'est getTree\n"
    "      // que lit l'adapter du finder (et le picker).\n"
    "      return {\n"
    "        ...result,\n"
    "        root: await applyGroupSpaceNamesToTree(result.root, ctx.prisma),\n"
    "      };\n"
    "    }),\n"
)
s = s.replace(tree_old, tree_new)

p.write_text(s, encoding="utf-8")
print("router câblé (noms exacts sur list + getTree)")
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
git commit -m "fix(finder): nom exact (accents) des dossiers d'espace de groupe dans toutes les vues" \
  && echo "commit $(git rev-parse --short HEAD)"