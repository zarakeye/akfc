-- Adresse du club d'un membre (alias @akfc.fr de contact@), saisie par un administrateur.
-- Celle des instructeurs est montrée aux membres connectés ; l'adresse personnelle ne l'est jamais.
ALTER TABLE "User" ADD COLUMN "clubEmail" TEXT;
