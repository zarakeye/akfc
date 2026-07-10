-- CreateEnum
CREATE TYPE "Visibility" AS ENUM
('PUBLIC', 'MEMBERS');

-- CreateTable
CREATE TABLE "Gallery"
(
  "id" SERIAL NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT,
  "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "disciplineId" INTEGER,
  "stageId" INTEGER,
  "eventId" INTEGER,

  CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryItem"
(
  "id" SERIAL NOT NULL,
  "galleryId" INTEGER NOT NULL,
  "mediaAssetId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gallery_slug_key" ON "Gallery"("slug");
CREATE INDEX "Gallery_sortOrder_idx" ON "Gallery"("sortOrder");
CREATE UNIQUE INDEX "GalleryItem_galleryId_mediaAssetId_key" ON "GalleryItem"("galleryId", "mediaAssetId");
CREATE INDEX "GalleryItem_galleryId_sortOrder_idx" ON "GalleryItem"("galleryId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;