-- ══════════════════════════════════════════════════════════════════════════
-- AKFC — Renommage Stage → Seminar (DB, métadonnée pure, aucune donnée déplacée)
--
-- Exhaustif d'après l'inventaire : 3 tables, 2 colonnes, 2 séquences,
-- 10 contraintes, 13 index, table M2M `_StageAnimators`.
--
-- Les FK suivent par OID au RENAME de table ; on renomme ensuite les NOMS
-- (contraintes/index/séquences) pour rester conforme à la convention Prisma
-- `Seminar_*` (évite tout drift si un `migrate diff` est lancé un jour).
--
-- Destination : prisma/migrations/20261111000000_rename_stage_to_seminar/migration.sql
-- MAIS teste-le d'abord en transaction (voir test-rename-stage.sh).
-- ══════════════════════════════════════════════════════════════════════════

-- 1. Tables (les FK référençant Stage suivent automatiquement par OID)
ALTER TABLE "Stage" RENAME TO "Seminar";
ALTER TABLE "StageSession" RENAME TO "SeminarSession";
ALTER TABLE "_StageAnimators" RENAME TO "_SeminarAnimators";

-- 2. Colonnes
ALTER TABLE "SeminarSession" RENAME COLUMN "stageId" TO "seminarId";
ALTER TABLE "Gallery" RENAME COLUMN "stageId" TO "seminarId";

-- 3. Séquences (les DEFAULT nextval suivent par OID)
ALTER SEQUENCE "Stage_id_seq" RENAME TO "Seminar_id_seq";
ALTER SEQUENCE "StageSession_id_seq" RENAME TO "SeminarSession_id_seq";

-- 4. Contraintes FK (non adossées à un index)
ALTER TABLE "Seminar" RENAME CONSTRAINT "Stage_disciplineId_fkey" TO "Seminar_disciplineId_fkey";
ALTER TABLE "Seminar" RENAME CONSTRAINT "Stage_originId_fkey" TO "Seminar_originId_fkey";
ALTER TABLE "Seminar" RENAME CONSTRAINT "Stage_primaryAnimatorId_fkey" TO "Seminar_primaryAnimatorId_fkey";
ALTER TABLE "SeminarSession" RENAME CONSTRAINT "StageSession_stageId_fkey" TO "SeminarSession_seminarId_fkey";
ALTER TABLE "Gallery" RENAME CONSTRAINT "Gallery_stageId_fkey" TO "Gallery_seminarId_fkey";
ALTER TABLE "_SeminarAnimators" RENAME CONSTRAINT "_StageAnimators_A_fkey" TO "_SeminarAnimators_A_fkey";
ALTER TABLE "_SeminarAnimators" RENAME CONSTRAINT "_StageAnimators_B_fkey" TO "_SeminarAnimators_B_fkey";

-- 5. PK + UNIQUE (adossés à un index : ALTER INDEX renomme index ET contrainte)
ALTER INDEX "Stage_pkey" RENAME TO "Seminar_pkey";
ALTER INDEX "Stage_slug_key" RENAME TO "Seminar_slug_key";
ALTER INDEX "Stage_disciplineId_label_key" RENAME TO "Seminar_disciplineId_label_key";
ALTER INDEX "StageSession_pkey" RENAME TO "SeminarSession_pkey";
ALTER INDEX "StageSession_stageId_date_beginTime_key" RENAME TO "SeminarSession_seminarId_date_beginTime_key";
ALTER INDEX "_StageAnimators_AB_pkey" RENAME TO "_SeminarAnimators_AB_pkey";

-- 6. Index simples
ALTER INDEX "Stage_disciplineId_idx" RENAME TO "Seminar_disciplineId_idx";
ALTER INDEX "Stage_originId_idx" RENAME TO "Seminar_originId_idx";
ALTER INDEX "Stage_primaryAnimatorId_idx" RENAME TO "Seminar_primaryAnimatorId_idx";
ALTER INDEX "Stage_publicationDate_idx" RENAME TO "Seminar_publicationDate_idx";
ALTER INDEX "StageSession_date_idx" RENAME TO "SeminarSession_date_idx";
ALTER INDEX "StageSession_stageId_idx" RENAME TO "SeminarSession_seminarId_idx";
ALTER INDEX "_StageAnimators_B_index" RENAME TO "_SeminarAnimators_B_index";