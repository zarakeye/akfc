-- Présentation publique des instructeurs titulaires.
-- Ecrite a la main : l'utilisateur Postgres du projet n'a pas CREATEDB.
ALTER TABLE "User" ADD COLUMN "instructorBio" JSONB;
ALTER TABLE "User" ADD COLUMN "instructorOrder" INTEGER;
