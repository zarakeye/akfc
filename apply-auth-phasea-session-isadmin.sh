#!/usr/bin/env bash
#
# AKFC — Auth role→groupe, PHASE A (session) : expose `user.isAdmin` (additif).
#
# `getSessionFromRequest` calcule désormais `isAdmin` = « membre du groupe
# Administrateurs (isAdminGroup) » et le pose sur la session, À CÔTÉ de `role`.
# Rien ne le lit encore → AUCUN changement de comportement. C'est la nouvelle
# source de vérité, prête pour les phases B/C.
#
#   1. contracts/session.types.ts   — `isAdmin: boolean` sur le user de session.
#   2. getSessionFromRequest.ts      — calcul (1 findFirst indexé) + passage au mapper.
#
# Seul constructeur de SessionClient = ce mapper (le login bâtit un
# UserEnhancedStrict distinct), donc rien d'autre à toucher.
#
# 2 fichiers, typecheck backend + web. Branche feat/auth-role-to-group, local.
#
# Usage : bash apply-auth-phaseA-session-isadmin.sh
#         AKFC_APPLY_ONLY=1 bash apply-auth-phaseA-session-isadmin.sh   (clone)
#
set -euo pipefail

TYPES="packages/contracts/src/auth/session.types.ts"
GSFR="packages/backend/src/modules/auth/getSessionFromRequest.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$TYPES" ]       || { echo "ERREUR: $TYPES introuvable." >&2; exit 1; }
[ -f "$GSFR" ]        || { echo "ERREUR: $GSFR introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "⚠️  Tu es sur '$BRANCH' — attendu : feat/auth-role-to-group. (Ctrl-C pour annuler.)"; sleep 3
  fi
fi

# ── 1. Type de session ───────────────────────────────────────────────────────
python3 - "$TYPES" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isAdmin" in s:
    print("session.types : isAdmin déjà présent"); sys.exit(0)
old = "    isFirstLogin: boolean;\n    role: {\n"
assert s.count(old) == 1, "ancre isFirstLogin/role introuvable/multiple (session.types)"
s = s.replace(old, "    isFirstLogin: boolean;\n    isAdmin: boolean;\n    role: {\n")
p.write_text(s, encoding="utf-8")
print("session.types : isAdmin ajouté")
PY

# ── 2. getSessionFromRequest ─────────────────────────────────────────────────
python3 - "$GSFR" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isAdminGroup" in s:
    print("getSessionFromRequest : déjà patché (isAdmin)"); sys.exit(0)

# 2a. signature du mapper
sig_old = "function mapSessionDBToSessionClient(session: SessionDB): SessionClient {\n"
assert s.count(sig_old) == 1, "ancre signature mapper introuvable/multiple"
s = s.replace(
    sig_old,
    "function mapSessionDBToSessionClient(\n"
    "  session: SessionDB,\n"
    "  isAdmin: boolean,\n"
    "): SessionClient {\n",
)

# 2b. champ isAdmin dans le user renvoyé
usr_old = (
    "      isFirstLogin: session.user!.isFirstLogin,\n"
    "      role: role\n"
)
assert s.count(usr_old) == 1, "ancre champ isFirstLogin (mapper) introuvable/multiple"
s = s.replace(
    usr_old,
    "      isFirstLogin: session.user!.isFirstLogin,\n"
    "      isAdmin,\n"
    "      role: role\n",
)

# 2c. calcul + passage
call_old = (
    "  if (!sessionDB.user) {\n"
    "    return null;\n"
    "  }\n"
    "\n"
    "  return mapSessionDBToSessionClient(sessionDB);\n"
)
assert s.count(call_old) == 1, "ancre appel mapper introuvable/multiple"
call_new = (
    "  if (!sessionDB.user) {\n"
    "    return null;\n"
    "  }\n"
    "\n"
    "  // Source de vérité « admin » : appartenance au groupe Administrateurs\n"
    "  // (isAdminGroup). Additif — remplacera le check sur le rôle (phases B/C).\n"
    "  const isAdmin =\n"
    "    (await prisma.memberGroupMembership.findFirst({\n"
    "      where: { userId: sessionDB.user.id, group: { isAdminGroup: true } },\n"
    "      select: { id: true },\n"
    "    })) !== null;\n"
    "\n"
    "  return mapSessionDBToSessionClient(sessionDB, isAdmin);\n"
)
s = s.replace(call_old, call_new)

p.write_text(s, encoding="utf-8")
print("getSessionFromRequest : isAdmin calculé + exposé")
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
git commit -m "feat(auth): phase A — session.user.isAdmin dérivé du groupe Administrateurs (additif)" \
  && echo "commit $(git rev-parse --short HEAD)"