import { z } from "zod";

/**
 * Flash info (BreakingNews) : SOURCE UNIQUE de la règle, importée par les procédures
 * breakingNews.create / update, par la server action du formulaire et par le formulaire lui-même.
 */

/** Champ vide → null : « sans lien », « brouillon », « sans expiration ». */
const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

/**
 * Une date facultative. Le formulaire y passe la valeur d'un champ `datetime-local`
 * (« 2026-11-18T17:00 », lue à l'heure du navigateur), la server action une date ISO, la
 * procédure une Date : les trois deviennent une Date.
 */
const optionalDate = z.preprocess(emptyToNull, z.coerce.date().nullable()).optional();

const fields = {
  title: z.string().trim().min(1, "Le titre est obligatoire.").max(150, "150 caractères au plus."),
  /** Texte brut court : le ruban défile mal du texte riche. */
  body: z.string().trim().min(1, "Le texte est obligatoire.").max(600, "600 caractères au plus."),
  /**
   * Lien optionnel : interne (« /#post-12 », un vote sur le mur) ou externe. Pas de `.url()` :
   * il doit accepter les chemins relatifs.
   */
  href: z.preprocess(emptyToNull, z.string().trim().max(500, "500 caractères au plus.").nullable()).optional(),
  publicationDate: optionalDate,
  expiresAt: optionalDate,
};

/** L'expiration, si présente avec une publication, doit lui être postérieure. */
const assertCoherentDates = (
  data: { publicationDate?: Date | null; expiresAt?: Date | null },
  ctx: z.RefinementCtx,
) => {
  if (data.publicationDate && data.expiresAt && data.expiresAt <= data.publicationDate) {
    ctx.addIssue({
      code: "custom",
      path: ["expiresAt"],
      message: "L'expiration doit être postérieure à la publication.",
    });
  }
};

/** Création (procédure breakingNews.create). */
export const createBreakingNewsSchema = z.object(fields).superRefine(assertCoherentDates);

/** Mise à jour (procédure breakingNews.update). */
export const updateBreakingNewsSchema = z
  .object({ id: z.number().int().positive(), ...fields })
  .superRefine(assertCoherentDates);

/**
 * Le formulaire, création et édition : `id` absent → création, présent → édition (il arrive
 * du FormData sous forme de texte, d'où la conversion).
 */
export const saveBreakingNewsSchema = z
  .object({ id: z.coerce.number().int().positive().optional(), ...fields })
  .superRefine(assertCoherentDates);

export type SaveBreakingNewsInput = z.infer<typeof saveBreakingNewsSchema>;
