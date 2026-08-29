#!/usr/bin/env bash
#
# AKFC — Auth role→groupe, PHASE B (middlewares) : bascule sur `user.isAdmin`.
#
# `isAdmin` ET `requirePermission` lisent désormais `user.isAdmin` (la source
# groupe posée en phase A) au lieu de `user.role`. `requirePermission(name)`
# GARDE sa signature — le nom devient purement informatif dans le message — donc
# les ~100 sites d'appel ne changent pas. Comme les 11 permissions étaient toutes
# ADMIN-only, ce basculement est NEUTRE (isAdmin-groupe == ancien role-admin).
#
# 1 fichier (middleware.ts), typecheck backend + web.
#
# Après application, teste ton accès admin (dashboard, une route protégée) : s'il
# marche, isAdmin est correct. Sinon → revert (on est sur la branche).
#
# Usage : bash apply-auth-phaseB-middlewares.sh
#         AKFC_APPLY_ONLY=1 bash apply-auth-phaseB-middlewares.sh   (clone)
#
set -euo pipefail

F="packages/backend/src/trpc/middleware.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "⚠️  Tu es sur '$BRANCH' — attendu : feat/auth-role-to-group. (Ctrl-C pour annuler.)"; sleep 3
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "user.isAdmin" in s:
    print("middleware : déjà basculé sur user.isAdmin"); sys.exit(0)

# 1. requirePermission → check user.isAdmin (name conservé dans le message)
rp_old = (
    "    const permissions = user.role?.permissions ?? [];\n"
    "    const hasPermission = permissions.includes(permissionName);\n"
    "\n"
    "    if (!hasPermission) {\n"
)
assert s.count(rp_old) == 1, "ancre requirePermission introuvable/multiple"
rp_new = (
    "    // Auth collapsée sur le groupe Administrateurs : toute permission ⇒\n"
    "    // réservé aux admins (source unique user.isAdmin). Signature conservée →\n"
    "    // les sites d'appel `requirePermission(...)` ne changent pas.\n"
    "    if (!user.isAdmin) {\n"
)
s = s.replace(rp_old, rp_new)

# 2. isAdmin middleware → check user.isAdmin
ia_old = '  if (user.role?.name !== "ADMIN") {\n'
assert s.count(ia_old) == 1, "ancre isAdmin middleware introuvable/multiple"
s = s.replace(ia_old, "  if (!user.isAdmin) {\n")

p.write_text(s, encoding="utf-8")
print("middleware : isAdmin + requirePermission lisent user.isAdmin")
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
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(auth): phase B — middlewares isAdmin/requirePermission lisent user.isAdmin (groupe), signatures inchangées" \
  && echo "commit $(git rev-parse --short HEAD)"