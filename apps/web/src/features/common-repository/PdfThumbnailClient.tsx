"use client";

import dynamic from "next/dynamic";

/**
 * Chargement CLIENT-ONLY de PdfThumbnail.
 *
 * react-pdf/pdfjs évalue `new DOMMatrix()` (API navigateur) au chargement du
 * module — indisponible côté Node, donc crash pendant le SSR. On diffère donc
 * son import au navigateur (`ssr: false`). Même nom ré-exporté : les
 * consommateurs ne changent que le chemin d'import.
 */
export const PdfThumbnail = dynamic(
  () => import("./PdfThumbnail").then((m) => m.PdfThumbnail),
  { ssr: false },
);
