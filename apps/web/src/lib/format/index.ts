/**
 * lib/format
 *
 * Helpers de formatage partagés par les pages publiques (détail
 * discipline / stage / event, et à venir les listings). Regroupés ici
 * pour éviter la duplication entre Server Components.
 */

/* ─────────────────────────────────────────────────────────────────────── */
/*  Labels de domaine (enums Prisma → libellés FR)                         */
/* ─────────────────────────────────────────────────────────────────────── */

/** `DisciplineType` → libellé affichable. */
export const DISCIPLINE_TYPE_LABELS: Record<string, string> = {
  MARTIAL_ART: "Art martial",
  CALLIGRAPHY: "Calligraphie",
};

/** `Audience` → libellé affichable. */
export const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: "Enfants",
  TEENAGERS: "Ados",
  ADULTS: "Adultes",
  ALL_AGES: "Tous publics",
};

/** `Day` → libellé affichable (majuscule initiale). */
export const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

/* ─────────────────────────────────────────────────────────────────────── */
/*  Utilisateurs                                                           */
/* ─────────────────────────────────────────────────────────────────────── */

export type UserNameParts = {
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
};

/**
 * Nom affichable d'un utilisateur : « Prénom Nom » si disponible, sinon le
 * pseudo. `null` si l'utilisateur est absent ou n'a ni nom ni pseudo : ces
 * helpers servent des pages PUBLIQUES, où l'adresse e-mail d'un membre n'a
 * jamais à apparaître, même en dernier recours.
 */
export function formatUserName(user: UserNameParts | null): string | null {
  if (!user) return null;
  const parts = [user.firstName, user.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return parts || user.pseudo?.trim() || null;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Dates et heures                                                        */
/* ─────────────────────────────────────────────────────────────────────── */

/** Heure au format HHMM (1830) → « 18h30 ». Une seule implémentation, dans lib/time. */
export { formatHHMM as formatTime } from "@lib/time/formatHHMM";

const SESSION_DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Date d'une séance → « samedi 14 mars 2026 ». */
export function formatSessionDate(date: Date): string {
  return SESSION_DATE_FMT.format(date);
}