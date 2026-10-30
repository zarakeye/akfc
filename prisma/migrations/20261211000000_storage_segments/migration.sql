-- Segments de stockage figés à la création (catégories, disciplines).
-- Les lignes existantes restent à NULL ici : l'application les complète au démarrage
-- (ensureStorageSegments) avec exactement le segment calculé jusqu'ici à partir du nom,
-- ce qui garantit qu'aucun fichier ne change de dossier. Aucune donnée n'est modifiée.

ALTER TABLE "Category" ADD COLUMN "storageSegment" TEXT;
ALTER TABLE "Discipline" ADD COLUMN "storageSegment" TEXT;

CREATE UNIQUE INDEX "Category_storageSegment_key" ON "Category"("storageSegment");
CREATE UNIQUE INDEX "Discipline_categoryId_storageSegment_key" ON "Discipline"("categoryId", "storageSegment");
