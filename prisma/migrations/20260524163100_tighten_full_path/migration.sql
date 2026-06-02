-- Migration: tighten_full_path
--
-- ⚠️ NE PAS APPLIQUER tant que le backfill R2 (`/api/admin/backfill-r2-assets`)
--    n'a pas été exécuté avec succès. Cette migration met `fullPath` en
--    NOT NULL — elle plantera si des rows ont encore `fullPath = NULL`
--    (typiquement les fichiers R2 historiques pas encore trackés).
--
-- Workflow attendu :
--   1. Appliquer la migration `add_full_path_to_media_asset` (backfill
--      Cloudinary inline → tous les rows Cloudinary ont fullPath)
--   2. Hit `/api/admin/backfill-r2-assets` (création MediaAsset pour les
--      fichiers R2 historiques avec fullPath = R2 key)
--   3. Vérifier qu'aucune row n'a fullPath NULL :
--      SELECT count(*) FROM "MediaAsset" WHERE "fullPath" IS NULL;
--      Doit retourner 0.
--   4. Alors appliquer cette migration.
--
-- Après cette migration, `fullPath` devient la VRAIE clé universelle
-- des MediaAssets — c'est elle qui sert dans toutes les queries du
-- module `media` (getByPaths, searchRecursive, updateDescription).

BEGIN;

-- 1. Verrouille NOT NULL — plantera si fullPath = NULL quelque part
ALTER TABLE "MediaAsset" ALTER COLUMN "fullPath" SET NOT NULL;

-- 2. Verrouille UNIQUE
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_fullPath_key" UNIQUE ("fullPath");

COMMIT;
