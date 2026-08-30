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
