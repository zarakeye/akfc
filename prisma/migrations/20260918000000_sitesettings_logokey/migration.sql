-- SiteSettings : clé R2 réservée du logo (hors finder).
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "logoKey" TEXT;
