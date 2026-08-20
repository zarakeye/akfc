#!/usr/bin/env bash
#
# AKFC — Finder : NESTING aussi en GRID view (pas seulement l'arbre).
#
# B-2 n'imbriquait que l'ARBRE (FinderTreeFolder). La grille (main panel) montrait
# les espaces à plat. On applique le MÊME ré-arrangement aux `folders` de la
# grille dans Finder.tsx :
#   - à `${APP_ROOT}/groups` : ne garder que les espaces RACINES ;
#   - dans un espace : injecter ses sous-groupes (nœuds nav-only — la grille
#     n'a pas de lazy-expand, un clic navigue par le chemin réel, donc pas de
#     spinner).
# Basé sur `storage.groupSpaceHierarchy` (données admin) → INERTE pour un membre
# (query renvoie [] ; et le finder membre nest déjà via son adaptateur).
#
# Prérequis : optB1 (query groupSpaceHierarchy). Front NON testé → valider.
# Pas de migration.
# Usage : bash apply-collab-grid-nesting.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-grid-nesting.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/finder-core/components/Finder.tsx"

if [ ! -f "package.json" ] || [ ! -f "$F" ]; then
  echo "ERREUR: lance depuis la racine ($F attendu)." >&2
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

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "displayFolders" in s:
    print("Finder déjà à jour (grid nesting)"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# 1) import trpc (hook)
s = sub(
    'import { APP_ROOT } from "@config/app";',
    'import { APP_ROOT } from "@config/app";\n'
    'import { trpc } from "@trpc/trpcClient";',
    "import trpc")

# 2) query + displayFolders, juste avant sortedAllItems
s = sub(
    "  const sortedAllItems = useMemo(\n"
    "    () => sortNodes([...folders, ...visibleFiles], sort),\n"
    "    [folders, visibleFiles, sort],\n"
    "  );",
    "  // Nesting des espaces AUSSI en grille (l'arbre le fait via B-2). Inerte\n"
    "  // pour un membre (groupSpaceHierarchy = [] hors admin ; son adaptateur\n"
    "  // gère déjà l'imbrication).\n"
    "  const { data: groupSpaceHierarchy } =\n"
    "    trpc.storage.groupSpaceHierarchy.useQuery();\n"
    "  const displayFolders = useMemo(() => {\n"
    "    const spaces = groupSpaceHierarchy ?? [];\n"
    "    if (spaces.length === 0) return folders;\n"
    "    const groupsContainerPath = `${APP_ROOT}/groups`;\n"
    "    const pathByGroupId = new Map(spaces.map((sp) => [sp.groupId, sp.path]));\n"
    "    const allSpacePaths = new Set(spaces.map((sp) => sp.path));\n"
    "    if (currentPath === groupsContainerPath) {\n"
    "      return folders.filter((f) => {\n"
    "        if (!allSpacePaths.has(f.path)) return true;\n"
    "        const sp = spaces.find((x) => x.path === f.path);\n"
    "        return !sp?.parentGroupId || !pathByGroupId.has(sp.parentGroupId);\n"
    "      });\n"
    "    }\n"
    "    const childSpaces = spaces.filter(\n"
    "      (sp) =>\n"
    "        sp.parentGroupId &&\n"
    "        pathByGroupId.get(sp.parentGroupId) === currentPath,\n"
    "    );\n"
    "    if (childSpaces.length === 0) return folders;\n"
    "    const childNodes: FinderNode[] = childSpaces.map((sp) => ({\n"
    "      id: sp.path,\n"
    "      name: sp.name,\n"
    "      path: sp.path,\n"
    "      type: \"folder\",\n"
    "      hasChildren: true,\n"
    "    }));\n"
    "    return [...folders, ...childNodes];\n"
    "  }, [folders, currentPath, groupSpaceHierarchy]);\n"
    "\n"
    "  const sortedAllItems = useMemo(\n"
    "    () => sortNodes([...displayFolders, ...visibleFiles], sort),\n"
    "    [displayFolders, visibleFiles, sort],\n"
    "  );",
    "displayFolders + sortedAllItems")

# 3) empty check → displayFolders
s = sub(
    "{folders.length === 0 && files.length === 0 && !loading ? (",
    "{displayFolders.length === 0 && files.length === 0 && !loading ? (",
    "empty check")

p.write_text(s, encoding="utf-8")
print("Finder patché (nesting grille)")
PY

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
if git commit -m "feat(finder): nesting des espaces aussi en grille (parité avec l'arbre)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Valider : dans la grille admin, groups/ ne montre que les racines ; ouvrir un espace montre ses sous-groupes."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi