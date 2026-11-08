-- Tags de personnes sur les médias, comparés au droit à l'image.
--
-- 1. MediaPerson : une personne taguée (à la main, par un admin) sur un média ; supprimée avec le
--    média ou le compte. Le vert / rouge n'est pas stocké, il est calculé à l'affichage.
-- 2. MediaAsset.noRecognizablePerson : « aucune personne reconnaissable » (vert partout).
-- 3. User.imageConsentRemindedAt : dernière relance, une au plus tous les 7 jours.
-- Aucune donnée existante modifiée : tous les médias restent publiés, « à taguer ».
ALTER TABLE "MediaAsset" ADD COLUMN "noRecognizablePerson" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "imageConsentRemindedAt" TIMESTAMP(3);

CREATE TABLE "MediaPerson" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taggedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "MediaPerson_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaPerson_mediaAssetId_userId_key" ON "MediaPerson"("mediaAssetId", "userId");
CREATE INDEX "MediaPerson_userId_idx" ON "MediaPerson"("userId");
CREATE INDEX "MediaPerson_notifiedAt_idx" ON "MediaPerson"("notifiedAt");

ALTER TABLE "MediaPerson" ADD CONSTRAINT "MediaPerson_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaPerson" ADD CONSTRAINT "MediaPerson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaPerson" ADD CONSTRAINT "MediaPerson_taggedById_fkey" FOREIGN KEY ("taggedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
