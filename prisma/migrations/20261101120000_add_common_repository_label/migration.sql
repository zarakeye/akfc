CREATE TABLE "CommonRepositoryLabel" (
    "path" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommonRepositoryLabel_pkey" PRIMARY KEY ("path")
);
