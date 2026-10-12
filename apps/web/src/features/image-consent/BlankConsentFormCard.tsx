import type { JSX } from "react";
import { FileDown } from "lucide-react";

import { IMAGE_CONSENT_BLANK_FORM_URL } from "@contracts/legal/imageConsent";

/**
 * Formulaire d'autorisation de droit à l'image VIERGE, à imprimer : première connexion, profil.
 * Le membre le remet signé à un responsable, qui le dépose sur sa fiche.
 */
export function BlankConsentFormCard({ className = "" }: { className?: string }): JSX.Element {
  return (
    <div className={`rounded-lg border border-border p-4 text-sm ${className}`}>
      <p className="font-semibold">Droit à l&apos;image</p>
      <p className="mt-1 text-gray-600">
        Le club prend des photos et des vidéos pendant les cours et les stages. Pour qu&apos;il puisse les diffuser,
        remplissez l&apos;autorisation (celle d&apos;un parent pour un mineur), signez-la et remettez-la à un
        responsable du club, en main propre ou scannée à contact@akfc.fr. Elle est facultative et vous choisissez
        chaque usage.
      </p>
      <a
        href={IMAGE_CONSENT_BLANK_FORM_URL}
        download
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 font-medium hover:bg-gray-50"
      >
        <FileDown className="h-4 w-4" />
        Télécharger le formulaire (PDF)
      </a>
    </div>
  );
}
