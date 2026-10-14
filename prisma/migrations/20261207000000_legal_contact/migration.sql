-- Coordonnées légales de l'association (Informations légales) : siège, téléphone, e-mail, seules
-- utilisées par les documents à valeur légale. Distinctes des coordonnées publiques.
ALTER TABLE "SiteSettings" ADD COLUMN "legalAddress" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "legalPhone" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "legalEmail" TEXT;
-- Valeurs de départ connues (modifiables dans les réglages) : siège statutaire, dénomination,
-- et l'e-mail de contact déjà cité par les pages légales. Le téléphone reste à saisir.
UPDATE "SiteSettings" SET
  "legalAddress" = E'3 rue de la Trésorerie\n73000 Chambéry',
  "legalName" = COALESCE("legalName", 'Association Kung Fu Chambéry'),
  "legalEmail" = "contactEmail";
