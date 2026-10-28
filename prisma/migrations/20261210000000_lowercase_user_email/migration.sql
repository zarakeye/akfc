-- Adresses e-mail des comptes en minuscules.
-- Le code enregistre et cherche désormais les adresses en minuscules (emailSchema). Les comptes
-- créés avant avec une majuscule ne seraient plus retrouvés : on les met au même format.
-- Si deux comptes ne diffèrent que par la casse, rien n'est modifié et la migration échoue avec
-- un message explicite : il faut alors décider à la main lequel garder.

DO $$
BEGIN
  IF EXISTS (SELECT lower("email") FROM "User" GROUP BY lower("email") HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Des comptes ne diffèrent que par la casse de leur adresse e-mail : à régler avant cette migration.';
  END IF;
END $$;

UPDATE "User" SET "email" = lower("email") WHERE "email" <> lower("email");
