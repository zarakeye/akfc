#!/usr/bin/env bash
#
# AKFC — Fix carrousel : centrage exact + émergence des bords.
#
# layout() interpolait la position de p* LINÉAIREMENT sur toute la cellule
# (tuile + gap). Comme la tuile est scalée mais pas le gap, le centre d'une
# tuile ne tombait pas sur son centre scalé → grossissement max décalé (vers
# la gauche) + couverture asymétrique (image qui « pop » à droite).
#
# Fix : interpolation PAR MORCEAUX (tuile scalée par s, gap non scalé) → le
# centre d'une tuile mappe exactement sur son centre scalé (centrage juste) ;
# marge de rendu 1.6→2.2 (émergence franche des deux fondus).
#
# Périmètre : HomeCarousel.tsx. Un typecheck.
# Usage : bash apply-carousel-fix-centering.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/app-shell/HomeCarousel.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

old = """    const f = (pstar - list[i0].base) / (list[i0].w + GAP);
    const scaledLeft = sc[i0] - (list[i0].w * s[i0]) / 2;
    const pstarScaled = scaledLeft + f * (list[i0].w * s[i0] + GAP);"""
new = """    // interpolation PAR MORCEAUX : tuile scalée par s, gap non scalé → le
    // centre d'une tuile mappe exactement sur son centre scalé (centrage juste).
    const scaledLeft = sc[i0] - (list[i0].w * s[i0]) / 2;
    const localRuban = pstar - list[i0].base;
    const pstarScaled =
      localRuban <= list[i0].w
        ? scaledLeft + localRuban * s[i0]
        : scaledLeft + list[i0].w * s[i0] + (localRuban - list[i0].w);"""
assert s.count(old) == 1, f"ancre pstarScaled ×{s.count(old)}"
s = s.replace(old, new)

c = s.count("cw * 1.6")
assert c >= 1, "ancre marge cw * 1.6 introuvable"
s = s.replace("cw * 1.6", "cw * 2.2")

p.write_text(s, encoding="utf-8")
print(f"HomeCarousel.tsx : centrage par morceaux + marge 2.2 ({c} occurrence(s)).")
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
git commit -m "fix(home): carrousel centrage exact (interpolation par morceaux) + émergence des bords" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }