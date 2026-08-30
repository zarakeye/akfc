#!/usr/bin/env bash
#
# AKFC — Correctif E1b : 2 lecteurs `role.permissions` résiduels.
#
# CollaborativeBell et NotificationBell dérivaient un statut de
# `role.permissions.length > 0` (« a des permissions »). Les permissions étant
# toutes ADMIN-only, ça équivaut à `isAdmin`. On bascule → sémantique préservée.
# (NotificationBell avait déjà eu son check `role.name` migré en C1 ; il restait
#  la ligne `canSee`.)
#
# Le reste de la phase E1b était écrit mais non committé (typecheck web KO avant
# commit) → `git add -A` le capture avec ce correctif.
#
# Usage : bash fix-phaseE1b-residual-role.sh
#         AKFC_APPLY_ONLY=1 bash fix-phaseE1b-residual-role.sh   (clone)
#
set -euo pipefail

CB="apps/web/src/features/app-shell/CollaborativeBell.tsx"
NB="apps/web/src/features/app-shell/NotificationBell.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$CB" "$NB"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

python3 - <<'PY'
import pathlib, sys

EDITS = [
    ("apps/web/src/features/app-shell/CollaborativeBell.tsx",
     "  const isManager = (user?.role?.permissions?.length ?? 0) > 0;",
     "  const isManager = user?.isAdmin ?? false;"),
    ("apps/web/src/features/app-shell/NotificationBell.tsx",
     "  const canSee = (user?.role?.permissions.length ?? 0) > 0;",
     "  const canSee = user?.isAdmin ?? false;"),
]
for path, old, new in EDITS:
    p = pathlib.Path(path); s = p.read_text(encoding="utf-8")
    if new in s:
        print(f"— {path}: déjà corrigé"); continue
    if old not in s:
        print(f"ERREUR: ancre introuvable dans {path} (colle-moi la ligne)", file=sys.stderr); sys.exit(1)
    assert s.count(old) == 1, f"ancre multiple dans {path}"
    p.write_text(s.replace(old, new), encoding="utf-8")
    print(f"✓ {path}")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|role" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "refactor(auth): phase E1b — role retiré de la session/auth (types, login, session loading)" \
  && echo "commit $(git rev-parse --short HEAD)"