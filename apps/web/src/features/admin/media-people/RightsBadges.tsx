import type { JSX } from "react";

import { IMAGE_USAGE_LABEL, IMAGE_USAGE_VALUES, type ImageUsageValue } from "@akfc/contracts/legal/imageConsent.ts";
import { USAGE_VERDICT_LABEL, type PersonUsageState, type UsageVerdict } from "@akfc/contracts/legal/mediaPeople.ts";

/**
 * Pastilles du droit à l'image : vert = accord, rouge = refus, orange = pas d'autorisation (on
 * attend une réponse : relance possible), gris = personne n'est tagué. La couleur n'est jamais seule :
 * chaque pastille porte un symbole et son libellé (survol, lecteur d'écran).
 */

/** En-têtes courts des colonnes (le libellé complet est au survol). */
export const USAGE_SHORT_LABEL: Record<ImageUsageValue, string> = {
  MEMBER_SPACE: "Membres",
  PUBLIC_SITE: "Site",
  SOCIAL_NETWORKS: "Réseaux",
  PRINT: "Imprimés",
  PRESS: "Presse",
};

const TONE: Record<UsageVerdict, { cls: string; sign: string }> = {
  OK: { cls: "bg-success-muted text-success ring-ring", sign: "✓" },
  REFUSED: { cls: "bg-destructive-muted text-destructive ring-destructive", sign: "✕" },
  MISSING: { cls: "bg-warning-muted text-warning ring-warning/40", sign: "?" },
  UNTAGGED: { cls: "bg-muted text-muted-foreground ring-ring", sign: "–" },
};

/** Une pastille : verdict d'un média (ou état d'une personne) pour un usage. */
export function VerdictBadge({
  usage,
  verdict,
}: {
  usage: ImageUsageValue;
  verdict: UsageVerdict | PersonUsageState;
}): JSX.Element {
  const tone = TONE[verdict];
  const label = `${IMAGE_USAGE_LABEL[usage]} : ${USAGE_VERDICT_LABEL[verdict]}`;
  return (
    <span
      title={label}
      aria-label={label}
      role="img"
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ring-1 ${tone.cls}`}
    >
      {tone.sign}
    </span>
  );
}

/** Les cinq pastilles d'une ligne, dans l'ordre du formulaire ; `labeled` : avec l'en-tête court. */
export function VerdictBadges({
  verdicts,
  labeled = false,
}: {
  verdicts: Record<ImageUsageValue, UsageVerdict | PersonUsageState>;
  labeled?: boolean;
}): JSX.Element {
  if (labeled) {
    return (
      <span className="inline-flex gap-2">
        {IMAGE_USAGE_VALUES.map((u) => (
          <span key={u} className="flex flex-col items-center gap-0.5">
            <VerdictBadge usage={u} verdict={verdicts[u]} />
            <span className="text-[10px] text-muted-foreground" aria-hidden>
              {USAGE_SHORT_LABEL[u]}
            </span>
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className="inline-flex gap-1">
      {IMAGE_USAGE_VALUES.map((u) => (
        <VerdictBadge key={u} usage={u} verdict={verdicts[u]} />
      ))}
    </span>
  );
}

/** Rappel de l'ordre des pastilles, au-dessus d'une liste. */
export const USAGE_ORDER_HINT = `Pastilles dans l'ordre : ${IMAGE_USAGE_VALUES.map((u) => USAGE_SHORT_LABEL[u]).join(" · ")}.`;
