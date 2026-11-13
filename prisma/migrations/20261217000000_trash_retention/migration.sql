-- La corbeille retient qui a jeté un élément (restauration dans les espaces de groupe,
-- « Récemment jetés »), et ne garde plus rien indéfiniment : la purge de nuit supprime
-- définitivement ce qui y séjourne depuis plus de trashRetentionDays jours (90 par défaut).

ALTER TABLE "TrashEntry" ADD COLUMN "trashedById" TEXT;
ALTER TABLE "TrashEntry" ADD CONSTRAINT "TrashEntry_trashedById_fkey" FOREIGN KEY ("trashedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SiteSettings" ADD COLUMN "trashRetentionDays" INTEGER NOT NULL DEFAULT 90;
