-- Réglages éditoriaux partagés, pilotés depuis le formulaire de discipline.
--
-- NOT NULL + DEFAULT : la ligne existante reçoit les valeurs en vigueur
-- jusqu'ici (600 caractères, 220 pixels), donc aucun changement visible à
-- l'application de la migration.
ALTER TABLE "SiteStyle"
  ADD COLUMN "summaryMaxChars" INTEGER NOT NULL DEFAULT 600,
  ADD COLUMN "cardCollapsedHeight" INTEGER NOT NULL DEFAULT 220;
