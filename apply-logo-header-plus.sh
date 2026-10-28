#!/usr/bin/env bash
# HEADER : logo encore agrandi, barre de MÊME hauteur (92 / 112 / 180 px selon le palier).
#   Le logo porte sa propre pastille noire (fond du header noir) : le rembourrage vertical tombe à 4 px
#   (8 px au palier 2xl) et le carré du logo prend toute la place libérée :
#     défaut 76 → 84 px   xl 80 → 104 px   2xl 120 → 164 px
# À lancer après apply-logo-final.sh (marche aussi sans). Usage (racine du repo) : bash apply-logo-header-plus.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }
H="apps/web/src/features/app-shell/Header.tsx"
if grep -q "h-21 w-21 object-contain" "$H"; then echo "Déjà appliqué."; exit 0; fi
restore(){ git checkout -q -- "$H" 2>/dev/null || true; echo "  ↩ fichier restauré"; }
trap 'restore' ERR

python3 - <<'PY'
import re
H = "apps/web/src/features/app-shell/Header.tsx"
s = open(H, encoding="utf-8").read()
def edit(pattern, repl, n):
    global s
    found = len(re.findall(pattern, s))
    assert found == n, (pattern[:70], found)
    s = re.sub(pattern, repl, s)
# conteneur du logo : rembourrage vertical réduit (horizontal inchangé)
edit(r'<div className="flex items-center px-4 py-\S+ xl:px-6 xl:py-\S+ 2xl:px-20 2xl:py-\S+">',
     '<div className="flex items-center px-4 py-1 xl:px-6 xl:py-1 2xl:px-20 2xl:py-2">', 1)
# les deux images du logo (personnalisé + secours)
edit(r'className="h-\d+ w-(?:auto|\d+)(?: object-contain)? xl:h-\d+(?: xl:w-\d+)? 2xl:h-\d+(?: 2xl:w-\d+)?"',
     'className="h-21 w-21 object-contain xl:h-26 xl:w-26 2xl:h-41 2xl:w-41"', 2)
s = s.replace("(hauteur de barre inchangée : 92 / 112 / 180 px selon le palier)",
              "(hauteur de barre inchangée : 92 / 112 / 180 px selon le palier ; logo 84 / 104 / 164 px)")
open(H, "w", encoding="utf-8").write(s)
print("  édits ok (Header.tsx)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
echo "== pnpm check =="
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"
  grep -nE "error TS|ERR_|Error:|EACCES|Permission denied" /tmp/akfc_tc.log | head -12
  echo "  … fin du journal :"; grep -v '^[[:space:]]*$' /tmp/akfc_tc.log | tail -8
  restore; exit 1
fi
echo "  ✅ check OK"
git add "$H"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
style(header): logo encore agrandi, barre de même hauteur

Rembourrage vertical du logo réduit à 4 px (8 px en 2xl) ; le carré du
logo prend la place libérée : 84 / 104 / 164 px selon le palier (au lieu
de 76 / 80 / 120). Hauteur de la barre inchangée.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Vérifier (Cmd+Maj+R)."