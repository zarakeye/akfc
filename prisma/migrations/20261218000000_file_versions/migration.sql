-- Versions des fichiers : remplacer un fichier en garde l'ancien contenu, copié sous
-- _versions/{mediaAssetId}/{id}. Les versions suivent leur fichier et partent avec lui.

CREATE TABLE "FileVersion" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "authorId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FileVersion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FileVersion_storageKey_key" ON "FileVersion"("storageKey");
CREATE INDEX "FileVersion_mediaAssetId_createdAt_idx" ON "FileVersion"("mediaAssetId", "createdAt");

ALTER TABLE "FileVersion" ADD CONSTRAINT "FileVersion_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FileVersion" ADD CONSTRAINT "FileVersion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
