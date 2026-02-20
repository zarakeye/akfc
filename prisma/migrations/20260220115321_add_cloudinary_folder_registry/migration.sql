-- CreateEnum
CREATE TYPE "CloudinaryFolderStatus" AS ENUM ('pending', 'published', 'bin');

-- CreateTable
CREATE TABLE "CloudinaryFolder" (
    "id" TEXT NOT NULL,
    "appRoot" TEXT NOT NULL,
    "fullPath" TEXT NOT NULL,
    "status" "CloudinaryFolderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloudinaryFolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CloudinaryFolder_appRoot_idx" ON "CloudinaryFolder"("appRoot");

-- CreateIndex
CREATE INDEX "CloudinaryFolder_appRoot_status_idx" ON "CloudinaryFolder"("appRoot", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CloudinaryFolder_appRoot_fullPath_key" ON "CloudinaryFolder"("appRoot", "fullPath");
