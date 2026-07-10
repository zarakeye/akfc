/*
  Warnings:

  - You are about to drop the column `Slug` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "Slug",
ADD COLUMN     "slug" TEXT;
