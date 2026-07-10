-- AlterTable
ALTER TABLE "Discipline" ADD COLUMN     "familyId" INTEGER,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "Slug" TEXT;

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "DisciplineFamily" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisciplineFamily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DisciplineFamily_name_key" ON "DisciplineFamily"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DisciplineFamily_slug_key" ON "DisciplineFamily"("slug");

-- CreateIndex
CREATE INDEX "DisciplineFamily_sortOrder_idx" ON "DisciplineFamily"("sortOrder");

-- CreateIndex
CREATE INDEX "Discipline_familyId_idx" ON "Discipline"("familyId");

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "DisciplineFamily"("id") ON DELETE SET NULL ON UPDATE CASCADE;
