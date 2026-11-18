import { ageOn, type LegalAgeValue } from "#legal/imageConsent.ts";

/**
 * Création d'un compte : la majorité d'un simple membre. La date de naissance, facultative, décide
 * si elle est donnée ; sinon, on choisit Majeur ou Mineur. Un mineur appelle les coordonnées de son
 * parent référent, qui validera ses choix de droit à l'image.
 */
export type CreationLegalValue = {
  birthDate: string;
  /** Choix sans date de naissance. */
  choice: "ADULT" | "MINOR" | null;
  guardianFirstName: string;
  guardianLastName: string;
  guardianRelation: string;
  guardianEmail: string;
  guardianPhone: string;
};

export const EMPTY_CREATION_LEGAL: CreationLegalValue = {
  birthDate: "",
  choice: null,
  guardianFirstName: "",
  guardianLastName: "",
  guardianRelation: "",
  guardianEmail: "",
  guardianPhone: "",
};

export const GUARDIAN_RELATIONS = ["mère", "père", "tutrice", "tuteur"] as const;

/** Âge à la date du jour, ou null si la date est absente ou invalide. */
export function ageFromInput(birthDate: string, now: Date = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const d = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d > now) return null;
  return ageOn(d, now);
}

/** Majorité qui résulte de la saisie : la date d'abord, le choix ensuite. */
export function creationLegalAge(v: CreationLegalValue): "ADULT" | "MINOR" | null {
  const age = ageFromInput(v.birthDate);
  if (age !== null) return age >= 18 ? "ADULT" : "MINOR";
  return v.choice;
}

/** Ce qui manque avant de créer le compte, ou null. */
export function creationLegalError(v: CreationLegalValue): string | null {
  if (v.birthDate && ageFromInput(v.birthDate) === null) return "Date de naissance invalide.";
  const age = creationLegalAge(v);
  if (!age) return "Renseignez la date de naissance, ou indiquez si le membre est majeur ou mineur.";
  if (age === "MINOR") {
    if (!v.guardianFirstName.trim() || !v.guardianLastName.trim()) return "Indiquez le prénom et le nom du parent.";
    if (!v.guardianRelation.trim()) return "Indiquez la qualité du parent (mère, père…).";
    if (!v.guardianEmail.trim()) return "Indiquez l'adresse e-mail du parent.";
  }
  return null;
}

/** Charge utile `legal` de user.create. */
export function toCreationLegalInput(v: CreationLegalValue): {
  legalAge: LegalAgeValue;
  birthDate: string | null;
  guardianName: string | null;
  guardianEmail: string | null;
  guardianRelation: string | null;
  guardianPhone: string | null;
} {
  const minor = creationLegalAge(v) === "MINOR";
  const name = `${v.guardianFirstName.trim()} ${v.guardianLastName.trim()}`.trim();
  return {
    legalAge: creationLegalAge(v) ?? "UNKNOWN",
    birthDate: v.birthDate || null,
    guardianName: minor ? name || null : null,
    guardianEmail: minor ? v.guardianEmail.trim() || null : null,
    guardianRelation: minor ? v.guardianRelation.trim() || null : null,
    guardianPhone: minor ? v.guardianPhone.trim() || null : null,
  };
}

/**
 * Ce qui manque avant de créer le compte, statut compris. Un administrateur, un instructeur ou un
 * membre du bureau est majeur d'office : rien n'est à saisir, mais une date de naissance de mineur,
 * si elle est donnée, le contredit.
 */
export function creationLegalErrorFor(v: CreationLegalValue, adultByStatus: boolean): string | null {
  if (!adultByStatus) return creationLegalError(v);
  return v.birthDate && (ageFromInput(v.birthDate) ?? 18) < 18
    ? "Un mineur ne peut pas être administrateur, instructeur ou membre du bureau."
    : null;
}
