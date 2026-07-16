-- Découple Event de LA discipline : un événement peut présenter 0..N
-- disciplines enseignées, et 0..N disciplines non enseignées (labels libres).
-- Ajoute aussi le rattachement direct des médias à un événement.
--
-- Purement ADDITIF : les colonnes `Event.disciplineId` et
-- `Event.externalDisciplineLabel` sont conservées (supprimées plus tard, une
-- fois les lecteurs/écrivains basculés).

-- 1. Jointure explicite Event <-> Discipline
CREATE TABLE "EventDiscipline" (
    "eventId" INTEGER NOT NULL,
    "disciplineId" INTEGER NOT NULL,
    CONSTRAINT "EventDiscipline_pkey" PRIMARY KEY ("eventId","disciplineId")
);

CREATE INDEX "EventDiscipline_disciplineId_idx" ON "EventDiscipline"("disciplineId");

ALTER TABLE "EventDiscipline"
    ADD CONSTRAINT "EventDiscipline_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventDiscipline"
    ADD CONSTRAINT "EventDiscipline_disciplineId_fkey"
    FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Labels de disciplines non enseignées (0..N)
ALTER TABLE "Event"
    ADD COLUMN "externalDisciplineLabels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 3. Rattachement direct des médias à un événement
ALTER TABLE "MediaAsset" ADD COLUMN "eventId" INTEGER;

CREATE INDEX "MediaAsset_eventId_idx" ON "MediaAsset"("eventId");

ALTER TABLE "MediaAsset"
    ADD CONSTRAINT "MediaAsset_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. BACKFILL des données existantes (idempotent)
INSERT INTO "EventDiscipline" ("eventId", "disciplineId")
SELECT "id", "disciplineId" FROM "Event" WHERE "disciplineId" IS NOT NULL
ON CONFLICT DO NOTHING;

UPDATE "Event"
SET "externalDisciplineLabels" = ARRAY["externalDisciplineLabel"]
WHERE "externalDisciplineLabel" IS NOT NULL
  AND btrim("externalDisciplineLabel") <> ''
  AND cardinality("externalDisciplineLabels") = 0;
