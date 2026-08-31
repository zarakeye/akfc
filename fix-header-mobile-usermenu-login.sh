#!/usr/bin/env bash
#
# AKFC — Fixes header mobile : dropdown UserMenu + marge droite du login.
#
#   1. UserMenu : le panneau déroulant est ancré `right-0`, mais dans le pied du
#      panneau burger (mobile) le wrapper est calé à gauche → le panneau de 240px
#      déborde vers la gauche/en bas. On l'ancre à gauche par défaut, à droite
#      seulement en xl : `right-0` → `left-0 xl:left-auto xl:right-0`.
#
#   2. Header : le logo est inset à gauche (`px-4`), mais le bloc auth desktop
#      (LoginForm / UserMenu) n'a aucune marge droite → le form colle au bord.
#      On ajoute `pr-4 xl:pr-6` pour répondre au padding du logo.
#
# 1 ancre par fichier, front, typecheck web.
#
# Usage : bash fix-header-mobile-usermenu-login.sh
#         AKFC_APPLY_ONLY=1 bash fix-header-mobile-usermenu-login.sh   (clone)
#
set -euo pipefail

MENU="apps/web/src/features/app-shell/UserMenu.tsx"
HEADER="apps/web/src/features/app-shell/Header.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$MENU" ]        || { echo "ERREUR: $MENU introuvable." >&2; exit 1; }
[ -f "$HEADER" ]      || { echo "ERREUR: $HEADER introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. UserMenu : ancrage du panneau ─────────────────────────────────────────
python3 - "$MENU" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = '<div className="absolute right-0 top-10 w-60 max-w-[calc(100vw-1rem)] origin-top-right bg-white border rounded shadow-md z-50">'
new = '<div className="absolute left-0 top-10 w-60 max-w-[calc(100vw-1rem)] origin-top-left xl:left-auto xl:right-0 xl:origin-top-right bg-white border rounded shadow-md z-50">'
if "xl:left-auto" in s:
    print("UserMenu : déjà corrigé"); sys.exit(0)
assert s.count(old) == 1, "ancre panneau UserMenu introuvable"
p.write_text(s.replace(old, new), encoding="utf-8")
print("UserMenu : panneau ancré à gauche (mobile) / droite (xl)")
PY

# ── 2. Header : marge droite du bloc auth desktop ───────────────────────────
python3 - "$HEADER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = '<div className="hidden shrink-0 xl:block">'
new = '<div className="hidden shrink-0 pr-4 xl:block xl:pr-6">'
if 'xl:block xl:pr-6' in s or 'pr-4 xl:block' in s:
    print("Header : marge droite déjà présente"); sys.exit(0)
assert s.count(old) == 1, "ancre bloc auth desktop introuvable"
p.write_text(s.replace(old, new), encoding="utf-8")
print("Header : marge droite ajoutée au bloc auth")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(header): dropdown UserMenu ancré correctement en mobile + marge droite du login" \
  && echo "commit $(git rev-parse --short HEAD)"