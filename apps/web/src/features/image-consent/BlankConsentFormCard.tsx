"use client";

import { useState, type JSX } from "react";
import { FileText } from "lucide-react";

import { IMAGE_CONSENT_BLANK_FORM_URL } from "@contracts/legal/imageConsent";
import { FilePreviewPanel } from "@features/image-consent/FilePreviewPanel";

/** Aperçu du formulaire vierge, avec Télécharger et Imprimer. */
export function BlankConsentFormPreview({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <FilePreviewPanel
      title="Autorisation de droit à l'image"
      src={IMAGE_CONSENT_BLANK_FORM_URL}
      kind="pdf"
      downloadName="autorisation-droit-image-AKFC.pdf"
      onClose={onClose}
    />
  );
}

/**
 * Formulaire d'autorisation de droit à l'image VIERGE : première connexion, profil. Un clic en
 * ouvre l'aperçu, d'où le télécharger ou l'imprimer. Le membre le remet signé à un responsable,
 * qui le dépose sur sa fiche.
 */
export function BlankConsentFormCard({ className = "" }: { className?: string }): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-lg border border-border p-4 text-sm ${className}`}>
      <p className="font-semibold">Droit à l&apos;image</p>
      <p className="mt-1 text-gray-600">
        Le club prend des photos et des vidéos pendant les cours et les stages. Pour qu&apos;il puisse les diffuser,
        remplissez l&apos;autorisation (celle d&apos;un parent pour un mineur), signez-la et remettez-la à un
        responsable du club, en main propre ou scannée à contact@akfc.fr. Elle est facultative et vous choisissez
        chaque usage.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 font-medium hover:bg-gray-50"
      >
        <FileText className="h-4 w-4" />
        Voir le formulaire
      </button>
      {open && <BlankConsentFormPreview onClose={() => setOpen(false)} />}
    </div>
  );
}
