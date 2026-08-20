#!/usr/bin/env bash
#
# AKFC — correctif DOUBLON en grille (finder membre).
#
# Le finder membre (readOnly) imbrique déjà les sous-groupes via son ADAPTATEUR.
# Le transform de nesting grille (displayFolders, ajouté pour le finder ADMIN)
# réinjecte les mêmes sous-groupes quand l'utilisateur est admin (groupSpaceHierarchy
# peuplé) → chaque sous-groupe apparaît 2× → clé React dupliquée.
#
# Fix : court-circuiter displayFolders quand `readOnly` (finder membre). Le
# transform reste actif pour le finder admin (readOnly=false, adaptateur sans
# injection).
#
# Prérequis : grid-nesting + brique 1 (readOnly). Pas de migration.
# Usage : bash apply-collab-grid-nesting-fix-dup.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-grid-nesting-fix-dup.sh   (clone)
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
if "if (readOnly) return folders;" in s:
    print("déjà corrigé"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# court-circuit en readOnly (finder membre → nesting déjà fait par l'adaptateur)
s = sub(
    "  const displayFolders = useMemo(() => {\n"
    "    const spaces = groupSpaceHierarchy ?? [];",
    "  const displayFolders = useMemo(() => {\n"
    "    // Finder MEMBRE (readOnly) : l'imbrication est déjà faite par son\n"
    "    // adaptateur — ne pas ré-injecter ici (sinon doublons). Transform\n"
    "    // réservé au finder admin.\n"
    "    if (readOnly) return folders;\n"
    "    const spaces = groupSpaceHierarchy ?? [];",
    "readOnly short-circuit")

# ajouter readOnly aux deps du useMemo
s = sub(
    "  }, [folders, currentPath, groupSpaceHierarchy]);",
    "  }, [folders, currentPath, groupSpaceHierarchy, readOnly]);",
    "deps")

p.write_text(s, encoding="utf-8")
print("Finder patché (grille : pas de doublon en readOnly)")
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
if git commit -m "fix(finder): pas de double injection des sous-groupes en grille (finder membre)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Valider : dans /mes-espaces (grille), ouvrir Administrateurs n'affiche Bureau qu'UNE fois."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi