#!/usr/bin/env bash
#
# AKFC — UserMenu : le dropdown déborde du viewport sur mobile.
#
# CAUSE : le panneau est `absolute right-0 top-10 w-60` — 240px ancrés à droite,
# sans plafond de largeur. Sur un écran étroit il sort de l'écran (scroll
# horizontal / débordement).
#
# FIX : plafonner la largeur au viewport — `max-w-[calc(100vw-1rem)]` (garde 240px
# quand ça rentre, se recadre en dessous sinon) + `origin-top-right`. On ne touche
# ni à l'ouverture (le tactile fonctionne) ni au contenu.
#
# 1 fichier, 1 ancre (className du panneau), typecheck web.
#
# Usage : bash fix-usermenu-dropdown-overflow.sh
#         AKFC_APPLY_ONLY=1 bash fix-usermenu-dropdown-overflow.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/app-shell/UserMenu.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

old = 'className="absolute right-0 top-10 w-60 bg-white border rounded shadow-md z-50"'
new = 'className="absolute right-0 top-10 w-60 max-w-[calc(100vw-1rem)] origin-top-right bg-white border rounded shadow-md z-50"'

if "max-w-[calc(100vw-1rem)]" in s:
    print("déjà recadré"); sys.exit(0)
assert s.count(old) == 1, "ancre className du panneau introuvable/multiple (colle-moi ton UserMenu.tsx actuel)"
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("dropdown recadré (max-w viewport)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(header): dropdown UserMenu plafonné au viewport (plus de débordement mobile)" \
  && echo "commit $(git rev-parse --short HEAD)"