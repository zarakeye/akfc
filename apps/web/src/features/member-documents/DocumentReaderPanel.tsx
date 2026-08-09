"use client";

import { useEffect } from "react";
import { X, Download, BookmarkCheck, BookmarkMinus } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { PdfViewer } from "@features/member-documents/PdfViewer";

type ReaderDoc = {
  id: string;
  title: string;
  readAt: string | Date | null;
};

/**
 * Panneau latéral escamotable de lecture d'un document membre.
 * Accosté à droite sur desktop, plein écran (fond sombre) sur mobile.
 * Ouvrir un document non lu le marque lu ; un toggle permet de le remettre
 * non lu pour garder le signal de la cloche.
 *
 * NB : la zone d'aperçu utilise pour l'instant l'embed natif du navigateur.
 * Le viewer react-pdf léché la remplacera (increment 4b) — même emplacement.
 */
export function DocumentReaderPanel({
  doc,
  onClose,
}: {
  doc: ReaderDoc | null;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const invalidate = () => {
    void utils.memberDocument.listForMe.invalidate();
    void utils.memberDocument.unreadCountForMe.invalidate();
  };
  const markRead = trpc.memberDocument.markRead.useMutation({
    onSuccess: invalidate,
  });
  const markUnread = trpc.memberDocument.markUnread.useMutation({
    onSuccess: invalidate,
  });

  const docId = doc?.id ?? null;
  const wasUnread = doc?.readAt == null;

  useEffect(() => {
    if (docId && wasUnread) {
      markRead.mutate({ id: docId });
    }
    // On ne réagit qu'au changement de document.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  if (!doc) return null;

  const isRead = doc.readAt != null;
  const src = `/api/media/member-document/${doc.id}`;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl md:w-[min(760px,55vw)]"
        role="dialog"
        aria-label={doc.title}
      >
        <header className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
          <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900">
            {doc.title}
          </h2>

          <button
            type="button"
            onClick={() =>
              isRead
                ? markUnread.mutate({ id: doc.id })
                : markRead.mutate({ id: doc.id })
            }
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
            title={isRead ? "Marquer comme non lu" : "Marquer comme lu"}
          >
            {isRead ? (
              <>
                <BookmarkMinus className="h-4 w-4" />
                Non lu
              </>
            ) : (
              <>
                <BookmarkCheck className="h-4 w-4" />
                Lu
              </>
            )}
          </button>

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

        {/* Aperçu — viewer react-pdf (canvas). */}
        <div className="min-h-0 flex-1 bg-gray-100">
          <PdfViewer src={src} />
        </div>
      </aside>
    </>
  );
}
