#!/usr/bin/env bash
#
# AKFC — Fix carrousel : période de bouclage (couture) correcte.
#
# La période scalée SW avait un « + demi-première tuile » en trop → à la couture,
# écart parasite (~143px au lieu du GAP 22) + bond en fin de cycle + pop des
# tuiles proches de la couture. Correct : SW = sc[n-1] + demi-dernière + GAP.
# (Vérifié numériquement : écart couture = 22px, transition couture = interne.)
#
# Périmètre : HomeCarousel.tsx. Un typecheck.
# Usage : bash apply-carousel-fix-seam.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/app-shell/HomeCarousel.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

old = """    const SW =
      sc[n - 1] + (list[n - 1].w * s[n - 1]) / 2 + GAP + (list[0].w * s[0]) / 2;"""
new = """    const SW = sc[n - 1] + (list[n - 1].w * s[n - 1]) / 2 + GAP;"""
assert s.count(old) == 1, f"ancre SW ×{s.count(old)}"
p.write_text(s.replace(old, new), encoding="utf-8")
print("HomeCarousel.tsx : SW corrigé (couture = GAP).")
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
git commit -m "fix(home): carrousel — période de bouclage correcte (fin du bond/pop à la couture)" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }