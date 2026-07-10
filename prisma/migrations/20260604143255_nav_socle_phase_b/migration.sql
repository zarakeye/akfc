/*
  Warnings:

  - You are about to drop the column `family` on the `Discipline` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Stage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Discipline" DROP COLUMN "family";

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_slug_key" ON "Stage"("slug");
