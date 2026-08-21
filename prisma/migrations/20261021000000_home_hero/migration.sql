-- CreateTable
CREATE TABLE "HomeHero" (
    "id" TEXT NOT NULL DEFAULT 'home',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "HomeHero_pkey" PRIMARY KEY ("id")
);
