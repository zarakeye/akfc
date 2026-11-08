import { IMAGE_USAGE_VALUES, type ImageUsageValue } from "./imageConsent";

/**
 * Tags de personnes sur un média, comparés au droit à l'image : ce qui est partagé par le serveur
 * (verdicts, règles de publication) et l'interface (pastilles, libellés).
 *
 * Rien de tout cela n'est stocké : tout se recalcule à partir du droit à l'image ACTUEL de chaque
 * personne. Un membre qui retire son accord fait passer ses photos au rouge, sans resynchronisation.
 */

/** Droit à l'image d'une personne, tel que le verdict le lit. */
export type PersonConsent = {
  /** Usages du formulaire le plus récent (par date des droits) ; null : aucun formulaire. */
  formUsages: readonly ImageUsageValue[] | null;
  /** Statut enregistré par le club (sans formulaire : saisi à la main sur la fiche). */
  status: "UNKNOWN" | "GRANTED" | "REFUSED";
};

/** État d'UNE personne pour un usage. */
export type PersonUsageState = "OK" | "REFUSED" | "MISSING";

/**
 * Verdict d'un MÉDIA pour un usage :
 * - OK : toutes les personnes taguées ont donné leur accord (ou « aucune personne reconnaissable ») ;
 * - REFUSED : au moins une a refusé cet usage ;
 * - MISSING : au moins une n'a pas encore donné de réponse (pas d'autorisation) ;
 * - UNTAGGED : personne n'est tagué, et la case « aucune personne reconnaissable » n'est pas cochée.
 */
export type UsageVerdict = "OK" | "REFUSED" | "MISSING" | "UNTAGGED";

export const USAGE_VERDICT_LABEL: Record<UsageVerdict, string> = {
  OK: "Accord",
  REFUSED: "Refus",
  MISSING: "Pas d'autorisation",
  UNTAGGED: "À taguer",
};

/**
 * Une personne, pour un usage. Le formulaire le plus récent fait foi ; sans formulaire, le statut
 * saisi par le club : « refusé » vaut refus de tout, « accordé » vaut accord de tout (autorisation
 * écrite recueillie par le club), « non renseigné » = pas d'autorisation.
 */
export function personUsageState(p: PersonConsent, usage: ImageUsageValue): PersonUsageState {
  if (p.formUsages) return p.formUsages.includes(usage) ? "OK" : "REFUSED";
  if (p.status === "REFUSED") return "REFUSED";
  if (p.status === "GRANTED") return "OK";
  return "MISSING";
}

/** Verdict d'un média, usage par usage. Un refus l'emporte sur une absence d'autorisation. */
export function mediaVerdicts(params: {
  people: readonly PersonConsent[];
  noRecognizablePerson: boolean;
}): Record<ImageUsageValue, UsageVerdict> {
  const out = {} as Record<ImageUsageValue, UsageVerdict>;
  for (const u of IMAGE_USAGE_VALUES) {
    if (params.noRecognizablePerson) out[u] = "OK";
    else if (params.people.length === 0) out[u] = "UNTAGGED";
    else {
      const states = params.people.map((p) => personUsageState(p, u));
      out[u] = states.includes("REFUSED") ? "REFUSED" : states.includes("MISSING") ? "MISSING" : "OK";
    }
  }
  return out;
}

/** Délai minimal entre deux relances du droit à l'image d'une même personne. */
export const IMAGE_CONSENT_REMINDER_COOLDOWN_MS = 7 * 24 * 3600 * 1000;
