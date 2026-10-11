-- Migration Cloudinary → R2 : ancien public_id Cloudinary d'un fichier migré (retour arrière, trace).
ALTER TABLE "MediaAsset" ADD COLUMN "legacyCloudinaryPublicId" TEXT;
