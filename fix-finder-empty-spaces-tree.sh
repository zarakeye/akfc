#!/usr/bin/env bash
#
# AKFC — Finder : espaces de GROUPE et PERSO visibles même VIDES (via getTree).
#
# Étend le fix précédent (groupes) aux espaces PERSO. Cloudinary/R2 n'ont pas de
# vrais dossiers → un espace vidé de son dernier fichier disparaît du finder,
# alors que le groupe / l'utilisateur existe toujours. On réinjecte :
#   - dans le nœud conteneur `groups` : les espaces des groupes collaboratifs
#     visibles (admin → tous ; membre → les siens) ;
#   - dans le nœud conteneur `persos` : l'espace perso de l'utilisateur courant
#     (`resolvePersoBaseFolder(userId)` — un admin n'a que le sien).
#
# Le service est réécrit (list groupes inchangé ; variante arbre = les deux
# conteneurs). La fonction garde son nom `mergeGroupSpaceFoldersIntoTree`, donc
# si le câblage getTree existe déjà (fix précédent appliqué), rien à recâbler ;
# sinon on le câble (réassignation de result.root après enrichTreeWithStatus).
#
# Remplace fix-finder-empty-group-spaces-tree.sh. Prérequis : fix-finder-empty-
# group-spaces (le service + son import list existent). Backend seul, typecheck.
#
# Usage : bash fix-finder-empty-spaces-tree.sh
#         AKFC_APPLY_ONLY=1 bash fix-finder-empty-spaces-tree.sh   (clone)
#
set -euo pipefail

SVC="packages/backend/src/modules/storage/mergeGroupSpaceFolders.service.ts"
ROUTER="packages/backend/src/modules/storage/router.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$ROUTER" ]      || { echo "ERREUR: $ROUTER introuvable." >&2; exit 1; }
[ -f "$SVC" ]         || { echo "ERREUR: $SVC introuvable (applique d'abord fix-finder-empty-group-spaces)." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Service (groupes + persos) ────────────────────────────────────────────
cat > "$SVC" <<'TS'
import type { PrismaClient } from "@prisma/client";

import type {
  ListResult,
  StorageFolderNode,
  StorageNode,
} from "@contracts/storage";

import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";
import { resolvePersoBaseFolder } from "@backend/modules/media/services/resolvePersoBaseFolder.service";
import { collaborativeEntriesForMember } from "@backend/modules/memberGroups/collaborativeEntriesForMember.service";

/**
 * Espaces de groupe ET perso visibles même VIDES.
 *
 * Cloudinary/R2 n'ont pas de vrais dossiers : un espace sans asset s'évapore du
 * listing, alors que le groupe / l'utilisateur existe toujours. On réinjecte
 * les espaces connus. Deux points : `list` (groupes, liste plate) et `getTree`
 * (groupes + persos, arbre lu par le finder).
 *
 * Dédup par le suffixe STABLE `-<id>` (robuste au renommage). Le physique prime.
 */

async function collaborativeGroupIds(
  prisma: PrismaClient,
  userId: string,
): Promise<string[]> {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  const isAdmin = me?.role?.name === "ADMIN";
  return isAdmin
    ? (
        await prisma.memberGroup.findMany({
          where: { isCollaborative: true },
          select: { id: true },
        })
      ).map((g) => g.id)
    : (await collaborativeEntriesForMember(prisma, userId)).map((e) => e.groupId);
}

function folderNode(path: string): StorageFolderNode {
  return {
    type: "folder",
    name: path.slice(path.lastIndexOf("/") + 1),
    path,
    hasChildren: false,
  };
}

/** Espaces de GROUPE manquants parmi `existingPaths`. */
async function missingGroupSpaceFolders(params: {
  existingPaths: ReadonlyArray<string>;
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<StorageFolderNode[]> {
  const { existingPaths, prisma, appRoot, userId } = params;
  const groupIds = await collaborativeGroupIds(prisma, userId);
  const extra: StorageFolderNode[] = [];
  for (const groupId of groupIds) {
    if (existingPaths.some((p) => p.endsWith(`-${groupId}`))) continue;
    try {
      extra.push(folderNode(await resolveGroupBaseFolder({ prisma, appRoot, groupId })));
    } catch {
      // groupe disparu entre deux requêtes : ignoré.
    }
  }
  return extra;
}

/** Espace PERSO de l'utilisateur courant, s'il manque. */
async function missingPersoSpaceFolders(params: {
  existingPaths: ReadonlyArray<string>;
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<StorageFolderNode[]> {
  const { existingPaths, prisma, appRoot, userId } = params;
  if (existingPaths.some((p) => p.endsWith(`-${userId}`))) return [];
  try {
    return [folderNode(await resolvePersoBaseFolder({ prisma, appRoot, userId }))];
  } catch {
    return [];
  }
}

/** Variante `list` : groupes uniquement (le finder n'utilise pas `list`). */
export async function mergeGroupSpaceFolders(params: {
  result: ListResult;
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<ListResult> {
  const { result, prisma, appRoot, userId } = params;
  const extra = await missingGroupSpaceFolders({
    existingPaths: result.folders.map((f) => f.path),
    prisma,
    appRoot,
    userId,
  });
  if (extra.length === 0) return result;
  return { ...result, folders: [...result.folders, ...extra] };
}

/** Variante `getTree` : réinjecte dans les nœuds conteneurs `groups` ET `persos`. */
export async function mergeGroupSpaceFoldersIntoTree(params: {
  root: StorageFolderNode;
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<StorageFolderNode> {
  const { root, prisma, appRoot, userId } = params;
  const groupsPath = `${appRoot}/groups`;
  const persosPath = `${appRoot}/persos`;

  let groupsNode: StorageFolderNode | null = null;
  let persosNode: StorageFolderNode | null = null;
  const find = (n: StorageNode): void => {
    if (n.type !== "folder") return;
    if (n.path === groupsPath && n.children) groupsNode = n;
    if (n.path === persosPath && n.children) persosNode = n;
    (n.children ?? []).forEach(find);
  };
  find(root);

  const groupExtra = groupsNode
    ? await missingGroupSpaceFolders({
        existingPaths: (groupsNode as StorageFolderNode).children?.map((c) => c.path) ?? [],
        prisma,
        appRoot,
        userId,
      })
    : [];
  const persoExtra = persosNode
    ? await missingPersoSpaceFolders({
        existingPaths: (persosNode as StorageFolderNode).children?.map((c) => c.path) ?? [],
        prisma,
        appRoot,
        userId,
      })
    : [];
  if (groupExtra.length === 0 && persoExtra.length === 0) return root;

  const rebuild = (n: StorageNode): StorageNode => {
    if (n.type !== "folder") return n;
    if (n.path === groupsPath && n.children && groupExtra.length > 0) {
      return { ...n, children: [...n.children, ...groupExtra] };
    }
    if (n.path === persosPath && n.children && persoExtra.length > 0) {
      return { ...n, children: [...n.children, ...persoExtra] };
    }
    if (!n.children) return n;
    return { ...n, children: n.children.map(rebuild) };
  };
  return rebuild(root) as StorageFolderNode;
}
TS
echo "réécrit  $SVC"

# ── 2. Câblage getTree (idempotent) ──────────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "mergeGroupSpaceFoldersIntoTree" in s:
    print("getTree déjà câblé — service étendu (persos), rien à recâbler"); sys.exit(0)

imp_old = 'import { mergeGroupSpaceFolders } from "@backend/modules/storage/mergeGroupSpaceFolders.service";\n'
assert s.count(imp_old) == 1, "ancre import mergeGroupSpaceFolders introuvable/multiple"
s = s.replace(
    imp_old,
    'import {\n'
    '  mergeGroupSpaceFolders,\n'
    '  mergeGroupSpaceFoldersIntoTree,\n'
    '} from "@backend/modules/storage/mergeGroupSpaceFolders.service";\n',
)

tree_anchor = "      await enrichTreeWithStatus(ctx.prisma, ctx.appRoot, result.root);\n"
assert s.count(tree_anchor) == 1, "ancre enrichTreeWithStatus (getTree) introuvable/multiple"
s = s.replace(
    tree_anchor,
    tree_anchor
    + "      // Espaces de groupe ET perso visibles même vides, dans l'arbre du finder.\n"
    + "      result.root = await mergeGroupSpaceFoldersIntoTree({\n"
    + "        root: result.root,\n"
    + "        prisma: ctx.prisma,\n"
    + "        appRoot: ctx.appRoot,\n"
    + "        userId: ctx.user.id,\n"
    + "      });\n",
)
p.write_text(s, encoding="utf-8")
print("getTree câblé")
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
git commit -m "fix(finder): espaces de groupe ET perso visibles même vides (getTree, deux conteneurs)" \
  && echo "commit $(git rev-parse --short HEAD)"