-- Informations légales du club (Réglages du site → Informations légales) : pages « Mentions légales »
-- et « Politique de confidentialité » générées, registre des traitements, durées de conservation.
ALTER TABLE "SiteSettings" ADD COLUMN "legalName" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "legalRna" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "legalSiret" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "publicationDirector" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "publicationDirectorTitle" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "hostName" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "hostAddress" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "hostPhone" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "hostUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "storageRegion" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "credits" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "accountRetentionMonths" INTEGER NOT NULL DEFAULT 12;
ALTER TABLE "SiteSettings" ADD COLUMN "ticketRetentionMonths" INTEGER NOT NULL DEFAULT 36;
ALTER TABLE "SiteSettings" ADD COLUMN "backupRetentionDays" INTEGER;
ALTER TABLE "SiteSettings" ADD COLUMN "legalUpdatedAt" TIMESTAMP(3);
-- Valeurs de départ connues (modifiables dans les réglages).
UPDATE "SiteSettings" SET
  "hostName" = 'Hetzner Online GmbH',
  "hostAddress" = 'Industriestr. 25, 91710 Gunzenhausen, Allemagne',
  "hostPhone" = '+49 9831 505-0',
  "hostUrl" = 'https://www.hetzner.com',
  "publicationDirectorTitle" = 'président(e) de l''association',
  "credits" = 'Site conçu et développé bénévolement par Stéphane Bazze, membre de l''association.';
