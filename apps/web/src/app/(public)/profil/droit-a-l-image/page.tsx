import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { MyImageConsent } from "#features/image-consent/MyImageConsent.tsx";

/**
 * « Mon droit à l'image » — `/profil/droit-a-l-image` (le proxy garde `/profil`). Le formulaire en
 * ligne (le même contenu que le formulaire papier ; le PDF est généré à partir des réponses), le
 * statut, les formulaires signés et le formulaire à imprimer. Accessible depuis le menu du compte
 * et depuis le profil.
 */
export const metadata: Metadata = { title: "Mon droit à l'image" };

export default function MyImageConsentPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Mon droit à l&apos;image</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vos choix pour les photos et vidéos du club : pour chaque usage, oui ou non. Le formulaire en ligne reprend le
          formulaire papier ; une fois vos choix confirmés, le club reçoit le document signé, que vous retrouvez ici.
        </p>
      </div>
      <MyImageConsent />
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
        <Link href="/profil/ou-j-apparais" className="text-success hover:underline">
          Où j&apos;apparais : les photos et vidéos où le club m&apos;a identifié(e) →
        </Link>
        <Link href="/profil" className="text-success hover:underline">
          Retour au profil
        </Link>
      </div>
    </div>
  );
}
