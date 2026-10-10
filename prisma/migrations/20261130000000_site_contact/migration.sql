-- Coordonnées publiques du club (page « Nous contacter »), réglées dans Réglages du site.
ALTER TABLE "SiteSettings" ADD COLUMN "contactEmail" TEXT DEFAULT 'contact@akfc.fr';
ALTER TABLE "SiteSettings" ADD COLUMN "contactPhones" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "SiteSettings" ADD COLUMN "contactAddress" TEXT;
-- Adresse de départ : le siège du club, à la MJC (modifiable dans Réglages du site).
UPDATE "SiteSettings" SET "contactAddress" = E'MJC de Chambéry\n311 Faubourg Montmélian\n73000 Chambéry' WHERE "contactAddress" IS NULL;
