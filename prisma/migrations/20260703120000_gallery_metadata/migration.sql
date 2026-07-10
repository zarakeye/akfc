-- Gallery : title requis, date, rattachements category/origin (cumulables).

-- Backfill AVANT le NOT NULL : le slug fait titre par défaut.
UPDATE "Gallery" SET "title" = "slug" WHERE "title" IS NULL;
ALTER TABLE "Gallery" ALTER COLUMN "title" SET NOT NULL;

ALTER TABLE "Gallery" ADD COLUMN "date" TIMESTAMP(3);
ALTER TABLE "Gallery" ADD COLUMN "categoryId" INTEGER;
ALTER TABLE "Gallery" ADD COLUMN "originId" INTEGER;

ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_originId_fkey"
  FOREIGN KEY ("originId") REFERENCES "Origin"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Gallery_date_idx" ON "Gallery"("date");
