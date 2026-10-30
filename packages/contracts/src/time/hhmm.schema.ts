import { z } from "zod";

/**
 * Heure de la journée au format **HHMM** : un entier dont les deux derniers chiffres sont les
 * minutes, les autres les heures. 0 = 0h00, 905 = 9h05, 1830 = 18h30, 2359 = 23h59. Heure locale du
 * club, sans fuseau.
 *
 * `max(2359)` ne suffit pas : 1860 (« 18h60 ») passerait. Le `refine` vérifie les minutes.
 *
 * Utilisé par les créneaux (Course) et les séances (SeminarSession, EventSession).
 */
export const hhmmSchema = z
  .number()
  .int()
  .min(0)
  .max(2359)
  .refine((v) => v % 100 < 60, {
    message: "Les minutes doivent être comprises entre 00 et 59 (1860 n’est pas une heure valide).",
  });

/** Message commun aux trois routeurs quand la fin ne suit pas le début. */
export const END_AFTER_BEGIN_MESSAGE = "L’heure de fin doit être postérieure à l’heure de début.";
