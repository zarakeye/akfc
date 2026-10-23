-- Droit à l'image en ligne : majorité et parent référent des mineurs, voie de chaque autorisation,
-- demandes en attente (souhaits du mineur + lien envoyé au parent).

-- CreateEnum
CREATE TYPE "LegalAge" AS ENUM ('UNKNOWN', 'ADULT', 'MINOR');

-- CreateEnum
CREATE TYPE "ImageConsentSource" AS ENUM ('PAPER', 'ONLINE_MEMBER', 'ONLINE_GUARDIAN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDateVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "legalAge" "LegalAge" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianEmail" TEXT;

-- AlterTable
ALTER TABLE "ImageConsentForm" ADD COLUMN     "source" "ImageConsentSource" NOT NULL DEFAULT 'PAPER',
ADD COLUMN     "textVersion" TEXT,
ADD COLUMN     "signerName" TEXT,
ADD COLUMN     "signerQuality" TEXT,
ADD COLUMN     "signerEmail" TEXT,
ADD COLUMN     "memberBirthDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ImageConsentRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usages" "ImageUsage"[],
    "keepAfterLeave" BOOLEAN,
    "tokenHash" TEXT,
    "sentTo" TEXT,
    "sentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageConsentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageConsentRequest_userId_key" ON "ImageConsentRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ImageConsentRequest_tokenHash_key" ON "ImageConsentRequest"("tokenHash");

-- AddForeignKey
ALTER TABLE "ImageConsentRequest" ADD CONSTRAINT "ImageConsentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
