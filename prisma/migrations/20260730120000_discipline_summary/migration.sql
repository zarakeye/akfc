-- Présentation synthétique d'une discipline, destinée à la page d'accueil.
--
-- Même forme que "description" : un composite PageContentV1 sérialisé, avec
-- un composite VIDE par défaut. NOT NULL + DEFAULT permet d'ajouter la
-- colonne sans backfill : les disciplines existantes reçoivent le composite
-- vide, qui signifie « pas de présentation synthétique ».
ALTER TABLE "Discipline"
  ADD COLUMN "summary" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}';
