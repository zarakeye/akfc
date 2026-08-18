#!/usr/bin/env bash
#
# AKFC — CORRECTIF option B-2 : spinner infini sur les espaces imbriqués.
#
# Cause : l'arbre est chargé en PROFONDEUR (FinderTree getTree depth=treeDepth),
# donc les vrais nœuds ont déjà leurs `children`. Les nœuds SYNTHÉTIQUES créés
# par B-2 avaient `children: undefined` et rien ne les charge (l'auto-load est
# réservé au trash) → isMaterializing reste vrai → spinner sans fin.
#
# Fix : au niveau de `groups/`, ré-arranger les VRAIS nœuds d'espaces selon la
# hiérarchie (augment récursif : un espace parent reçoit, EN PLUS de ses enfants
# physiques déjà chargés, les vrais nœuds de ses espaces-enfants). Plus aucun
# nœud synthétique → plus de spinner, contenu affiché.
#
# Prérequis : optB2 appliqué. Front NON testé → valider. Pas de migration.
# Usage : bash apply-collab-optB2-fix-spinner.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-optB2-fix-spinner.sh   (clone)
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
if "parentPathBySpacePath" in s:
    print("correctif déjà appliqué"); sys.exit(0)

OLD = (
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
    "    syntheticChildSpaces.length > 0;"
)

NEW = (
    "  // ─── Option B : imbrication VISUELLE des espaces de groupe ──────────────\n"
    "  // Au niveau de `groups/`, on ré-arrange les nœuds RÉELS des espaces selon\n"
    "  // la hiérarchie logique (parentGroupId). Chaque espace garde SON nœud —\n"
    "  // donc ses enfants déjà chargés par l'arbre profond — d'où aucun nœud\n"
    "  // synthétique et aucun spinner. Les chemins physiques restent intacts.\n"
    "  const groupsContainerPath = `${APP_ROOT}/groups`;\n"
    "  const spacePathByGroupId = new Map<string, string>();\n"
    "  for (const sp of groupSpaceHierarchy ?? []) {\n"
    "    spacePathByGroupId.set(sp.groupId, sp.path);\n"
    "  }\n"
    "  const parentPathBySpacePath = new Map<string, string | null>();\n"
    "  for (const sp of groupSpaceHierarchy ?? []) {\n"
    "    parentPathBySpacePath.set(\n"
    "      sp.path,\n"
    "      sp.parentGroupId\n"
    "        ? (spacePathByGroupId.get(sp.parentGroupId) ?? null)\n"
    "        : null,\n"
    "    );\n"
    "  }\n"
    "\n"
    "  let displayChildren: FinderNode[] | undefined = effectiveChildren;\n"
    "  if (node.path === groupsContainerPath && effectiveChildren) {\n"
    "    const spaceNodes = effectiveChildren.filter((c) =>\n"
    "      parentPathBySpacePath.has(c.path),\n"
    "    );\n"
    "    const others = effectiveChildren.filter(\n"
    "      (c) => !parentPathBySpacePath.has(c.path),\n"
    "    );\n"
    "    const childrenByParentPath = new Map<string, FinderNode[]>();\n"
    "    for (const n of spaceNodes) {\n"
    "      const pp = parentPathBySpacePath.get(n.path) ?? null;\n"
    "      if (pp && parentPathBySpacePath.has(pp)) {\n"
    "        const arr = childrenByParentPath.get(pp) ?? [];\n"
    "        arr.push(n);\n"
    "        childrenByParentPath.set(pp, arr);\n"
    "      }\n"
    "    }\n"
    "    const augment = (n: FinderNode): FinderNode => {\n"
    "      const childSpaces = childrenByParentPath.get(n.path) ?? [];\n"
    "      if (childSpaces.length === 0) return n;\n"
    "      return {\n"
    "        ...n,\n"
    "        hasChildren: true,\n"
    "        children: [...(n.children ?? []), ...childSpaces.map(augment)],\n"
    "      };\n"
    "    };\n"
    "    const roots = spaceNodes.filter((n) => {\n"
    "      const pp = parentPathBySpacePath.get(n.path) ?? null;\n"
    "      return !pp || !parentPathBySpacePath.has(pp);\n"
    "    });\n"
    "    displayChildren = [...others, ...roots.map(augment)];\n"
    "  }\n"
    "\n"
    "  const hasChildren = node.hasChildren ?? (displayChildren?.length ?? 0) > 0;"
)

assert s.count(OLD) == 1, "ancre bloc B-2 introuvable (optB2 appliqué ?)"
s = s.replace(OLD, NEW)
p.write_text(s, encoding="utf-8")
print("FinderTreeFolder corrigé (vrais nœuds, plus de synthétiques)")
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
if git commit -m "fix(finder): option B — ré-arranger les vrais nœuds d'espaces (fin du spinner infini)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Valider : Bureau imbriqué sous Administrateurs affiche bien son contenu (plus de spinner)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi