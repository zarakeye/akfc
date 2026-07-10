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

/* ─────────────────────────────────────────────────────────────────────── */
/*  Utilisateurs                                                           */
/* ─────────────────────────────────────────────────────────────────────── */

export type UserNameParts = {
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  email: string;
};

/**
 * Nom affichable d'un utilisateur : « Prénom Nom » si disponible, sinon
 * le pseudo, sinon l'email. `null` si l'utilisateur est absent.
 */
export function formatUserName(user: UserNameParts | null): string | null {
  if (!user) return null;
  const parts = [user.firstName, user.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return parts || user.pseudo || user.email;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Dates et heures                                                        */
/* ─────────────────────────────────────────────────────────────────────── */

/** Heure au format HHMM (1830) → « 18h30 ». */
export function formatTime(hhmm: number): string {
  const h = Math.floor(hhmm / 100);
  const m = hhmm % 100;
  return `${h}h${String(m).padStart(2, "0")}`;
}

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