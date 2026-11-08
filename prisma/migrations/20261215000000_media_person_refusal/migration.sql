-- Refus d'un média précis par la personne taguée (« Où j'apparais ») : il l'emporte sur son
-- autorisation générale, pour ce média seulement. Une colonne, vide pour tous les tags existants.
ALTER TABLE "MediaPerson" ADD COLUMN "refusedAt" TIMESTAMP(3);
