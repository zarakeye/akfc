#!/usr/bin/env bash
#
# AKFC — correctif alias registre : @config/pageRegistry → @/config/pageRegistry
#
# `@config/*` = `packages/config/*` (package partagé). Le registre est dans
# `apps/web/src/config/` → alias `@/*` (= ./src/*). On corrige les deux imports.
#
# Usage : bash apply-construction-3-fix-alias.sh
#         AKFC_APPLY_ONLY=1 bash apply-construction-3-fix-alias.sh   (clone)
#
set -euo pipefail

MW="apps/web/middleware.ts"
API="apps/web/src/app/api/page-access/route.ts"

for f in "package.json" "$MW" "$API"; do
  [ -f "$f" ] || { echo "ERREUR: fichier manquant: $f (brique 3 appliquée ?)." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

python3 - "$MW" "$API" <<'PY'
import sys, pathlib
changed = 0
for path in sys.argv[1:]:
    p = pathlib.Path(path); s = p.read_text(encoding="utf-8")
    old = 'from "@config/pageRegistry"'
    new = 'from "@/config/pageRegistry"'
    if old in s:
        s = s.replace(old, new)
        p.write_text(s, encoding="utf-8")
        changed += 1
        print(f"corrigé: {path}")
    elif new in s:
        print(f"déjà corrigé: {path}")
    else:
        print(f"AUCUN import registre trouvé: {path}")
print(f"[{changed} fichier(s) corrigé(s)]")
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
if git commit -m "fix(pages): import registre via @/config (et non @config)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi