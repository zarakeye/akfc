-- Partenaires du club (MJC, fédération…), gérés dans Réglages du site.
CREATE TYPE "SitePartnerRole" AS ENUM ('HOST', 'FEDERATION', 'OTHER');

CREATE TABLE "SitePartner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "SitePartnerRole" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "websiteUrl" TEXT,
    "links" JSONB NOT NULL DEFAULT '[]',
    "logoData" BYTEA,
    "logoMime" TEXT,
    "logoUpdatedAt" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SitePartner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SitePartner_isActive_position_idx" ON "SitePartner"("isActive", "position");
