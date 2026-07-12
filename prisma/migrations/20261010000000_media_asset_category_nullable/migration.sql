-- Découple MediaAsset de la catégorie : les uploads `general` et `perso`
-- n'ont ni discipline ni catégorie. `categoryId` devient nullable, exactement
-- comme `disciplineId` l'est déjà. Opération non destructive (DROP NOT NULL
-- sur une colonne existante) — aucun besoin de CREATEDB.
ALTER TABLE "MediaAsset" ALTER COLUMN "categoryId" DROP NOT NULL;
