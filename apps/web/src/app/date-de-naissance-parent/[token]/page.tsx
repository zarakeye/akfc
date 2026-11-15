import type { JSX } from "react";
import type { Metadata } from "next";

import { BirthDateGuardianPage } from "#features/image-consent/BirthDateGuardianPage.tsx";

/**
 * /date-de-naissance-parent/<jeton> — le parent référent d'un membre mineur renseigne, corrige ou
 * efface sa date de naissance, à la demande du mineur. Pas de compte : le lien reçu par e-mail est
 * la seule clé (usage unique, 7 jours). Hors du groupe (public), comme /autorisation-parent.
 */
export const metadata: Metadata = {
  title: "Date de naissance",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }): Promise<JSX.Element> {
  const { token } = await params;
  return <BirthDateGuardianPage token={token} />;
}
