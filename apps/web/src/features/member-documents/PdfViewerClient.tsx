"use client";

import dynamic from "next/dynamic";

/**
 * Chargement CLIENT-ONLY de PdfViewer, comme PdfThumbnailClient.
 *
 * react-pdf/pdfjs évalue `new DOMMatrix()` (API navigateur) au chargement du module — indisponible
 * côté Node : importé directement, le visionneur faisait échouer le rendu serveur de chaque page qui
 * le contient (fiche d'un membre, profil, documents), erreur journalisée à chaque visite et page
 * rendue par le navigateur seul. Son import est donc différé au navigateur (`ssr: false`) ; le
 * visionneur ne s'ouvre de toute façon qu'après un clic.
 */
export const PdfViewer = dynamic(() => import("./PdfViewer").then((m) => m.PdfViewer), { ssr: false });
