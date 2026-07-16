-- CONTRACT : les colonnes `Event.disciplineId` et
-- `Event.externalDisciplineLabel` n'ont plus de lecteur. La jointure
-- `EventDiscipline` et `Event.externalDisciplineLabels` sont la seule vérité.
--
-- ⚠️ IRRÉVERSIBLE : vérifier AVANT que le backfill d'E1 a bien tout copié.
--   SELECT COUNT(*) FROM "Event" e WHERE e."disciplineId" IS NOT NULL
--     AND NOT EXISTS (SELECT 1 FROM "EventDiscipline" ed
--       WHERE ed."eventId" = e."id" AND ed."disciplineId" = e."disciplineId");
--   -- doit renvoyer 0

ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_disciplineId_fkey";
DROP INDEX IF EXISTS "Event_disciplineId_idx";
ALTER TABLE "Event" DROP COLUMN IF EXISTS "disciplineId";
ALTER TABLE "Event" DROP COLUMN IF EXISTS "externalDisciplineLabel";
