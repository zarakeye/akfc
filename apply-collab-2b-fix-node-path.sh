#!/usr/bin/env bash
#
# AKFC — Correctif 2b : les nœuds de `storage.getTree` (StorageFolderNode /
# StorageFileNode, contrat agnostique) exposent `path`, PAS `fullPath`
# (`fullPath` est le champ du nœud UI finder-core, un type différent).
# On remplace `child.fullPath` → `child.path` dans la page de parcours.
#
# Usage : bash apply-collab-2b-fix-node-path.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-2b-fix-node-path.sh   (clone)
#
set -euo pipefail

DETAIL="apps/web/src/app/(public)/mes-espaces/[groupId]/page.tsx"

if [ ! -f "package.json" ] || [ ! -f "$DETAIL" ]; then
  echo "ERREUR: lance depuis la racine ; 2b doit être appliqué ($DETAIL attendu)." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier collaboratif va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

python3 - "$DETAIL" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
n = s.count("child.fullPath")
if n == 0:
    print("déjà corrigé (aucun child.fullPath)")
else:
    assert n == 3, f"attendu 3 occurrences de child.fullPath, trouvé {n}"
    s = s.replace("child.fullPath", "child.path")
    p.write_text(s, encoding="utf-8")
    print(f"corrigé : {n} × child.fullPath → child.path")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct, sans pnpm clean)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification"; exit 0
fi

git add -A
if git commit -m "fix(groups): finder membre — nœud storage.getTree utilise path (pas fullPath)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi