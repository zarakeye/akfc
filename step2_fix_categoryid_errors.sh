#!/usr/bin/env bash
###############################################################################
# G2 — CORRECTIF : garder `errors.categoryId` sur l'union (membre general)
#
# FormValues inclut désormais le membre `general` (sans categoryId) → l'accès
# `errors.categoryId` n'est plus sûr. On applique le même garde `'x' in errors`
# que pour disciplineId / proposedDisciplineName.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

FORM="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
if grep -q "'categoryId' in errors" "$FORM" 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

python3 - << 'PY'
p = "apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
s = open(p, encoding="utf-8").read()
a = '''        {errors.categoryId && (
          <p className="text-sm text-red-600 mt-1">
            {errors.categoryId.message}
          </p>
        )}'''
b = '''        {'categoryId' in errors && errors.categoryId && (
          <p className="text-sm text-red-600 mt-1">
            {errors.categoryId.message}
          </p>
        )}'''
assert s.count(a) == 1, f"ancre errors.categoryId : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  errors.categoryId gardé OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== typecheck web =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "fix(upload): guard errors.categoryId for general destination union"
echo "OK — correctif G2 commité."