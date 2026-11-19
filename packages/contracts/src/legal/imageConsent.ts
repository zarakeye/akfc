/** Droit à l'image d'un membre : libellés partagés (table des utilisateurs, fiche, export). */
export const IMAGE_CONSENT_VALUES = ["UNKNOWN", "GRANTED", "REFUSED"] as const;
export type ImageConsentValue = (typeof IMAGE_CONSENT_VALUES)[number];

export const IMAGE_CONSENT_LABEL: Record<ImageConsentValue, string> = {
  UNKNOWN: "Non recueillie",
  GRANTED: "Accordée",
  REFUSED: "Refusée",
};

/**
 * Preuve de l'autorisation, pour la liste des membres : voie de la version la plus récente, ou
 * demande en attente du parent (lien envoyé, pas encore confirmé), ou rien.
 */
export const IMAGE_CONSENT_PROOF_VALUES = ["PAPER", "ONLINE_MEMBER", "ONLINE_GUARDIAN", "PENDING_GUARDIAN", "NONE"] as const;
export type ImageConsentProofValue = (typeof IMAGE_CONSENT_PROOF_VALUES)[number];

export const IMAGE_CONSENT_PROOF_LABEL: Record<ImageConsentProofValue, string> = {
  PAPER: "Papier signé",
  ONLINE_MEMBER: "En ligne",
  ONLINE_GUARDIAN: "En ligne (parent)",
  PENDING_GUARDIAN: "Attente du parent",
  NONE: "Aucun",
};

/** Voie d'une version de l'autorisation (fiche admin, profil). */
export const IMAGE_CONSENT_SOURCE_LABEL: Record<"PAPER" | "ONLINE_MEMBER" | "ONLINE_GUARDIAN", string> = {
  PAPER: "formulaire papier",
  ONLINE_MEMBER: "en ligne par le membre",
  ONLINE_GUARDIAN: "en ligne par le parent référent",
};

/** Usages de l'image proposés sur le formulaire (une ligne Oui / Non chacun), dans l'ordre du PDF. */
export const IMAGE_USAGE_VALUES = ["MEMBER_SPACE", "PUBLIC_SITE", "SOCIAL_NETWORKS", "PRINT", "PRESS"] as const;
export type ImageUsageValue = (typeof IMAGE_USAGE_VALUES)[number];

export const IMAGE_USAGE_LABEL: Record<ImageUsageValue, string> = {
  MEMBER_SPACE: "Espace membres",
  PUBLIC_SITE: "Site public",
  SOCIAL_NETWORKS: "Réseaux sociaux du club",
  PRINT: "Supports imprimés",
  PRESS: "Presse locale",
};

/** Formulaire vierge, en consultation (apps/web/public ; modèle des récapitulatifs remplis). */
export const IMAGE_CONSENT_BLANK_FORM_URL = "/documents/autorisation-droit-image.pdf";


/**
 * Version du texte d'autorisation (formulaire PDF et formulaire en ligne). Enregistrée avec chaque
 * autorisation donnée en ligne : à changer à chaque modification du texte du formulaire.
 */
export const IMAGE_CONSENT_TEXT_VERSION = "2026-10";

/** Majorité d'un membre (renseignée par un administrateur). */
export const LEGAL_AGE_VALUES = ["UNKNOWN", "ADULT", "MINOR"] as const;
export type LegalAgeValue = (typeof LEGAL_AGE_VALUES)[number];

export const LEGAL_AGE_LABEL: Record<LegalAgeValue, string> = {
  UNKNOWN: "Non renseignée",
  ADULT: "Majeur",
  MINOR: "Mineur",
};

/** Âge en années révolues à une date donnée (dates comparées en UTC, jour près). */
export function ageOn(birthDate: Date, on: Date): number {
  const b = new Date(birthDate);
  let age = on.getUTCFullYear() - b.getUTCFullYear();
  const beforeBirthday =
    on.getUTCMonth() < b.getUTCMonth() || (on.getUTCMonth() === b.getUTCMonth() && on.getUTCDate() < b.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/**
 * Majorité effective : un mineur dont la date de naissance VÉRIFIÉE atteint 18 ans est majeur, même
 * si sa fiche n'a pas encore été mise à jour. Sinon, la valeur saisie par l'administrateur.
 */
export function effectiveLegalAge(
  m: { legalAge: LegalAgeValue; birthDate: Date | null; birthDateVerified: boolean },
  now: Date = new Date(),
): LegalAgeValue {
  if (m.legalAge === "MINOR" && m.birthDate && m.birthDateVerified && ageOn(m.birthDate, now) >= 18) return "ADULT";
  return m.legalAge;
}

/**
 * Mineur : ce qui manque pour envoyer la demande au parent (libellés à afficher). Vide = complet.
 * La date de naissance n'en fait pas partie : c'est le parent qui la confirme (ou la renseigne)
 * en validant l'autorisation.
 */
export function missingForMinor(m: {
  firstName: string | null;
  lastName: string | null;
  guardianName: string | null;
  guardianEmail: string | null;
  guardianRelation: string | null;
}): string[] {
  const missing: string[] = [];
  if (!m.lastName?.trim()) missing.push("nom du membre");
  if (!m.firstName?.trim()) missing.push("prénom du membre");
  if (!m.guardianName?.trim()) missing.push("nom du parent référent");
  if (!m.guardianEmail?.trim()) missing.push("adresse e-mail du parent référent");
  if (!m.guardianRelation?.trim()) missing.push("qualité du parent référent (mère, père, tuteur…)");
  return missing;
}

/**
 * Date de naissance donnée par le parent d'un mineur : « AAAA-MM-JJ », passée. Renvoie la date
 * (minuit UTC) et si elle fait du membre un MAJEUR (le parent doit alors le confirmer : le membre
 * passe majeur et décide seul), ou le message d'erreur à afficher.
 */
export function parseGuardianBirthDate(value: string, now: Date = new Date()): { date: Date; adult: boolean } | string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : null;
  if (!d || Number.isNaN(d.getTime()) || d > now || ageOn(d, now) > 120) return "Date de naissance invalide.";
  return { date: d, adult: ageOn(d, now) >= 18 };
}

/** La date saisie fait-elle du membre un majeur ? (date vide ou invalide : non) */
export function isAdultBirthDate(value: string, now: Date = new Date()): boolean {
  const parsed = parseGuardianBirthDate(value, now);
  return typeof parsed !== "string" && parsed.adult;
}

/** Le parent a saisi une date de majeur sans la confirmer. */
export const ADULT_BIRTH_DATE_UNCONFIRMED =
  "À cette date, le membre a 18 ans ou plus : il est majeur. Vérifiez la date, ou confirmez-la.";

/** Statut déduit d'un formulaire : accordée dès qu'un usage est autorisé. */
export function consentFromUsages(usages: readonly ImageUsageValue[]): Exclude<ImageConsentValue, "UNKNOWN"> {
  return usages.length > 0 ? "GRANTED" : "REFUSED";
}

/** Validité du lien envoyé au parent référent, et délai minimal entre deux envois. */
export const GUARDIAN_LINK_TTL_MS = 7 * 24 * 3600 * 1000;
export const GUARDIAN_LINK_COOLDOWN_MS = 2 * 60 * 1000;

/** Choix d'autorisation : usages autorisés et choix « après mon départ ». */
export type ConsentChoices = { usages: readonly ImageUsageValue[]; keepAfterLeave: boolean | null };

/** Une ligne de la comparaison souhaits du membre / choix du parent. */
export type WishComparisonRow = {
  /** Usage, ou « après le départ ». */
  item: ImageUsageValue | "KEEP_AFTER_LEAVE";
  label: string;
  /** Réponse souhaitée par le membre, puis retenue par le parent (« Oui », « Non », « Non précisé »). */
  wished: string;
  final: string;
  changed: boolean;
};

const yesNo = (b: boolean): string => (b ? "Oui" : "Non");
const keepLabel = (b: boolean | null): string =>
  b === null ? "Non précisé" : b ? "Images conservées" : "Retrait sous un an";

/**
 * Compare les souhaits du membre mineur aux choix validés par son parent, ligne par ligne, dans
 * l'ordre du formulaire (le PDF et les notifications en tirent la mise en évidence des changements).
 */
export function compareWishes(wishes: ConsentChoices, final: ConsentChoices): WishComparisonRow[] {
  const rows: WishComparisonRow[] = IMAGE_USAGE_VALUES.map((u) => {
    const w = wishes.usages.includes(u);
    const f = final.usages.includes(u);
    return { item: u, label: IMAGE_USAGE_LABEL[u], wished: yesNo(w), final: yesNo(f), changed: w !== f };
  });
  rows.push({
    item: "KEEP_AFTER_LEAVE",
    label: "Après le départ du club",
    wished: keepLabel(wishes.keepAfterLeave),
    final: keepLabel(final.keepAfterLeave),
    changed: wishes.keepAfterLeave !== final.keepAfterLeave,
  });
  return rows;
}

/** Lignes de texte des seuls changements (« Réseaux sociaux du club : souhaité Oui → Non »). */
export function describeWishChanges(rows: readonly WishComparisonRow[]): string[] {
  return rows.filter((r) => r.changed).map((r) => `${r.label} : souhaité ${r.wished} → ${r.final}`);
}
