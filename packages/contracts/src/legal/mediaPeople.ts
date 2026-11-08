import { IMAGE_USAGE_LABEL, IMAGE_USAGE_VALUES, type ImageUsageValue } from "./imageConsent";

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

/* ─── Destinations : où un ensemble de médias sera montré ───────────────────────────────── */

/** Slug réservé de la galerie du carrousel d'accueil (destination : site public, toujours). */
export const CAROUSEL_SLUG = "home-carousel";

/**
 * Usages où un REFUS bloque. Pour l'espace membres, interne au club, un refus avertit seulement.
 * Une absence de réponse n'est jamais bloquante : le site doit pouvoir vivre pendant que les
 * autorisations se recueillent ; les blocages arrivent au fil des tags et des réponses.
 */
export const BLOCKING_USAGES: readonly ImageUsageValue[] = ["PUBLIC_SITE", "SOCIAL_NETWORKS", "PRINT", "PRESS"];

/** Destination d'une galerie : le carrousel et une galerie publique vont sur le site public. */
export function galleryDestinations(g: { slug: string; visibility: "PUBLIC" | "MEMBERS" }): ImageUsageValue[] {
  if (g.slug === CAROUSEL_SLUG || g.visibility === "PUBLIC") return ["PUBLIC_SITE"];
  return ["MEMBER_SPACE"];
}

/** Un média qui pose problème pour une destination. */
export type RightsIssue = { mediaAssetId: string; usage: ImageUsageValue; verdict: "REFUSED" | "MISSING" };

export type DestinationCheck = {
  /** Refus pour une destination bloquante : enregistrement refusé, média masqué à l'affichage. */
  blocking: RightsIssue[];
  /** Pas encore d'autorisation, ou refus pour l'espace membres : on prévient, sans bloquer. */
  warnings: RightsIssue[];
  /** Médias que personne n'a encore tagués : sans effet pour l'instant. */
  untagged: string[];
};

/** Confronte les verdicts de médias aux destinations d'un contenant (galerie, carrousel…). */
export function checkDestinations(
  verdictsByMedia: Readonly<Record<string, Readonly<Record<ImageUsageValue, UsageVerdict>> | undefined>>,
  mediaAssetIds: readonly string[],
  destinations: readonly ImageUsageValue[],
): DestinationCheck {
  const out: DestinationCheck = { blocking: [], warnings: [], untagged: [] };
  for (const id of new Set(mediaAssetIds)) {
    const v = verdictsByMedia[id];
    if (!v) continue;
    if (destinations.every((u) => v[u] === "UNTAGGED")) out.untagged.push(id);
    for (const usage of destinations) {
      const verdict = v[usage];
      if (verdict === "REFUSED" && BLOCKING_USAGES.includes(usage)) out.blocking.push({ mediaAssetId: id, usage, verdict });
      else if (verdict === "REFUSED" || verdict === "MISSING") out.warnings.push({ mediaAssetId: id, usage, verdict });
    }
  }
  return out;
}

/** « Médias n° 2 et 5 » : position (1, 2…) des médias dans la liste, dans l'ordre. */
export function mediaPositions(ids: readonly string[], issues: readonly RightsIssue[]): string {
  const pos = [...new Set(issues.map((i) => ids.indexOf(i.mediaAssetId) + 1))].filter((n) => n > 0).sort((a, b) => a - b);
  if (pos.length === 0) return "";
  const list = pos.length === 1 ? `${pos[0]}` : `${pos.slice(0, -1).join(", ")} et ${pos[pos.length - 1]}`;
  return `${pos.length > 1 ? "Médias" : "Média"} n° ${list}`;
}

/**
 * Message d'un enregistrement refusé : quels médias, pour quel usage, et quoi faire.
 * `alternative` : l'autre issue, s'il y en a une (« ou réserve la galerie aux membres »).
 */
export function blockingMessage(ids: readonly string[], blocking: readonly RightsIssue[], alternative?: string): string {
  const usages = [...new Set(blocking.map((b) => `« ${IMAGE_USAGE_LABEL[b.usage]} »`))].join(", ");
  return `${mediaPositions(ids, blocking)} : une personne taguée a refusé ${usages}. Retire ${new Set(blocking.map((b) => b.mediaAssetId)).size > 1 ? "ces médias" : "ce média"} avant d'enregistrer${alternative ? `, ${alternative}` : ""}.`;
}

/** L'autre issue d'une galerie bloquée : la réserver aux membres (pas le carrousel). */
export const galleryAlternative = (slug: string): string | undefined =>
  slug === CAROUSEL_SLUG ? undefined : "ou réserve la galerie aux membres";

/* ─── Prévenir une personne taguée ──────────────────────────────────────────────────────── */

/** On attend une heure après le premier tag : une séance de tags donne un seul e-mail. */
export const TAG_DIGEST_DELAY_MS = 60 * 60 * 1000;
/** Au plus un e-mail par jour et par personne. */
export const TAG_DIGEST_MIN_GAP_MS = 24 * 60 * 60 * 1000;

/**
 * Qui prévenir maintenant, et de combien de nouveaux médias. Une personne a des tags pas encore
 * annoncés (`notifiedAt` vide) ; le plus ancien a au moins une heure ; et elle n'a pas reçu d'e-mail
 * depuis 24 heures (le dernier `notifiedAt` de ses tags). Un tag retiré entre-temps n'est plus là :
 * rien à annoncer.
 */
export function dueTagDigests(
  tags: readonly { userId: string; createdAt: Date; notifiedAt: Date | null }[],
  now: Date,
): Map<string, number> {
  const byUser = new Map<string, { pending: number; oldest: number; lastSent: number }>();
  for (const t of tags) {
    const u = byUser.get(t.userId) ?? { pending: 0, oldest: Infinity, lastSent: -Infinity };
    if (t.notifiedAt) u.lastSent = Math.max(u.lastSent, t.notifiedAt.getTime());
    else {
      u.pending += 1;
      u.oldest = Math.min(u.oldest, t.createdAt.getTime());
    }
    byUser.set(t.userId, u);
  }
  const due = new Map<string, number>();
  for (const [userId, u] of byUser) {
    if (u.pending === 0) continue;
    if (now.getTime() - u.oldest < TAG_DIGEST_DELAY_MS) continue;
    if (now.getTime() - u.lastSent < TAG_DIGEST_MIN_GAP_MS) continue;
    due.set(userId, u.pending);
  }
  return due;
}
