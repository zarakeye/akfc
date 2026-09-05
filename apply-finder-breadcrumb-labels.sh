#!/usr/bin/env bash
#
# AKFC — Finder : le BREADCRUMB suit les libellés de dossier (= la grille).
#
# Problème : le fil d'Ariane résolvait les noms de segment uniquement via
# `storage.myCollaborativeSpaces` (espaces groupe/perso), et sinon affichait le
# SLUG BRUT. La grille et la tree, elles, reçoivent un `node.name` déjà résolu
# côté back par applyGroupSpaceNames : priorité FolderLabel[path] > nom de
# groupe > slug. D'où l'écart : grille = « Cours » / « Dépôt commun » /
# « Corbeille », breadcrumb = « cours » / « common_repository » / « bin ».
#
# Correctif : le breadcrumb lit AUSSI `storage.folderLabels` et applique la MÊME
# priorité que le back (FolderLabel > nom d'espace > slug) → il colle à la grille.
#
# Périmètre : FRONT uniquement, un seul fichier. Un aller-retour = un typecheck.
#
# Usage : bash apply-finder-breadcrumb-labels.sh
#         AKFC_APPLY_ONLY=1 bash apply-finder-breadcrumb-labels.sh   (Claude sur clone)
#
set -euo pipefail

BC="apps/web/src/features/finder-core/components/Breadcrumb.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$BC" ] || { echo "ERREUR: $BC introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$BC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "labelByPath" in s or "storage.folderLabels" in s:
    print("— déjà appliqué (labelByPath présent)"); sys.exit(0)

def sub(old, new, label):
    global s
    n = s.count(old)
    assert n == 1, f"ancre introuvable/multiple ({n}) : {label}"
    s = s.replace(old, new)

# 1) Ajouter la query folderLabels + map path→displayName, juste après nameByPath.
sub(
    "  const { data: mySpaces } = trpc.storage.myCollaborativeSpaces.useQuery();\n"
    "  const nameByPath = new Map(\n"
    "    (mySpaces ?? []).map((sp) => [sp.path, sp.name] as const),\n"
    "  );\n",
    "  const { data: mySpaces } = trpc.storage.myCollaborativeSpaces.useQuery();\n"
    "  const nameByPath = new Map(\n"
    "    (mySpaces ?? []).map((sp) => [sp.path, sp.name] as const),\n"
    "  );\n"
    "\n"
    "  // Libellés d'affichage des dossiers (FolderLabel[path]) — MÊME source que\n"
    "  // la grille et la tree (résolus côté back par applyGroupSpaceNames). Sans\n"
    "  // ça, le fil montrait le slug brut alors que la grille montre le libellé.\n"
    "  const { data: folderLabels } = trpc.storage.folderLabels.useQuery();\n"
    "  const labelByPath = new Map(\n"
    "    (folderLabels ?? []).map((l) => [l.path, l.displayName] as const),\n"
    "  );\n",
    "query folderLabels + labelByPath",
)

# 2) Appliquer la MÊME priorité que le back : FolderLabel > nom d'espace > slug.
sub(
    "  segments = segments.map((sg) => ({\n"
    "    ...sg,\n"
    "    name: nameByPath.get(sg.path) ?? sg.name,\n"
    "  }));\n",
    "  segments = segments.map((sg) => ({\n"
    "    ...sg,\n"
    "    // Priorité alignée sur le back (applyGroupSpaceNames) :\n"
    "    // FolderLabel[path] > nom d'espace (groupe/perso) > slug brut.\n"
    "    name: labelByPath.get(sg.path) ?? nameByPath.get(sg.path) ?? sg.name,\n"
    "  }));\n",
    "priorité de résolution du nom",
)

p.write_text(s, encoding="utf-8")
print("Breadcrumb : libellés de dossier alignés sur la grille")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "fix(finder): breadcrumb suit les libellés de dossier (cohérent avec la grille)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi