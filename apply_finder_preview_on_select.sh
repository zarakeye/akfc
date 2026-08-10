#!/usr/bin/env bash
#
# AKFC — Finder : ouvrir l'aperçu à la sélection d'un fichier (grand écran).
#
# Sélectionner un fichier unique déplie désormais l'aperçu accosté, mais
# SEULEMENT sur grand écran (`isWide`, ≥1280) — là où l'aperçu est une colonne.
# En dessous, l'aperçu est une feuille venant du bas : l'ouvrir d'office à
# chaque sélection serait intrusif, donc il reste au bouton (choix assumé).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-finder-preview-on-select.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-finder-preview-on-select.sh
#
set -euo pipefail

SVC="apps/web/src/features/finder-core/components/Finder.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "selectedFileId" in s:
    print("déjà appliqué — rien à faire"); sys.exit(0)

OLD = "  const selectedCount = selectedNodes.length;"
NEW = '''  const selectedCount = selectedNodes.length;

  // Id du fichier sélectionné seul (null si dossier, aucun, ou multi-sélection).
  const singleSelected = selectedCount === 1 ? selectedNodes[0] : null;
  const selectedFileId =
    singleSelected && singleSelected.type !== "folder"
      ? singleSelected.id
      : null;

  // Ouvre l'aperçu accosté dès qu'un fichier est sélectionné, sur grand écran
  // (≥1280, où l'aperçu est une colonne). En dessous, l'aperçu est une feuille
  // qu'on n'ouvre pas d'office à chaque sélection (trop intrusif).
  useEffect(() => {
    if (isWide && selectedFileId) {
      previewPanelRef.current?.expand();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFileId, isWide]);'''
assert s.count(OLD) == 1, "ancre selectedCount introuvable — abandon"
s = s.replace(OLD, NEW, 1)
p.write_text(s, encoding="utf-8")
print("Finder : aperçu ouvert à la sélection (grand écran)")
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
if git commit -m "feat(finder): ouvrir l'aperçu à la sélection d'un fichier (grand écran uniquement)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi