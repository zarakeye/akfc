import { z } from "zod";

import { IMAGE_USAGE_VALUES } from "#legal/imageConsent.ts";

/**
 * Les formulaires du droit à l'image en ligne : SOURCE UNIQUE des règles, importée par les
 * procédures imageConsent.*, par les server actions des formulaires et par les formulaires.
 * Les contrôles qui demandent la base (mot de passe, lien encore valable, date de majeur
 * confirmée) restent dans les services.
 */

/** Oui / Non pour chaque usage, et le choix « après le départ ». */
export const consentChoicesSchema = z.object({
  usages: z.array(z.enum(IMAGE_USAGE_VALUES)),
  keepAfterLeave: z.boolean().nullable(),
});

/** Membre majeur : ses choix, signés de son mot de passe (imageConsent.confirmMine). */
export const confirmMineSchema = consentChoicesSchema.extend({
  password: z.string().min(1, "Saisissez votre mot de passe."),
});

/** Membre mineur : ses souhaits, envoyés à son parent référent (imageConsent.requestGuardian). */
export const requestGuardianSchema = consentChoicesSchema;

/** Le lien personnel reçu par le parent. */
export const guardianTokenSchema = z.string().min(1).max(100);

/** Le parent se déclare représentant légal : sans cette case, rien n'est enregistré. */
const isLegalRepresentative = z
  .boolean()
  .refine((v) => v, "Pour valider, cochez la case « Je suis … représentant légal ».");

/** Champ vide → null : pas de date (page du droit à l'image) ou date effacée (page de la date). */
const birthDate = z.preprocess(
  (v) => (v === "" ? null : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de naissance invalide.").nullable(),
);

/** Page du parent : il valide le droit à l'image, et peut donner la date (imageConsent.confirmGuardian). */
export const confirmGuardianSchema = consentChoicesSchema.extend({
  token: guardianTokenSchema,
  isLegalRepresentative,
  /** Facultative : le parent la confirme, la corrige ou la donne s'il le souhaite. */
  birthDate: birthDate.optional(),
  /** Une date de majeur : le parent la confirme (le membre passe majeur, ses choix ne sont pas gardés). */
  confirmAdult: z.boolean().optional(),
});

/** Page du parent : la date de naissance seule ; null l'efface (imageConsent.confirmBirthDate). */
export const confirmBirthDateSchema = z.object({
  token: guardianTokenSchema,
  isLegalRepresentative,
  birthDate,
  confirmAdult: z.boolean().optional(),
});
