#!/usr/bin/env bash
#
# AKFC — Auth role→groupe, PHASE E2 (schéma) : retrait Role/Permission/roleId.
#
# ⚠️ ÉTAPE IRRÉVERSIBLE côté données — mais ce script NE migre PAS et NE committe
# PAS. Il se contente de :
#   1. éditer schema.prisma : retirer User.roleId, User.role, et les modèles
#      Permission / Role / RolePermissions ;
#   2. `pnpm prisma generate` (client régénéré sans ces types) ;
#   3. typecheck backend + web (confirme que le code post-E1 ne les référence plus).
#
# La MIGRATION et le COMMIT se font à la main, ensuite (cf. instructions à la fin) —
# local d'abord, distant seulement après merge et sauvegarde.
#
# Usage : bash apply-auth-phaseE2-schema.sh
#         AKFC_APPLY_ONLY=1 bash apply-auth-phaseE2-schema.sh   (clone, sans generate/typecheck)
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$SCHEMA" ]      || { echo "ERREUR: $SCHEMA introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "⚠️  Tu es sur '$BRANCH' — attendu : feat/auth-role-to-group. (Ctrl-C pour annuler.)"; sleep 3
  fi
fi

python3 - "$SCHEMA" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "model Role {" not in s and "roleId" not in s:
    print("schema : déjà nettoyé"); sys.exit(0)

edits = [
    # User.roleId
    ("  roleId                Int?\n", ""),
    # User.role relation
    ("  role                  Role?                @relation(fields: [roleId], references: [id])\n", ""),
    # les 3 modèles (bloc contigu)
    ("model Permission {\n"
     "  id          Int               @id @default(autoincrement())\n"
     "  name        String            @unique\n"
     "  description String?\n"
     "  roles       RolePermissions[]\n"
     "}\n"
     "\n"
     "model Role {\n"
     "  id          Int               @id @default(autoincrement())\n"
     "  name        String            @unique\n"
     "  description String?\n"
     "  permissions RolePermissions[]\n"
     "  users       User[]\n"
     "}\n"
     "\n"
     "model RolePermissions {\n"
     "  roleId       Int\n"
     "  permissionId Int\n"
     "  permission   Permission @relation(fields: [permissionId], references: [id])\n"
     "  role         Role       @relation(fields: [roleId], references: [id])\n"
     "\n"
     "  @@id([roleId, permissionId])\n"
     "}\n",
     ""),
]
for old, new in edits:
    if old not in s:
        print(f"ERREUR: ancre schema introuvable :\n{old[:60]}...", file=sys.stderr); sys.exit(1)
    assert s.count(old) == 1, f"ancre multiple : {old[:40]}"
    s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("schema.prisma : User.roleId/role + modèles Permission/Role/RolePermissions retirés")
PY

# garde-fou : plus aucune trace dans le schéma
if grep -nE '\bRole\b|\bPermission\b|roleId|RolePermissions' "$SCHEMA" >/dev/null 2>&1; then
  echo "ATTENTION, traces restantes dans le schéma :"; grep -nE '\bRole\b|\bPermission\b|roleId|RolePermissions' "$SCHEMA"
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de generate/typecheck/commit"; exit 0
fi

echo "prisma generate…"
if ! pnpm prisma generate > /tmp/akfc_gen.log 2>&1; then
  echo "prisma generate KO :"; tail -15 /tmp/akfc_gen.log; exit 1
fi
echo "OK"

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Role|Permission|roleId" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK — schéma cohérent avec le code."

echo
echo "════════ SUITE MANUELLE (rien n'est committé ni migré) ════════"
echo "1) Nettoie prisma/seed.js : retire la création des rôles/permissions/GUEST"
echo "   (garde ensureAdminGroup / le groupe Administrateurs). Colle-le-moi si tu veux."
echo "2) Migration LOCALE (destructive — Prisma demandera confirmation) :"
echo "     pnpm prisma migrate dev --name drop_role_permission_roleid --skip-seed"
echo "3) Vérifie l'app en local (login, admin, dashboard)."
echo "4) Commit : git add -A && git commit -m \"feat(auth): phase E2 — schéma sans Role/Permission/roleId\""
echo "5) Merge la branche, puis DISTANT (après sauvegarde DB) : migrate deploy avec la recette PG_IP."