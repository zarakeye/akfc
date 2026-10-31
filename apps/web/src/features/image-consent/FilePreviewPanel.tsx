"use client";

import type { JSX } from "react";
import { Download, Printer, X } from "lucide-react";

import { PdfViewer } from "@features/member-documents/PdfViewerClient";
import { printFile } from "@features/image-consent/printFile";

/**
 * Aperçu d'un fichier (PDF ou image) en panneau latéral, avec Télécharger et Imprimer — même
 * présentation que les documents des membres.
 */
export function FilePreviewPanel({
  title,
  src,
  kind,
  downloadHref,
  downloadName,
  onClose,
}: {
  title: string;
  src: string;
  kind: "pdf" | "image";
  /** Lien de téléchargement (par défaut : src, avec l'attribut download). */
  downloadHref?: string;
  downloadName?: string;
  onClose: () => void;
}): JSX.Element {
  const pill =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors";
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl md:w-[min(760px,55vw)]"
        role="dialog"
        aria-label={title}
      >
        <header className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
          <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={() => printFile(src, kind)}
            className={`${pill} text-gray-700 hover:bg-gray-100`}
            title="Imprimer"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
          <a
            href={downloadHref ?? src}
            download={downloadName ?? true}
            className={`${pill} bg-emerald-600 text-white hover:bg-emerald-700`}
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
          {kind === "pdf" ? (
            <PdfViewer src={src} />
          ) : (
            // Fichier servi par une route du site : pas d'optimisation Next possible.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={title} className="mx-auto block max-w-full p-4" />
          )}
        </div>
      </aside>
    </>
  );
}
