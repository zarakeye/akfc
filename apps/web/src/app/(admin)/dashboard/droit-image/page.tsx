import type { JSX } from "react";
import type { Metadata } from "next";

import { PublicRightsReport } from "@features/admin/media-people/PublicRightsReport";

/**
 * Droit à l'image des médias en ligne — `/(admin)/dashboard/droit-image`. Ce que le site public
 * montre et qui demande une action : médias masqués (à retirer), en attente d'autorisation, à taguer.
 */
export const metadata: Metadata = { title: "Droit à l'image des médias en ligne" };

export default function PublicRightsPage(): JSX.Element {
  return <PublicRightsReport />;
}
