"use client";

import Link from "next/link";
import { useState, type JSX } from "react";
import { FileText } from "lucide-react";

import { IMAGE_CONSENT_BLANK_FORM_URL } from "@akfc/contracts/legal/imageConsent.ts";
import { FilePreviewPanel } from "#features/image-consent/FilePreviewPanel.tsx";

/**
 * Le formulaire vierge, en CONSULTATION seule : ni Télécharger ni Imprimer. L'autorisation se donne
 * en ligne ; seuls les formulaires validés (par le majeur ou par le parent) se téléchargent.
 */
export function BlankConsentFormPreview({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <FilePreviewPanel
      title="Autorisation de droit à l'image (consultation)"
      src={IMAGE_CONSENT_BLANK_FORM_URL}
      kind="pdf"
      readOnly
      onClose={onClose}
    />
  );
}

/**
 * Le droit à l'image en deux mots, et le texte de l'autorisation à lire (première connexion,
 * profil, « Mon droit à l'image »). `linkToPage` : lien vers « Mon droit à l'image », où elle se donne.
 */
export function BlankConsentFormCard({ className = "", linkToPage = false }: { className?: string; linkToPage?: boolean }): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-lg border border-border p-4 text-sm ${className}`}>
      <p className="font-semibold">Droit à l&apos;image</p>
      <p className="mt-1 text-gray-600">
        Le club prend des photos et des vidéos pendant les cours et les stages. Pour qu&apos;il puisse les diffuser,
        l&apos;autorisation se donne en ligne, depuis la page « Mon droit à l&apos;image » (pour un mineur, c&apos;est
        son parent qui valide). Elle est facultative et vous choisissez chaque usage. Le formulaire du club est
        ici à lire ; le récapitulatif de vos choix se télécharge une fois validé.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 font-medium hover:bg-gray-50"
        >
          <FileText className="h-4 w-4" />
          Lire le formulaire
        </button>
        {linkToPage && (
          <Link href="/profil/droit-a-l-image" className="text-emerald-700 hover:underline">
            Mon droit à l&apos;image
          </Link>
        )}
      </div>
      {open && <BlankConsentFormPreview onClose={() => setOpen(false)} />}
    </div>
  );
}
