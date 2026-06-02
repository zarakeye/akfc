-- Migration: add_full_path_to_media_asset
--
-- Étape 1 du chantier Phase 2 (tracking R2). On prépare le schéma pour
-- pouvoir tracker à la fois Cloudinary ET R2 dans la même table MediaAsset.
--
-- Changements :
--   1. Ajout d'une nouvelle colonne `fullPath` (nullable pour cette migration)
--      qui deviendra la CLÉ UNIVERSELLE pour identifier un asset, peu
--      importe le backend de stockage.
--   2. Backfill SQL inline : pour toutes les rows existantes (qui sont
--      forcément Cloudinary à ce stade), on calcule `fullPath = publicId + format`.
--   3. Assouplissement des champs Cloudinary-only (publicId, secureUrl,
--      resourceType) qui deviennent nullable — R2 n'a pas ces concepts.
--   4. Ajout d'un index composite (appRoot, fullPath) pour accélérer
--      `searchRecursive` qui filtre justement par ces deux colonnes.
--
-- La 2e migration (`tighten_full_path`) viendra ensuite, à appliquer
-- APRÈS avoir lancé le backfill R2 — elle rendra `fullPath` NOT NULL
-- et UNIQUE. Garder les deux migrations séparées permet de laisser
-- aux fichiers R2 historiques le temps d'être trackés sans casser la
-- contrainte d'unicité prématurément.

BEGIN;

-- 1. Add fullPath column (nullable temporairement)
ALTER TABLE "MediaAsset" ADD COLUMN "fullPath" TEXT;

-- 2. Backfill Cloudinary existants : fullPath = publicId + (format ? '.' + format : '')
-- Cette opération est idempotente (filtré sur fullPath IS NULL).
UPDATE "MediaAsset"
SET "fullPath" = "publicId" || COALESCE('.' || "format", '')
WHERE "fullPath" IS NULL AND "publicId" IS NOT NULL;

-- 3. Relax Cloudinary-only fields to nullable
ALTER TABLE "MediaAsset" ALTER COLUMN "publicId" DROP NOT NULL;
ALTER TABLE "MediaAsset" ALTER COLUMN "secureUrl" DROP NOT NULL;
ALTER TABLE "MediaAsset" ALTER COLUMN "resourceType" DROP NOT NULL;

-- 4. Add index pour optimiser searchRecursive (filtre appRoot + startsWith fullPath)
CREATE INDEX "MediaAsset_appRoot_fullPath_idx" ON "MediaAsset"("appRoot", "fullPath");

COMMIT;
