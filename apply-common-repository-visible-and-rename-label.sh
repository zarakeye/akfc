#!/usr/bin/env bash
#
# AKFC — Dépôt commun : visible même vide + « Renommer » = label (bin & common_repository).
#
#   1. mergeGroupSpaceFoldersIntoTree : injecte un nœud racine `common_repository`
#      s'il est absent (vide) — comme les espaces groupe/perso vides. Gaté admin.
#      applyGroupSpaceNamesToTree l'affichera « Dépôt commun ».
#   2. renameNode (front) : pour `bin` et `common_repository` (racines
#      structurelles), « Renommer » édite le FolderLabel (affichage) au lieu du
#      rename PHYSIQUE (qui casserait la structure). Comme déjà fait ailleurs.
#
# Front + backend. typecheck backend + web.
#
# Usage : bash apply-common-repository-visible-and-rename-label.sh
#         AKFC_APPLY_ONLY=1 bash apply-common-repository-visible-and-rename-label.sh
#
set -euo pipefail

MERGE="packages/backend/src/modules/storage/mergeGroupSpaceFolders.service.ts"
ACTIONS="apps/web/src/features/finder-core/hooks/useNodeActions.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$MERGE" "$ACTIONS"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Injection racine common_repository (visible même vide) ────────────────
python3 - "$MERGE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "common_repository" in s:
    print("— merge déjà patché"); sys.exit(0)

# 1a. détection après find(root)
anchor_find = (
    "    find(root);\n"
    "\n"
    "    const groupExtra = groupsNode\n"
)
assert anchor_find in s, "ancre find(root) introuvable"
s = s.replace(
    anchor_find,
    "    find(root);\n"
    "\n"
    "    // Dépôt commun : racine structurelle toujours visible (carte mentale\n"
    "    // admin), même vide. On l'injecte à la racine si absente, comme les\n"
    "    // espaces groupe/perso vides. Gaté admin (seuls eux lisent le dépôt).\n"
    "    const commonRepoPath = `${appRoot}/common_repository`;\n"
    "    let hasCommonRepo = false;\n"
    "    const findCommon = (n: StorageNode): void => {\n"
    "      if (n.type !== \"folder\") return;\n"
    "      if (n.path === commonRepoPath) hasCommonRepo = true;\n"
    "      (n.children ?? []).forEach(findCommon);\n"
    "    };\n"
    "    findCommon(root);\n"
    "    const injectCommonRepo =\n"
    "      !hasCommonRepo && (await isAdminByGroup(prisma, userId));\n"
    "\n"
    "    const groupExtra = groupsNode\n",
)

# 1b. condition de sortie anticipée
s = s.replace(
    "    if (groupExtra.length === 0 && persoExtra.length === 0) return root;\n",
    "    if (\n"
    "      groupExtra.length === 0 &&\n"
    "      persoExtra.length === 0 &&\n"
    "      !injectCommonRepo\n"
    "    )\n"
    "      return root;\n",
)

# 1c. injection à la racine après rebuild
s = s.replace(
    "    return rebuild(root) as StorageFolderNode;\n  }\n",
    "    let rebuilt = rebuild(root) as StorageFolderNode;\n"
    "    if (injectCommonRepo) {\n"
    "      rebuilt = {\n"
    "        ...rebuilt,\n"
    "        hasChildren: true,\n"
    "        children: [...(rebuilt.children ?? []), folderNode(commonRepoPath)],\n"
    "      };\n"
    "    }\n"
    "    return rebuilt;\n  }\n",
)

p.write_text(s, encoding="utf-8")
print("✓ merge : injection racine common_repository (visible vide)")
PY

# ── 2. renameNode : bin & common_repository → setFolderLabel ─────────────────
python3 - "$ACTIONS" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "COMMON_REPOSITORY_PATH" in s:
    print("— renameNode déjà patché"); sys.exit(0)

# 2a. const path racine
s = s.replace(
    "const BIN_PATH = `${APP_ROOT}/bin`;\n",
    "const BIN_PATH = `${APP_ROOT}/bin`;\n"
    "const COMMON_REPOSITORY_PATH = `${APP_ROOT}/common_repository`;\n"
    "// Racines dont « Renommer » édite le LABEL d'affichage (FolderLabel), jamais\n"
    "// le path physique (qui casserait resolver/query/finder/permissions).\n"
    "const LABEL_ONLY_PATHS = new Set([BIN_PATH, COMMON_REPOSITORY_PATH]);\n",
)

# 2b. mutation setFolderLabel
s = s.replace(
    "  const renameMutation = trpc.storage.rename.useMutation();\n",
    "  const renameMutation = trpc.storage.rename.useMutation();\n"
    "  const setFolderLabelMutation = trpc.storage.setFolderLabel.useMutation();\n",
)

# 2c. branche dans renameNode
s = s.replace(
    "      try {\n"
    "        await renameMutation.mutateAsync({\n"
    "          path: storagePathOf(node),\n"
    "          type: node.type === 'folder' ? 'folder' : 'file',\n"
    "          newBaseName: clean,\n"
    "        });\n"
    "        reloadFolderContent();\n"
    "        return null;\n"
    "      } catch (err) {\n"
    "        return err instanceof Error ? err.message : 'Le renommage a échoué.';\n"
    "      }\n"
    "    },\n"
    "    [renameMutation, reloadFolderContent],\n",
    "      const path = storagePathOf(node);\n"
    "      try {\n"
    "        if (LABEL_ONLY_PATHS.has(path)) {\n"
    "          // Racine structurelle : on édite le libellé d'affichage.\n"
    "          await setFolderLabelMutation.mutateAsync({\n"
    "            path,\n"
    "            displayName: clean,\n"
    "          });\n"
    "        } else {\n"
    "          await renameMutation.mutateAsync({\n"
    "            path,\n"
    "            type: node.type === 'folder' ? 'folder' : 'file',\n"
    "            newBaseName: clean,\n"
    "          });\n"
    "        }\n"
    "        reloadFolderContent();\n"
    "        return null;\n"
    "      } catch (err) {\n"
    "        return err instanceof Error ? err.message : 'Le renommage a échoué.';\n"
    "      }\n"
    "    },\n"
    "    [renameMutation, setFolderLabelMutation, reloadFolderContent],\n",
)
p.write_text(s, encoding="utf-8")
print("✓ renameNode : bin & common_repository → setFolderLabel")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|common_repository|folderNode|isAdminByGroup" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|setFolderLabel|LABEL_ONLY" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(depot-commun): visible même vide + « Renommer » édite le label sur bin & common_repository" \
  && echo "commit $(git rev-parse --short HEAD)"