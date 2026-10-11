-- Dernière connexion (comptes inactifs à examiner, durées de conservation RGPD).
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
-- Reprise : la session la plus récente encore en base.
UPDATE "User" u SET "lastLoginAt" = s.last
FROM (SELECT "userId", MAX("createdAt") AS last FROM "Session" GROUP BY "userId") s
WHERE s."userId" = u.id;
