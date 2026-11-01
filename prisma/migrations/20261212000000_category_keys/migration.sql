-- Catégories : une clé technique stable, choisie dans une liste fixe (course, seminar, event).
-- Le code reconnaîtra une catégorie à sa clé, plus jamais à son libellé.
--
-- Les catégories existantes reçoivent leur clé ici, sans rien deviner : une clé n'est attribuée
-- que si UNE SEULE catégorie la revendique ; sinon la ligne reste à NULL, et la liste des
-- catégories la signale « hors liste » pour que l'administrateur la rattache. Aucun libellé,
-- aucun dossier, aucune autre table n'est modifié.

CREATE TYPE "CategoryKey" AS ENUM ('course', 'seminar', 'event');
ALTER TABLE "Category" ADD COLUMN "key" "CategoryKey";
CREATE UNIQUE INDEX "Category_key_key" ON "Category"("key");

-- 1. Les cours : le segment `courses`, déjà exigé par le code des créneaux.
WITH cand AS (SELECT "id" FROM "Category" WHERE "storageSegment" = 'courses')
UPDATE "Category" SET "key" = 'course'
WHERE "id" IN (SELECT "id" FROM cand) AND (SELECT count(*) FROM cand) = 1;

-- 2. L'usage : la catégorie des galeries rattachées à un stage, à un évènement.
WITH cand AS (
  SELECT DISTINCT g."categoryId" AS "id" FROM "Gallery" g
  JOIN "Category" c ON c."id" = g."categoryId" AND c."key" IS NULL
  WHERE g."seminarId" IS NOT NULL
)
UPDATE "Category" SET "key" = 'seminar'
WHERE "id" IN (SELECT "id" FROM cand) AND (SELECT count(*) FROM cand) = 1;

WITH cand AS (
  SELECT DISTINCT g."categoryId" AS "id" FROM "Gallery" g
  JOIN "Category" c ON c."id" = g."categoryId" AND c."key" IS NULL
  WHERE g."eventId" IS NOT NULL
)
UPDATE "Category" SET "key" = 'event'
WHERE "id" IN (SELECT "id" FROM cand) AND (SELECT count(*) FROM cand) = 1;

-- 3. À défaut d'usage : le libellé (sans accents ni majuscules) ou le segment du dossier.
--    Cours → course, Stage(s) → seminar, Évènement(s) / Événement(s) / Event(s) → event.
WITH norm AS (
  SELECT "id", translate(lower("type"), 'éèêëàâîïôöùûüç', 'eeeeaaiioouuuc') AS t, "storageSegment" AS s
  FROM "Category" WHERE "key" IS NULL
), cand AS (
  SELECT "id" FROM norm
  WHERE t = 'cours' OR s ~ '^courses?(-[0-9]+)?$'
)
UPDATE "Category" SET "key" = 'course'
WHERE "id" IN (SELECT "id" FROM cand) AND (SELECT count(*) FROM cand) = 1
  AND NOT EXISTS (SELECT 1 FROM "Category" WHERE "key" = 'course');

WITH norm AS (
  SELECT "id", translate(lower("type"), 'éèêëàâîïôöùûüç', 'eeeeaaiioouuuc') AS t, "storageSegment" AS s
  FROM "Category" WHERE "key" IS NULL
), cand AS (
  SELECT "id" FROM norm
  WHERE t IN ('stage', 'stages') OR s ~ '^(stage|seminar)s?(-[0-9]+)?$'
)
UPDATE "Category" SET "key" = 'seminar'
WHERE "id" IN (SELECT "id" FROM cand) AND (SELECT count(*) FROM cand) = 1
  AND NOT EXISTS (SELECT 1 FROM "Category" WHERE "key" = 'seminar');

WITH norm AS (
  SELECT "id", translate(lower("type"), 'éèêëàâîïôöùûüç', 'eeeeaaiioouuuc') AS t, "storageSegment" AS s
  FROM "Category" WHERE "key" IS NULL
), cand AS (
  SELECT "id" FROM norm
  WHERE t IN ('evenement', 'evenements', 'event', 'events') OR s ~ '^(evenement|event)s?(-[0-9]+)?$'
)
UPDATE "Category" SET "key" = 'event'
WHERE "id" IN (SELECT "id" FROM cand) AND (SELECT count(*) FROM cand) = 1
  AND NOT EXISTS (SELECT 1 FROM "Category" WHERE "key" = 'event');
