"use client";

import { JSX } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Même worker self-hosté que PdfViewer (version alignée sur pdfjs-dist).
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Vignette d'un PDF : rend la première page en canvas (sans couche texte ni
 * annotations → pas de CSS react-pdf à importer). Le conteneur parent clippe.
 */
export function PdfThumbnail({
  file,
  width = 128,
}: {
  file: File;
  width?: number;
}): JSX.Element {
  return (
    <Document
      file={file}
      loading={
        <span className="flex h-full w-full items-center justify-center text-2xl">
          📕
        </span>
      }
      error={
        <span className="flex h-full w-full items-center justify-center text-2xl">
          📕
        </span>
      }
    >
      <Page
        pageNumber={1}
        width={width}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  );
}
