"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

// Worker pdf.js self-hosté (copié depuis pdfjs-dist dans /public — version
// garantie identique à celle installée).
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Viewer PDF léché, rendu canvas (pas de couche texte : évite les CSS
 * versionnés de react-pdf, suffisant pour une lecture seule). Barre :
 * navigation de pages + zoom. Le PDF est servi même origine par la route
 * gatée, donc pdf.js le fetche sans souci de CORS.
 */
export function PdfViewer({ src }: { src: string }) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [width, setWidth] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setPage(1);
  }, []);

  const btn =
    "rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center gap-1 border-b border-gray-200 bg-white px-3 py-2 text-sm">
        <button
          type="button"
          className={btn}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="w-16 text-center tabular-nums text-gray-600">
          {page} / {numPages || "…"}
        </span>
        <button
          type="button"
          className={btn}
          onClick={() => setPage((p) => Math.min(numPages || 1, p + 1))}
          disabled={numPages > 0 && page >= numPages}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="mx-2 h-4 w-px bg-gray-200" />
        <button
          type="button"
          className={btn}
          onClick={() => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)))}
          aria-label="Dézoomer"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))}
          aria-label="Zoomer"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-auto bg-gray-100 p-4"
      >
        <Document
          file={src}
          onLoadSuccess={onLoadSuccess}
          loading={
            <div className="py-10 text-center text-sm text-gray-500">
              Chargement…
            </div>
          }
          error={
            <div className="py-10 text-center text-sm text-gray-600">
              Impossible d&apos;afficher le document. Utilisez le bouton
              Télécharger.
            </div>
          }
        >
          <Page
            pageNumber={page}
            width={width ? width - 32 : undefined}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="mx-auto shadow-md"
          />
        </Document>
      </div>
    </div>
  );
}
