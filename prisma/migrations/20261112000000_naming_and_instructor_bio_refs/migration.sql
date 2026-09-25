-- Renommages de nommage (dette du refactor Stage → Seminar et de l'ère Cloudinary)
-- + nouvelle valeur INSTRUCTOR_BIO (images des bios d'instructeur référencées).
-- Uniquement des opérations de métadonnées : instantanées, aucune donnée réécrite.

-- PageReferencerKind : les valeurs STAGE_* désignent les séminaires.
ALTER TYPE "PageReferencerKind" RENAME VALUE 'STAGE_DESCRIPTION' TO 'SEMINAR_DESCRIPTION';
ALTER TYPE "PageReferencerKind" RENAME VALUE 'STAGE_PROGRAM' TO 'SEMINAR_PROGRAM';
ALTER TYPE "PageReferencerKind" RENAME VALUE 'STAGE_SUMMARY' TO 'SEMINAR_SUMMARY';
-- Bios d'instructeur (User.instructorBio) : désormais synchronisées.
ALTER TYPE "PageReferencerKind" ADD VALUE IF NOT EXISTS 'INSTRUCTOR_BIO';

-- TrashEntry : la date de création vaut aussi pour R2.
ALTER TABLE "TrashEntry" RENAME COLUMN "cloudinaryCreatedAt" TO "providerCreatedAt";

-- Registre des dossiers : fin du nom historique « CloudinaryFolder ».
ALTER TABLE "CloudinaryFolder" RENAME TO "Folder";
ALTER TABLE "Folder" RENAME CONSTRAINT "CloudinaryFolder_pkey" TO "Folder_pkey";
ALTER INDEX "CloudinaryFolder_appRoot_idx" RENAME TO "Folder_appRoot_idx";
ALTER INDEX "CloudinaryFolder_appRoot_status_idx" RENAME TO "Folder_appRoot_status_idx";
ALTER INDEX "CloudinaryFolder_appRoot_fullPath_key" RENAME TO "Folder_appRoot_fullPath_key";
ALTER TYPE "CloudinaryFolderStatus" RENAME TO "FolderStatus";
