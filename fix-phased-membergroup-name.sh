#!/usr/bin/env bash
#
# AKFC — Correctif Phase D : le router est monté sous `memberGroup` (singulier).
#
# CreateUserForm.tsx appelait `trpc.memberGroups.list` → n'existe pas (typecheck
# KO + `g: any` en cascade). On corrige en `trpc.memberGroup.list`. Le reste de
# la Phase D (page + mutation) était déjà écrit mais non committé (typecheck avant
# commit) → `git add -A` le capture avec ce correctif.
#
# Usage : bash fix-phaseD-membergroup-name.sh
#         AKFC_APPLY_ONLY=1 bash fix-phaseD-membergroup-name.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/admin/users/forms/CreateUserForm.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = "trpc.memberGroups.list.useQuery()"
new = "trpc.memberGroup.list.useQuery()"
if new in s:
    print("déjà corrigé"); sys.exit(0)
assert s.count(old) == 1, "ancre trpc.memberGroups.list introuvable/multiple"
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("corrigé : trpc.memberGroup.list")
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
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(auth): phase D — création d'utilisateur par groupe (adhésion) au lieu de rôle" \
  && echo "commit $(git rev-parse --short HEAD)"