"use client";

import type { JSX } from "react";
import { Download, X } from "lucide-react";

import { PdfViewer } from "@features/member-documents/PdfViewer";

export type ViewableConsentForm = { id: string; mimeType: string; fileName: string };

/** URL du formulaire signé (route gatée : le membre concerné et les admins). */
export function consentFormSrc(id: string): string {
  return `/api/media/image-consent/${id}`;
}

/**
 * Aperçu d'un formulaire de droit à l'image signé, en panneau latéral (même présentation que les
 * documents des membres) : PDF dans le viewer pdf.js, photo telle quelle.
 */
export function ImageConsentFormViewer({
  form,
  onClose,
}: {
  form: ViewableConsentForm | null;
  onClose: () => void;
}): JSX.Element | null {
  if (!form) return null;
  const src = consentFormSrc(form.id);
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl md:w-[min(760px,55vw)]"
        role="dialog"
        aria-label="Autorisation de droit à l'image"
      >
        <header className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
          <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900">
            Autorisation de droit à l&apos;image
          </h2>
          <a
            href={`${src}?download=1`}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Télécharger</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto bg-gray-100">
          {form.mimeType === "application/pdf" ? (
            <PdfViewer src={src} />
          ) : (
            // Photo du formulaire : servie par la route gatée, pas d'optimisation Next possible.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={`Formulaire signé (${form.fileName})`} className="mx-auto block max-w-full p-4" />
          )}
        </div>
      </aside>
    </>
  );
}
