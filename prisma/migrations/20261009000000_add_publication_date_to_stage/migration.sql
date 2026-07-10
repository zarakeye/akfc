-- AlterTable: ajoute la colonne publicationDate à Stage
ALTER TABLE "Stage" ADD COLUMN "publicationDate" TIMESTAMP(3);

-- CreateIndex: index sur publicationDate pour Stage et Post (cohérence avec Event)
CREATE INDEX "Stage_publicationDate_idx" ON "Stage"("publicationDate");
CREATE INDEX "Post_publicationDate_idx" ON "Post"("publicationDate");
