/*
  Warnings:

  - You are about to drop the column `origin` on the `Discipline` table. All the data in the column will be lost.
  - The `description` column on the `Discipline` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PageReferencerKind" ADD VALUE 'DISCIPLINE';
ALTER TYPE "PageReferencerKind" ADD VALUE 'EVENT';

-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_disciplineId_fkey";

-- AlterTable
ALTER TABLE "Discipline" DROP COLUMN "origin",
ADD COLUMN     "originId" INTEGER,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}';

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "externalDisciplineLabel" TEXT,
ADD COLUMN     "originId" INTEGER,
ALTER COLUMN "disciplineId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Origin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT,
    "region" TEXT,
    "flag" TEXT,
    "historicalPeriod" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Origin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
    "audience" "Audience" NOT NULL,
    "disciplineId" INTEGER,
    "externalDisciplineLabel" TEXT,
    "originId" INTEGER,
    "organizerId" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSession" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "beginTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Origin_name_key" ON "Origin"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Origin_slug_key" ON "Origin"("slug");

-- CreateIndex
CREATE INDEX "Origin_sortOrder_idx" ON "Origin"("sortOrder");

-- CreateIndex
CREATE INDEX "Event_disciplineId_idx" ON "Event"("disciplineId");

-- CreateIndex
CREATE INDEX "Event_originId_idx" ON "Event"("originId");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- CreateIndex
CREATE INDEX "Event_publicationDate_idx" ON "Event"("publicationDate");

-- CreateIndex
CREATE INDEX "EventSession_eventId_idx" ON "EventSession"("eventId");

-- CreateIndex
CREATE INDEX "EventSession_date_idx" ON "EventSession"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EventSession_eventId_date_beginTime_key" ON "EventSession"("eventId", "date", "beginTime");

-- CreateIndex
CREATE INDEX "Discipline_originId_idx" ON "Discipline"("originId");

-- CreateIndex
CREATE INDEX "Stage_originId_idx" ON "Stage"("originId");

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Origin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Origin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Origin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSession" ADD CONSTRAINT "EventSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
