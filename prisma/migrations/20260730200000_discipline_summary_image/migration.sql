-- Image de la carte de présentation synthétique d'une discipline.
--
-- Identifiant de MediaAsset en texte simple, sans clé étrangère : c'est la
-- convention déjà suivie par les blocs du PageBuilder, qui stockent des
-- mediaId bruts dans leur Json. Deux régimes de référence pour la même chose
-- seraient une source de confusion durable.
--
-- Nullable : une discipline peut n'avoir aucune image de carte.
ALTER TABLE "Discipline" ADD COLUMN "summaryMediaId" TEXT;
