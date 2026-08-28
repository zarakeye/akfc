#!/usr/bin/env bash
#
# AKFC — Découplage nom/libellé, R4 : « Renommer » d'un dossier-entité édite le
# LIBELLÉ (setFolderLabel), pas le binaire.
#
# Avant : `renameNode` appelait toujours `storage.rename` (déplacement physique).
# Pour un dossier-entité, R1 refuse désormais ce rename → l'action échouait.
# Après : si le node est un dossier-entité (`isProtectedEntityFolder`), on appelle
# `storage.setFolderLabel({ path, displayName })` — le chemin reste intact, seul
# le libellé change. Le champ se pré-remplit déjà avec le libellé courant
# (node.name est résolu par R3). Les dossiers ORDINAIRES gardent le rename
# physique (légitime).
#
# Clé du libellé = `node.path` (le même que R3 utilise pour la résolution).
#
# Prérequis : R2 (mutation setFolderLabel), idéalement R1 + R3. `useNodeActions.ts`
# seul, typecheck web.
#
# Usage : bash apply-r4-rename-to-folderlabel.sh
#         AKFC_APPLY_ONLY=1 bash apply-r4-rename-to-folderlabel.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/finder-core/hooks/useNodeActions.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "setFolderLabel" in s:
    print("déjà câblé (setFolderLabel)"); sys.exit(0)

# 1. import isProtectedEntityFolder
imp_anchor = "import { storagePathOf } from '@features/finder-core/utils/storagePath';\n"
assert s.count(imp_anchor) == 1, "ancre import storagePathOf introuvable/multiple"
s = s.replace(
    imp_anchor,
    imp_anchor
    + "import { isProtectedEntityFolder } from '@features/finder-core/utils/spaceFolderKind';\n",
)

# 2. mutation setFolderLabel (après renameMutation)
mut_anchor = "  const renameMutation = trpc.storage.rename.useMutation();\n"
assert s.count(mut_anchor) == 1, "ancre renameMutation introuvable/multiple"
s = s.replace(
    mut_anchor,
    mut_anchor
    + "  const setFolderLabelMutation = trpc.storage.setFolderLabel.useMutation();\n",
)

# 3. branche dossier-entité dans renameNode
branch_anchor = (
    "      if (clean === baseNameOf(node.name, node.meta?.format)) return null;\n"
    "\n"
    "      try {\n"
    "        await renameMutation.mutateAsync({\n"
)
assert s.count(branch_anchor) == 1, "ancre corps renameNode introuvable/multiple"
branch_new = (
    "      if (clean === baseNameOf(node.name, node.meta?.format)) return null;\n"
    "\n"
    "      // Dossier-entité : on n'édite QUE le libellé d'affichage — le chemin\n"
    "      // est immuable (garde serveur R1). Aucun déplacement du binaire. Clé =\n"
    "      // node.path, celui que la résolution du listing (R3) va relire.\n"
    "      if (node.type === 'folder' && isProtectedEntityFolder(node.path)) {\n"
    "        try {\n"
    "          await setFolderLabelMutation.mutateAsync({\n"
    "            path: node.path,\n"
    "            displayName: clean,\n"
    "          });\n"
    "          reloadFolderContent();\n"
    "          return null;\n"
    "        } catch (err) {\n"
    "          return err instanceof Error ? err.message : 'Le renommage a échoué.';\n"
    "        }\n"
    "      }\n"
    "\n"
    "      try {\n"
    "        await renameMutation.mutateAsync({\n"
)
s = s.replace(branch_anchor, branch_new)

# 4. deps du useCallback
deps_anchor = "    [renameMutation, reloadFolderContent],\n"
assert s.count(deps_anchor) == 1, "ancre deps renameNode introuvable/multiple"
s = s.replace(
    deps_anchor,
    "    [renameMutation, setFolderLabelMutation, reloadFolderContent],\n",
)

p.write_text(s, encoding="utf-8")
print("useNodeActions câblé (rename dossier-entité → setFolderLabel)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(finder): renommer un dossier-entité édite son libellé (setFolderLabel) au lieu de déplacer le binaire" \
  && echo "commit $(git rev-parse --short HEAD)"