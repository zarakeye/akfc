-- Pages de contenu éditoriales (« L'association », « L'histoire du club »…).
--
-- La clé primaire est le slug : ces pages sont désignées par leur nom dans
-- les URLs et dans le code, jamais par un rang.

ALTER TYPE "PageReferencerKind" ADD VALUE 'SITE_PAGE';

CREATE TABLE "SitePage" (
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SitePage_pkey" PRIMARY KEY ("slug")
);
