-- Droit à l'image : formulaires signés déposés sur la fiche des membres.
CREATE TYPE "ImageUsage" AS ENUM ('MEMBER_SPACE', 'PUBLIC_SITE', 'SOCIAL_NETWORKS', 'PRINT', 'PRESS');

CREATE TABLE "ImageConsentForm" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "memberName" TEXT NOT NULL,
    "detachedAt" TIMESTAMP(3),
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "usages" "ImageUsage"[],
    "keepAfterLeave" BOOLEAN,
    "signedAt" TIMESTAMP(3),
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageConsentForm_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ImageConsentForm_storageKey_key" ON "ImageConsentForm"("storageKey");
CREATE INDEX "ImageConsentForm_userId_createdAt_idx" ON "ImageConsentForm"("userId", "createdAt");
CREATE INDEX "ImageConsentForm_detachedAt_idx" ON "ImageConsentForm"("detachedAt");

ALTER TABLE "ImageConsentForm" ADD CONSTRAINT "ImageConsentForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ImageConsentForm" ADD CONSTRAINT "ImageConsentForm_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
