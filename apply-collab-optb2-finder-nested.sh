#!/usr/bin/env bash
#
# AKFC — Option B, étape 2 (front) : FINDER ADMIN IMBRIQUÉ.
#
# Dans FinderTreeFolder, on range VISUELLEMENT les espaces de groupe selon la
# hiérarchie logique (parentGroupId), SANS toucher au physique :
#   - sous `${APP_ROOT}/groups` : n'afficher que les espaces RACINES ;
#   - sous un espace : fusionner ses sous-dossiers physiques (chargés par leur
#     chemin) + ses espaces-ENFANTS, nœuds synthétiques dont le `path` est le
#     chemin RÉEL de l'espace → navigation, dépliage et chargement du contenu
#     restent corrects, et la récursion se fait naturellement.
# La hiérarchie vient de `storage.groupSpaceHierarchy` (B-1).
#
# Prérequis : optB1 (query) + displaynames (hook spaceDisplayNames = ancre).
# FRONT NON TESTÉ → valider à l'écran, prévoir une petite itération. Pas de migration.
# Usage : bash apply-collab-optB2-finder-nested.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-optB2-finder-nested.sh   (clone)
#
set -euo pipefail

TREE="apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"

if [ ! -f "package.json" ] || [ ! -f "$TREE" ]; then
  echo "ERREUR: lance depuis la racine ($TREE attendu)." >&2
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

python3 - "$TREE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "groupSpaceHierarchy" in s:
    print("FinderTreeFolder déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# A) query hook (après trashToBinMutation, présent nativement — indépendant de displaynames)
s = sub(
    '  const trashToBinMutation = trpc.trash.trashToBin.useMutation();',
    '  const trashToBinMutation = trpc.trash.trashToBin.useMutation();\n'
    '  const { data: groupSpaceHierarchy } = trpc.storage.groupSpaceHierarchy.useQuery();',
    "query hook")

# B) maps + displayChildren + hasChildren (remplace le bloc effectiveChildren/hasChildren)
s = sub(
    "  const effectiveChildren: FinderNode[] | undefined =\n"
    "    node.children !== undefined ? node.children : (loadedChildren ?? undefined);\n"
    "\n"
    "  const hasChildren = node.hasChildren ?? (effectiveChildren?.length ?? 0) > 0;",
    "  const effectiveChildren: FinderNode[] | undefined =\n"
    "    node.children !== undefined ? node.children : (loadedChildren ?? undefined);\n"
    "\n"
    "  // ─── Option B : imbrication VISUELLE des espaces de groupe ──────────────\n"
    "  // Le finder reste physique ; on range seulement les espaces selon la\n"
    "  // hiérarchie logique (parentGroupId). Chaque nœud synthétique garde son\n"
    "  // CHEMIN RÉEL → navigation + chargement du contenu inchangés.\n"
    "  const groupsContainerPath = `${APP_ROOT}/groups`;\n"
    "  const spacePathByGroupId = new Map<string, string>();\n"
    "  for (const sp of groupSpaceHierarchy ?? []) {\n"
    "    spacePathByGroupId.set(sp.groupId, sp.path);\n"
    "  }\n"
    "  const allSpacePaths = new Set(\n"
    "    (groupSpaceHierarchy ?? []).map((sp) => sp.path),\n"
    "  );\n"
    "  const rootSpacePaths = new Set<string>();\n"
    "  const childSpacesByParentPath = new Map<string, FinderNode[]>();\n"
    "  for (const sp of groupSpaceHierarchy ?? []) {\n"
    "    const parentPath = sp.parentGroupId\n"
    "      ? spacePathByGroupId.get(sp.parentGroupId)\n"
    "      : undefined;\n"
    "    const synthetic: FinderNode = {\n"
    "      id: sp.path,\n"
    "      name: sp.path.split(\"/\").pop() ?? sp.name,\n"
    "      path: sp.path,\n"
    "      type: \"folder\",\n"
    "      hasChildren: true,\n"
    "    };\n"
    "    if (parentPath) {\n"
    "      const arr = childSpacesByParentPath.get(parentPath) ?? [];\n"
    "      arr.push(synthetic);\n"
    "      childSpacesByParentPath.set(parentPath, arr);\n"
    "    } else {\n"
    "      rootSpacePaths.add(sp.path);\n"
    "    }\n"
    "  }\n"
    "\n"
    "  const syntheticChildSpaces = allSpacePaths.has(node.path)\n"
    "    ? (childSpacesByParentPath.get(node.path) ?? [])\n"
    "    : [];\n"
    "\n"
    "  const displayChildren: FinderNode[] | undefined =\n"
    "    node.path === groupsContainerPath\n"
    "      ? effectiveChildren?.filter(\n"
    "          (c) => !allSpacePaths.has(c.path) || rootSpacePaths.has(c.path),\n"
    "        )\n"
    "      : syntheticChildSpaces.length > 0\n"
    "        ? [...(effectiveChildren ?? []), ...syntheticChildSpaces]\n"
    "        : effectiveChildren;\n"
    "\n"
    "  const hasChildren =\n"
    "    (node.hasChildren ?? (effectiveChildren?.length ?? 0) > 0) ||\n"
    "    syntheticChildSpaces.length > 0;",
    "maps + displayChildren")

# C) rendu 2 (arbre déplié) → displayChildren
s = sub(
    "      {isOpen && effectiveChildren && effectiveChildren.length > 0 && (\n"
    "        <div className=\"ml-3 pl-3 border-l border-border\">\n"
    "          {effectiveChildren.map((child) =>",
    "      {isOpen && displayChildren && displayChildren.length > 0 && (\n"
    "        <div className=\"ml-3 pl-3 border-l border-border\">\n"
    "          {displayChildren.map((child) =>",
    "rendu 2")

p.write_text(s, encoding="utf-8")
print("FinderTreeFolder patché (imbrication visuelle des espaces)")
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
if git commit -m "feat(finder): étape B — finder admin imbriqué (espaces rangés par parentGroupId, chemins physiques intacts)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front non testé — valider : sous groups/, Administrateurs contient Bureau (imbriqué) ; ouvrir Bureau montre bien son contenu."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi