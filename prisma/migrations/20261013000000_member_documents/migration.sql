-- CreateEnum
CREATE TYPE "DocumentAudience" AS ENUM ('ALL_MEMBERS', 'SPECIFIC');

-- CreateTable
CREATE TABLE "MemberDocument" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "title" TEXT,
    "audience" "DocumentAudience" NOT NULL DEFAULT 'ALL_MEMBERS',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedById" TEXT,

    CONSTRAINT "MemberDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberDocumentRecipient" (
    "id" TEXT NOT NULL,
    "memberDocumentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MemberDocumentRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentReceipt" (
    "id" TEXT NOT NULL,
    "memberDocumentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "DocumentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberDocument_mediaAssetId_key" ON "MemberDocument"("mediaAssetId");
CREATE INDEX "MemberDocument_audience_idx" ON "MemberDocument"("audience");
CREATE UNIQUE INDEX "MemberDocumentRecipient_memberDocumentId_userId_key" ON "MemberDocumentRecipient"("memberDocumentId", "userId");
CREATE INDEX "MemberDocumentRecipient_userId_idx" ON "MemberDocumentRecipient"("userId");
CREATE UNIQUE INDEX "DocumentReceipt_memberDocumentId_userId_key" ON "DocumentReceipt"("memberDocumentId", "userId");
CREATE INDEX "DocumentReceipt_userId_idx" ON "DocumentReceipt"("userId");

-- AddForeignKey
ALTER TABLE "MemberDocument" ADD CONSTRAINT "MemberDocument_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberDocument" ADD CONSTRAINT "MemberDocument_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MemberDocumentRecipient" ADD CONSTRAINT "MemberDocumentRecipient_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES "MemberDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberDocumentRecipient" ADD CONSTRAINT "MemberDocumentRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentReceipt" ADD CONSTRAINT "DocumentReceipt_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES "MemberDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentReceipt" ADD CONSTRAINT "DocumentReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
