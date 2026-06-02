-- CreateEnum
CREATE TYPE "PageReferencerKind" AS ENUM ('COURSE', 'STAGE_DESCRIPTION', 'STAGE_PROGRAM', 'POST');

-- CreateTable
CREATE TABLE "PageMediaReference" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "pageType" "PageReferencerKind" NOT NULL,
    "pageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageMediaReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageMediaReference_pageType_pageId_idx" ON "PageMediaReference"("pageType", "pageId");

-- CreateIndex
CREATE UNIQUE INDEX "PageMediaReference_mediaAssetId_pageType_pageId_key" ON "PageMediaReference"("mediaAssetId", "pageType", "pageId");

-- AddForeignKey
ALTER TABLE "PageMediaReference" ADD CONSTRAINT "PageMediaReference_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
