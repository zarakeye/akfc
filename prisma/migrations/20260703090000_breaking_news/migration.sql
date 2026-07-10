-- BreakingNews : actualités courtes (ruban + sidebar du site public).
CREATE TABLE "BreakingNews" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "publicationDate" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakingNews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BreakingNews_publicationDate_idx" ON "BreakingNews"("publicationDate");

-- Permission de gestion (le rattachement aux rôles se fait via l'UI admin).
INSERT INTO "Permission" ("name", "description")
VALUES ('manage_breaking_news', 'Gérer les actualités (BreakingNews)')
ON CONFLICT ("name") DO NOTHING;
