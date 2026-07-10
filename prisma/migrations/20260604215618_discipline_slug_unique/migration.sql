/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Discipline` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Discipline_slug_key" ON "Discipline"("slug");
