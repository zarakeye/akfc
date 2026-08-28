-- CreateTable
CREATE TABLE "FolderLabel" (
    "path" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FolderLabel_pkey" PRIMARY KEY ("path")
);
