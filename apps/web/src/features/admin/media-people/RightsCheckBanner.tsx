import type { JSX } from "react";

import { IMAGE_USAGE_LABEL, type ImageUsageValue } from "@contracts/legal/imageConsent";
import { mediaPositions, type DestinationCheck, type RightsIssue } from "@contracts/legal/mediaPeople";

const usagesOf = (issues: readonly RightsIssue[]): string =>
  [...new Set(issues.map((i) => `« ${IMAGE_USAGE_LABEL[i.usage]} »`))].join(", ");

/**
 * Bandeau au-dessus du tableau des médias : la destination du contenant (galerie, carrousel), et ce
 * que le droit à l'image des personnes taguées en dit. Rouge : un refus pour une destination
 * publique (enregistrement refusé, média déjà masqué en ligne). Orange : pas encore d'autorisation,
 * ou refus pour l'espace membres (on prévient seulement). Vert : rien à signaler.
 */
export function RightsCheckBanner({
  ids,
  destinations,
  check,
  describe,
}: {
  /** Médias du contenant, dans l'ordre (pour les numéros). */
  ids: readonly string[];
  destinations: readonly ImageUsageValue[];
  check: DestinationCheck;
  /**
   * Désigne les médias en cause. Par défaut, leurs numéros (« Médias n° 2 et 5 ») : juste pour un
   * tableau ; un contenu de page, dont les images sont réparties dans plusieurs blocs, les compte.
   */
  describe?: (ids: readonly string[], issues: readonly RightsIssue[]) => string;
}): JSX.Element {
  const which = describe ?? mediaPositions;
  const missing = check.warnings.filter((w) => w.verdict === "MISSING");
  const refusedInternal = check.warnings.filter((w) => w.verdict === "REFUSED");
  const blockedCount = new Set(check.blocking.map((b) => b.mediaAssetId)).size;
  const ok = check.blocking.length === 0 && check.warnings.length === 0;
  const dest = destinations.map((u) => IMAGE_USAGE_LABEL[u]).join(", ");

  return (
    <div className="mb-3 space-y-1.5 text-sm" data-testid="rights-banner">
      <p className="text-gray-600">
        Destination : <strong>{dest}</strong>
      </p>
      {check.blocking.length > 0 && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-red-800">
          ✕ {which(ids, check.blocking)} : une personne taguée a refusé {usagesOf(check.blocking)}. {blockedCount > 1
            ? "Impossible d'enregistrer avec ces médias ; en ligne, ils sont déjà masqués."
            : "Impossible d'enregistrer avec ce média ; en ligne, il est déjà masqué."}
        </p>
      )}
      {missing.length > 0 && (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
          ? {which(ids, missing)} : pas encore d&apos;autorisation pour {usagesOf(missing)}. Publication possible ;
          pense à relancer depuis la fenêtre des tags.
        </p>
      )}
      {refusedInternal.length > 0 && (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
          ✕ {which(ids, refusedInternal)} : une personne taguée a refusé {usagesOf(refusedInternal)}. Ce
          n&apos;est pas bloquant (usage interne au club), mais mieux vaut s&apos;en passer.
        </p>
      )}
      {ok && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-emerald-800">
          ✓ Conforme pour : {dest}.
          {check.untagged.length > 0 &&
            ` ${check.untagged.length} média${check.untagged.length > 1 ? "s" : ""} pas encore tagué${check.untagged.length > 1 ? "s" : ""} (sans effet pour l'instant).`}
        </p>
      )}
    </div>
  );
}
