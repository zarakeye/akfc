#!/usr/bin/env bash
#
# AKFC — Uploader : le select DISCIPLINE se remplit à nouveau.
#
# Bug : le select était branché sur `discipline.getAllByCategory` avec
# `enabled: categoryId > 0`. Or le select de CATÉGORIE a été retiré (une seule
# catégorie « Cours »), et `categoryId` n'est posé qu'EN choisissant une
# discipline → à l'ouverture la query est désactivée → liste vide → blocage.
# En prime, un `useEffect` remettait `disciplineId` à undefined à chaque
# changement de `categoryId` → il effaçait la sélection tout juste faite.
#
# Fix : lister via `discipline.getAll` (toutes = celles de « Cours »), activé
# quand le mode « discipline existante » est choisi ; retirer le useEffect
# obsolète. `categoryId` reste dérivé de la discipline choisie (onChange) et sert
# à la soumission.
#
# Périmètre : FRONT (DragNDropForm.tsx). Un aller-retour = un typecheck.
# Usage : bash apply-uploader-discipline-select.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
F="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if grep -q "trpc.discipline.getAll.useQuery(undefined, {\$" "$F" 2>/dev/null && \
   grep -q "destinationKind === 'existing-discipline'," "$F" 2>/dev/null; then
  echo "— possiblement déjà appliqué (vérifie manuellement)"; 
fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

def sub(old, new, label):
    global s
    n = s.count(old)
    assert n == 1, f"ancre {label} : attendu 1, trouvé {n}"
    s = s.replace(old, new)

# 1) query : getAllByCategory(categoryId) → getAll activé sur existing-discipline
sub(
    """  const disciplinesQuery = trpc.discipline.getAllByCategory.useQuery(
    { categoryId: categoryId ?? 0 },
    { enabled: typeof categoryId === 'number' && categoryId > 0 }
  );
  const disciplines = disciplinesQuery.data ?? [];""",
    """  // Une seule catégorie « Cours » → on liste TOUTES les disciplines dès que le
  // mode « discipline existante » est actif (le select catégorie qui amorçait
  // `categoryId` a été retiré). Le `categoryId` de la destination est dérivé de
  // la discipline choisie (onChange du select), pas l'inverse.
  const disciplinesQuery = trpc.discipline.getAll.useQuery(undefined, {
    enabled: destinationKind === 'existing-discipline',
  });
  const disciplines = disciplinesQuery.data ?? [];""",
    "query disciplines",
)

# 2) retrait du useEffect qui effaçait la sélection
sub(
    """  useEffect(() => {
    setValue('disciplineId', undefined as unknown as number);
  }, [categoryId, setValue]);
""",
    """""",
    "reset effect",
)

p.write_text(s, encoding="utf-8")
print("Appliqué.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
if git commit -m "fix(uploader): select discipline via getAll (une seule catégorie) + retrait du reset qui effaçait la sélection" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi