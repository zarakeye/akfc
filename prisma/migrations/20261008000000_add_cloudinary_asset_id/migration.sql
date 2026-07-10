-- AlterTable: ajoute la colonne cloudinaryAssetId à MediaAsset
ALTER TABLE "MediaAsset" ADD COLUMN "cloudinaryAssetId" TEXT;

-- CreateIndex: contrainte d'unicité sur cloudinaryAssetId
CREATE UNIQUE INDEX "MediaAsset_cloudinaryAssetId_key" ON "MediaAsset"("cloudinaryAssetId");
