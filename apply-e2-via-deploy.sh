#!/usr/bin/env bash
#
# AKFC — E2 via migrate deploy (contourne le bug d'historique gallery/shadow-DB).
#
# `migrate dev` échoue car il rejoue TOUT l'historique sur une shadow DB, et
# gallery_metadata (juillet) altère Gallery créée seulement en octobre. `migrate
# deploy`, lui, n'utilise pas de shadow DB : il applique les migrations EN ATTENTE
# sur ta base déjà à jour. On écrit donc la migration E2 à la main et on deploy.
#
# Ce que fait le script :
#   1. crée prisma/migrations/20261101000000_drop_role_permission_roleid/migration.sql
#      (DROP roleId + Role/Permission/RolePermissions) ;
#   2. `prisma migrate deploy` (applique — DESTRUCTIF, mais ciblé) ;
#   3. `prisma generate`.
# Pas de commit : tu vérifies l'app puis tu committes.
#
# Prérequis : le schéma est déjà en état post-E2 (sans Role) — via
# apply-auth-phaseE2-schema.sh. Sinon lance-le d'abord.
#
# Usage : bash apply-e2-via-deploy.sh
#
set -euo pipefail

MIG_DIR="prisma/migrations/20261101000000_drop_role_permission_roleid"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -d "prisma/migrations" ] || { echo "ERREUR: prisma/migrations introuvable." >&2; exit 1; }

# garde-fou : le schéma doit déjà être sans Role
if grep -q 'model Role {' prisma/schema.prisma; then
  echo "ERREUR: schema.prisma contient encore 'model Role' — lance d'abord apply-auth-phaseE2-schema.sh" >&2
  exit 1
fi

mkdir -p "$MIG_DIR"
cat > "$MIG_DIR/migration.sql" <<'SQL'
-- Auth passée aux groupes : suppression de Role / Permission / RolePermissions
-- et de User.roleId. Appliquée via `migrate deploy` (pas de shadow DB), pour
-- contourner l'incohérence d'historique gallery_metadata / add_galleries.
--
-- `DROP COLUMN "roleId"` retire aussi la FK qui en dépend (Postgres) ; le DROP
-- CONSTRAINT explicite reste par prudence. `IF EXISTS` partout = idempotent.

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_roleId_fkey";
ALTER TABLE "User" DROP COLUMN IF EXISTS "roleId";

DROP TABLE IF EXISTS "RolePermissions";
DROP TABLE IF EXISTS "Role";
DROP TABLE IF EXISTS "Permission";
SQL
echo "migration écrite : $MIG_DIR/migration.sql"
echo "--- SQL ---"; cat "$MIG_DIR/migration.sql"; echo "-----------"

echo
echo "prisma migrate deploy… (applique la migration en attente sur ta base locale)"
if ! pnpm prisma migrate deploy > /tmp/akfc_deploy.log 2>&1; then
  echo "migrate deploy KO :"; tail -25 /tmp/akfc_deploy.log; exit 1
fi
grep -iE 'Applying|migration|following' /tmp/akfc_deploy.log | tail -8 || true
echo "OK — migration appliquée."

echo "prisma generate…"
if ! pnpm prisma generate > /tmp/akfc_gen.log 2>&1; then
  echo "generate KO :"; tail -15 /tmp/akfc_gen.log; exit 1
fi
echo "OK."

echo
echo "════════ SUITE ════════"
echo "1) Vérifie l'app en local : login, accès admin, dashboard, création user par groupe."
echo "2) `pnpm prisma migrate status` doit être vert (schéma en phase avec la base)."
echo "3) Commit :"
echo "     git add -A && git commit -m \"feat(auth): phase E2 — schéma sans Role/Permission/roleId + migration\""
echo "4) DISTANT (après merge + sauvegarde DB) : git pull puis `prisma migrate deploy` avec la recette PG_IP."
echo
echo "NB : `migrate dev` restera cassé tant que l'historique gallery n'est pas rebaselé —"
echo "     dis-moi et je te guide le baseline (local + resolve prod) pour le restaurer."