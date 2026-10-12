-- Sortie de Cloudinary : colonnes devenues inutiles (tous les fichiers sont sur R2).
-- La trace de l'ancien identifiant reste dans "legacyCloudinaryPublicId".
DROP INDEX IF EXISTS "MediaAsset_publicId_key";
DROP INDEX IF EXISTS "MediaAsset_cloudinaryAssetId_key";
ALTER TABLE "MediaAsset" DROP COLUMN "publicId",
DROP COLUMN "secureUrl",
DROP COLUMN "resourceType",
DROP COLUMN "cloudinaryAssetId";
