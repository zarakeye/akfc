-- Réglage typographique du site (ligne unique, id = 1).
-- Écrit à la main : l'utilisateur Postgres du projet n'a pas CREATEDB,
-- donc `prisma migrate dev` n'est pas utilisable ici.
CREATE TABLE "SiteStyle" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "variables" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteStyle_pkey" PRIMARY KEY ("id")
);
