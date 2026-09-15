#!/usr/bin/env bash
#
# AKFC — Fix carrousel : centrage réellement au centre (largeur live).
#
# Cause racine : au 1er rendu, le composant renvoie null (fetch en cours) → le
# conteneur n'est pas monté → l'effet de mesure (deps vides) abandonne et ne se
# relance jamais → `cw` reste à 1000 (défaut) → half=500 → tout est décalé vers
# la gauche. (La maquette n'a pas ce null → elle mesurait juste.)
#
# Fix : lire la largeur RÉELLE du conteneur à chaque frame (clientWidth) dans
# layout(), au lieu d'une valeur mémorisée périmable.
#
# Périmètre : HomeCarousel.tsx. Un typecheck.
# Usage : bash apply-carousel-fix-live-width.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/app-shell/HomeCarousel.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

old = """    const cw = cwRef.current;
    const half = cw / 2;"""
new = """    // Largeur LIVE du conteneur (jamais périmée). Le composant renvoie null tant
    // que le fetch n'a pas résolu, donc la mesure par effet peut ne jamais avoir
    // lieu ; on lit donc clientWidth ici, à chaque frame.
    const cw = containerRef.current?.clientWidth || cwRef.current;
    const half = cw / 2;"""
assert s.count(old) == 1, f"ancre cw ×{s.count(old)}"
p.write_text(s.replace(old, new), encoding="utf-8")
print("HomeCarousel.tsx : largeur live dans layout().")
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
git commit -m "fix(home): carrousel centré (largeur conteneur lue en direct, plus de cw périmé)" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }