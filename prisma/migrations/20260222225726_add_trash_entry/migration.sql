-- CreateEnum
CREATE TYPE "TrashEntryKind" AS ENUM ('folder', 'file');

-- CreateEnum
CREATE TYPE "TrashEntryStatus" AS ENUM ('IN_BIN', 'RESTORED', 'DELETED');

-- CreateTable
CREATE TABLE "TrashEntry" (
    "id" TEXT NOT NULL,
    "appRoot" TEXT NOT NULL,
    "kind" "TrashEntryKind" NOT NULL,
    "status" "TrashEntryStatus" NOT NULL DEFAULT 'IN_BIN',
    "displayName" TEXT NOT NULL,
    "previousPath" TEXT NOT NULL,
    "storageRoot" TEXT NOT NULL,
    "trashedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restoredAt" TIMESTAMP(3),
    "restoredToPath" TEXT,
    "deletedAt" TIMESTAMP(3),
    "sizeBytes" BIGINT,
    "cloudinaryCreatedAt" TIMESTAMP(3),

    CONSTRAINT "TrashEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrashEntry_appRoot_idx" ON "TrashEntry"("appRoot");

-- CreateIndex
CREATE INDEX "TrashEntry_appRoot_status_trashedAt_idx" ON "TrashEntry"("appRoot", "status", "trashedAt");

-- CreateIndex
CREATE INDEX "TrashEntry_appRoot_previousPath_idx" ON "TrashEntry"("appRoot", "previousPath");

-- CreateIndex
CREATE INDEX "TrashEntry_appRoot_kind_idx" ON "TrashEntry"("appRoot", "kind");
