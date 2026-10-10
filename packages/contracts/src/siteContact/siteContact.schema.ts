import { z } from "zod";

/*
 * Coordonnées PUBLIQUES du club (Réglages du site → page « Nous contacter ») : adresse e-mail,
 * téléphones (appel et/ou WhatsApp), adresse. Partagé front / back.
 */

export const SITE_PHONES_MAX = 5;
const PHONE_RE = /^\+?[0-9][0-9 .-]{5,19}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const sitePhoneSchema = z
  .object({
    /** Libellé facultatif : « Bureau », « Sifu … », « Président »… */
    label: z.string().trim().max(60).default(""),
    number: z.string().trim().regex(PHONE_RE, "Numéro de téléphone invalide"),
    /** Joignable en appel. */
    call: z.boolean(),
    /** Joignable sur WhatsApp. */
    whatsapp: z.boolean(),
  })
  .refine((p) => p.call || p.whatsapp, "Cochez au moins « Appel » ou « WhatsApp »");
export type SitePhone = z.infer<typeof sitePhoneSchema>;

export const saveSiteContactSchema = z.object({
  contactEmail: z
    .string()
    .trim()
    .max(160)
    .refine((v) => v === "" || EMAIL_RE.test(v), "Adresse e-mail invalide"),
  contactPhones: z.array(sitePhoneSchema).max(SITE_PHONES_MAX, `${SITE_PHONES_MAX} numéros au plus`),
  contactAddress: z.string().trim().max(500),
});
export type SaveSiteContactInput = z.infer<typeof saveSiteContactSchema>;

/** Valeur stockée (JSON) → liste propre ; ignore toute entrée invalide. */
export function parseSitePhones(value: unknown): SitePhone[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((v) => {
    const r = sitePhoneSchema.safeParse(v);
    return r.success ? [r.data] : [];
  });
}

/** Chiffres au format international, sans « + » (ex. 06 12 34 56 78 → 33612345678). */
export function internationalDigits(number: string): string {
  const plus = number.trim().startsWith("+");
  const digits = number.replace(/\D/g, "");
  if (plus) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) return `33${digits.slice(1)}`;
  return digits;
}

export const telHref = (number: string): string => `tel:+${internationalDigits(number)}`;
export const whatsappHref = (number: string): string => `https://wa.me/${internationalDigits(number)}`;
