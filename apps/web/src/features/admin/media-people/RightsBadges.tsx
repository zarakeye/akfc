import type { JSX } from "react";

import { IMAGE_USAGE_LABEL, IMAGE_USAGE_VALUES, type ImageUsageValue } from "@contracts/legal/imageConsent";
import { USAGE_VERDICT_LABEL, type PersonUsageState, type UsageVerdict } from "@contracts/legal/mediaPeople";

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
  OK: { cls: "bg-emerald-100 text-emerald-800 ring-emerald-300", sign: "✓" },
  REFUSED: { cls: "bg-red-100 text-red-800 ring-red-300", sign: "✕" },
  MISSING: { cls: "bg-amber-100 text-amber-800 ring-amber-300", sign: "?" },
  UNTAGGED: { cls: "bg-gray-100 text-gray-500 ring-gray-300", sign: "–" },
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
            <span className="text-[10px] text-gray-500" aria-hidden>
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
