-- Droit à l'image en ligne pour les mineurs : c'est le parent référent qui valide.
--
-- 1. La qualité du parent (« mère », « père », « tuteur »…), saisie par un administrateur avec
--    son nom et son adresse, portée sur l'autorisation signée.
-- 2. Les souhaits du membre mineur, gardés avec l'autorisation validée par son parent, pour
--    montrer ce que le parent a changé. Deux colonnes nullables : aucune donnée existante touchée.
ALTER TABLE "User" ADD COLUMN "guardianRelation" TEXT;
ALTER TABLE "ImageConsentForm" ADD COLUMN "memberWishes" JSONB;
