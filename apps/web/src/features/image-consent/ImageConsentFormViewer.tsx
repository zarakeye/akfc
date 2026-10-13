"use client";

import type { JSX } from "react";

import { FilePreviewPanel } from "@features/image-consent/FilePreviewPanel";

export type ViewableConsentForm = { id: string; mimeType: string; fileName: string };

/** URL du formulaire signé (route gatée : le membre concerné et les admins). */
export function consentFormSrc(id: string): string {
  return `/api/media/image-consent/${id}`;
}

/** Aperçu d'un formulaire de droit à l'image signé : PDF dans le viewer, photo telle quelle. */
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
    <FilePreviewPanel
      title="Autorisation de droit à l'image signée"
      src={src}
      kind={form.mimeType === "application/pdf" ? "pdf" : "image"}
      downloadHref={`${src}?download=1`}
      downloadName={form.fileName}
      onClose={onClose}
    />
  );
}
