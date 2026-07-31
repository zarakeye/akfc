-- Résumé et image de carte pour les stages et les événements, destinés à la
-- page « Agenda ».
--
-- Un pageType par composite, comme STAGE_DESCRIPTION / STAGE_PROGRAM : chaque
-- jeu de références média reste indépendant.
ALTER TYPE "PageReferencerKind" ADD VALUE 'STAGE_SUMMARY';
ALTER TYPE "PageReferencerKind" ADD VALUE 'EVENT_SUMMARY';

ALTER TABLE "Stage"
  ADD COLUMN "summary" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
  ADD COLUMN "summaryMediaId" TEXT;

ALTER TABLE "Event"
  ADD COLUMN "summary" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
  ADD COLUMN "summaryMediaId" TEXT;
