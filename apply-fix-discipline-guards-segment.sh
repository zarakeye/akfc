#!/usr/bin/env bash
#
# AKFC — Aligne les GARDES discipline sur categoryStorageSegment (courses, pas cours).
#
# Le résolveur d'upload est corrigé (inc3 : Cours→courses), mais deux gardes
# construisaient encore le chemin catégorie via `slug(cat.type)` = `cours` :
#   - disciplines/router.ts (contrôle « dossier vide » avant rename/delete) ;
#   - protectedDisciplineFolder.ts (protection des dossiers catégorie/discipline).
# Résultat : elles visaient `cours/…` alors que les vrais dossiers sont
# `courses/…` → contrôles/protection à côté. On passe le SEGMENT CATÉGORIE par
# `categoryStorageSegment` (le slug du NOM de discipline reste `slug()`).
#
# NB : ceci corrige la cohérence des gardes ; la RÉAPPARITION de `cours`/`stage`
# vient d'une IMAGE PÉRIMÉE (résolveur d'upload pré-inc1/inc3) → rebuild propre.
#
# Périmètre : BACKEND. Un aller-retour = un typecheck.
# Usage : bash apply-fix-discipline-guards-segment.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
P="packages/backend/src/modules/storage/protectedDisciplineFolder.ts"
D="packages/backend/src/modules/disciplines/router.ts"
[ -f "$P" ] || { echo "ERREUR: $P introuvable." >&2; exit 1; }
[ -f "$D" ] || { echo "ERREUR: $D introuvable." >&2; exit 1; }
if grep -q 'categoryStorageSegment' "$P" 2>/dev/null; then echo "— déjà appliqué"; exit 0; fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$P" "$D" <<'PY'
import sys, pathlib
P, D = sys.argv[1], sys.argv[2]
IMPORT = 'import { categoryStorageSegment } from "@backend/modules/cloudinary/services/categoryStorageSegment";'

def edit(path, subs, add_import_after):
    p = pathlib.Path(path); s = p.read_text(encoding="utf-8")
    # import
    assert s.count(add_import_after) == 1, f"{path}: ancre import"
    s = s.replace(add_import_after, add_import_after + "\n" + IMPORT, 1)
    for old, new in subs:
        assert s.count(old) == 1, f"{path}: ancre « {old[:50]} »"
        s = s.replace(old, new)
    p.write_text(s, encoding="utf-8")
    print(f"  ok  {path}")

# protectedDisciplineFolder.ts
edit(P,
     [
       ("    return cats.some((c) => slug(c.type) === segs[0]);",
        "    return cats.some((c) => categoryStorageSegment(c.type) === segs[0]);"),
       ("    ).find((c) => slug(c.type) === catSeg);",
        "    ).find((c) => categoryStorageSegment(c.type) === catSeg);"),
     ],
     'import slugify from "slugify";')

# disciplines/router.ts
edit(D,
     [
       ("`${ctx.appRoot}/${slug(cat.type)}/${slug(disc.name) || `disc-${disc.id}`}`",
        "`${ctx.appRoot}/${categoryStorageSegment(cat.type)}/${slug(disc.name) || `disc-${disc.id}`}`"),
     ],
     'import slugify from "slugify";')

print("Gardes alignées sur categoryStorageSegment.")
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
if git commit -m "fix(disciplines): gardes rename/delete + protection via categoryStorageSegment (courses, pas cours)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi