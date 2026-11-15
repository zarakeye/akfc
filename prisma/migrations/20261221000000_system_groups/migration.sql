-- Groupes système (Instructeurs, Bureau) et téléphone du parent référent.

-- CreateEnum
CREATE TYPE "SystemGroupKind" AS ENUM ('INSTRUCTORS', 'BUREAU');

-- AlterTable
ALTER TABLE "MemberGroup" ADD COLUMN     "systemKind" "SystemGroupKind";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "guardianPhone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MemberGroup_systemKind_key" ON "MemberGroup"("systemKind");
