-- Droit à l'image : autorisation de chaque membre (photos et vidéos des activités).
CREATE TYPE "ImageConsent" AS ENUM ('UNKNOWN', 'GRANTED', 'REFUSED');
ALTER TABLE "User" ADD COLUMN "imageConsent" "ImageConsent" NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE "User" ADD COLUMN "imageConsentAt" TIMESTAMP(3);
