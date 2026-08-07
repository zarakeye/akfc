#!/usr/bin/env bash
#
# AKFC — Masquer le filtre de statut (Tous/En attente/Validés) quand le
# dossier courant n'a aucun fichier enfant direct.
#
# Le filtre ne trie QUE des fichiers de la grille. Sur un dossier qui ne
# contient que des sous-dossiers, il n'a rien à filtrer → on le masque.
#
# Condition ajoutée : `files.length > 0` (les fichiers enfants directs du
# dossier courant). Sur `files` BRUT, pas sur `visibleFiles` : sinon filtrer
# « En attente » dans un dossier sans fichier en attente viderait `visibleFiles`,
# masquerait la barre et empêcherait de revenir à « Tous ».
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-finder-hide-status-filter.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-finder-hide-status-filter.sh
#
set -euo pipefail

SVC="apps/web/src/features/finder-core/components/Finder.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "files.length > 0 && <StatusFilterBar" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

OLD = '''        {/* La corbeille garde son propre système : ses items n'ont pas de
            statut de publication, la lentille n'y a rien à filtrer. */}
        {currentPath !== `${APP_ROOT}/bin` &&
          !multiSelectActive &&
          !fileFilter && <StatusFilterBar />}'''

NEW = '''        {/* La corbeille garde son propre système : ses items n'ont pas de
            statut de publication, la lentille n'y a rien à filtrer. */}
        {/* Masquée aussi quand le dossier courant n'a aucun fichier enfant
            direct : le filtre ne trie que des fichiers, il n'a rien à faire
            sur un dossier qui ne contient que des sous-dossiers. Condition sur
            `files` BRUT (pas `visibleFiles`) — sinon filtrer « En attente »
            sans aucun fichier en attente masquerait la barre et bloquerait le
            retour à « Tous ». */}
        {currentPath !== `${APP_ROOT}/bin` &&
          !multiSelectActive &&
          !fileFilter &&
          files.length > 0 && <StatusFilterBar />}'''

assert s.count(OLD) == 1, "ancre StatusFilterBar introuvable/multiple — abandon avant tout commit"
p.write_text(s.replace(OLD, NEW), encoding="utf-8")
print("patch Finder.tsx OK (filtre de statut masqué sans fichier enfant direct)")
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
if git commit -m "feat(finder): masquer le filtre de statut quand le dossier courant n'a aucun fichier enfant direct" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi