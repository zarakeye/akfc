import type { JSX } from "react";
import type { Metadata } from "next";

import { GuardianConsentPage } from "@features/image-consent/GuardianConsentPage";

/**
 * /autorisation-parent/<jeton> — le parent référent d'un membre mineur valide son autorisation de
 * droit à l'image. Pas de compte : le lien reçu par e-mail est la seule clé (usage unique,
 * 7 jours). Hors du groupe (public) : ni menu ni mode chantier, comme /auth/reset-password.
 */
export const metadata: Metadata = {
  title: "Autorisation de droit à l'image",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }): Promise<JSX.Element> {
  const { token } = await params;
  return <GuardianConsentPage token={token} />;
}
