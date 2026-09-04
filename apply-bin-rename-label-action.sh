#!/usr/bin/env bash
#
# AKFC — « Renommer » (label seul) sur la corbeille (bin) dans l'arbre du finder.
#
# bin est un status folder → son menu contextuel est désactivé (isStatus). On
# autorise, pour bin UNIQUEMENT, le menu + le rename inline, limités à
# « Renommer ». renameNode route déjà bin → setFolderLabel : le path physique
# `bin` reste, seul le FolderLabel (« Corbeille ») change. Drag/select/suppression
# restent interdits sur bin.
#
# Front seul (FinderTreeFolder), typecheck web.
#
# Usage : bash apply-bin-rename-label-action.sh
#         AKFC_APPLY_ONLY=1 bash apply-bin-rename-label-action.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
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
if "isRenamableRoot" in s:
    print("— déjà patché"); sys.exit(0)

# 1. déclarer isRenamableRoot (bin) juste après isStatus
a1 = "  const isStatus = isStatusFolder(node.path);\n"
assert s.count(a1) == 1, "ancre `const isStatus` introuvable/multiple"
s = s.replace(
    a1,
    a1
    + "  // La corbeille (bin) est un status folder, mais on autorise l'édition de\n"
    + "  // son LABEL d'affichage (renameNode route bin → setFolderLabel ; le path\n"
    + "  // physique `bin` reste). Drag/select/suppression restent interdits.\n"
    + "  const isRenamableRoot = node.path === `${APP_ROOT}/bin`;\n",
)

# 2. buildMenuItems : pour bin, ne proposer QUE « Renommer »
a2 = (
    "  function buildMenuItems(): ContextMenuItem[] {\n"
    "    const targetNodes = effectiveNodesFor(node);\n"
    "    return [\n"
)
assert a2 in s, "ancre buildMenuItems introuvable"
s = s.replace(
    a2,
    "  function buildMenuItems(): ContextMenuItem[] {\n"
    "    const targetNodes = effectiveNodesFor(node);\n"
    "    if (isRenamableRoot) {\n"
    "      return [\n"
    "        {\n"
    '          label: "Renommer",\n'
    "          onClick: () => {\n"
    "            setRenameError(null);\n"
    "            setIsRenamingFolder(true);\n"
    "          },\n"
    "        },\n"
    "      ];\n"
    "    }\n"
    "    return [\n",
)

# 3. onContextMenu : autoriser aussi pour bin
a3 = (
    "        onContextMenu={\n"
    "          isStatus\n"
    "            ? undefined\n"
)
assert a3 in s, "ancre onContextMenu introuvable"
s = s.replace(
    a3,
    "        onContextMenu={\n"
    "          isStatus && !isRenamableRoot\n"
    "            ? undefined\n",
)

# 4. rename inline (double-clic) : autoriser aussi pour bin
a4 = "              if (!isStatus) {\n"
assert s.count(a4) == 1, "ancre `if (!isStatus)` (rename inline) introuvable/multiple"
s = s.replace(a4, "              if (!isStatus || isRenamableRoot) {\n")

p.write_text(s, encoding="utf-8")
print("✓ bin : « Renommer » (label seul) autorisé dans l'arbre")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|isRenamableRoot|APP_ROOT" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(finder): « Renommer » (label seul) sur la corbeille bin dans l'arbre" \
  && echo "commit $(git rev-parse --short HEAD)"