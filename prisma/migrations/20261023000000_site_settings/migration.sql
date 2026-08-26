-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "shortTitle" TEXT NOT NULL DEFAULT 'AKFC',
    "longTitle" TEXT NOT NULL DEFAULT 'Association de Kung Fu de Chambéry',
    "tagline" TEXT,
    "supportEmail" TEXT,
    "defaultLocale" TEXT NOT NULL DEFAULT 'fr',
    "logoAssetId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
