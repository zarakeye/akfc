"use client";

import { useEffect } from "react";
import { X, Download, BookmarkCheck, BookmarkMinus } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { PdfViewer } from "@features/member-documents/PdfViewer";
import ReactMarkdown from "react-markdown";
import { useNodeTextContent } from "@features/finder-core/hooks/useNodeTextContent";

type ReaderDoc = {
  id: string;
  title: string;
  readAt: string | Date | null;
  mimeType?: string | null;
  format?: string | null;
};

type DocKind = "pdf" | "markdown" | "text" | "other";

/** Type d'aperçu depuis mimeType (fiable) puis format puis extension du titre. */
function detectDocKind(doc: ReaderDoc): DocKind {
  const mime = (doc.mimeType ?? "").toLowerCase();
  const fmt = (doc.format ?? "").toLowerCase();
  const name = (doc.title ?? "").toLowerCase();
  const ext = name.includes(".") ? name.split(".").pop()! : "";
  if (mime === "application/pdf" || fmt === "pdf" || ext === "pdf") return "pdf";
  if (
    mime === "text/markdown" ||
    fmt === "md" || fmt === "markdown" ||
    ext === "md" || ext === "markdown"
  )
    return "markdown";
  if (
    mime.startsWith("text/") ||
    ["txt", "csv", "log", "json"].includes(fmt) ||
    ["txt", "csv", "log", "json"].includes(ext)
  )
    return "text";
  return "other";
}

function MarkdownDocView({ src }: { src: string }) {
  const { content, loading, error, truncated } = useNodeTextContent(src);
  if (loading) return <div className="p-6 text-sm text-gray-500">Chargement…</div>;
  if (error) return <div className="p-6 text-sm text-red-600">Impossible de lire ce fichier.</div>;
  return (
    <div className="h-full overflow-auto bg-white p-6">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content ?? ""}</ReactMarkdown>
      </div>
      {truncated && (
        <p className="mt-4 text-xs text-gray-400">Aperçu tronqué — téléchargez le fichier pour la version complète.</p>
      )}
    </div>
  );
}

function TextDocView({ src }: { src: string }) {
  const { content, loading, error, truncated } = useNodeTextContent(src);
  if (loading) return <div className="p-6 text-sm text-gray-500">Chargement…</div>;
  if (error) return <div className="p-6 text-sm text-red-600">Impossible de lire ce fichier.</div>;
  return (
    <div className="h-full overflow-auto bg-gray-50 p-6">
      <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-800">{content ?? ""}</pre>
      {truncated && (
        <p className="mt-4 text-xs text-gray-400">Aperçu tronqué — téléchargez le fichier pour la version complète.</p>
      )}
    </div>
  );
}

function UnsupportedDocView() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="text-sm font-medium text-gray-700">Aperçu non disponible pour ce format.</p>
      <p className="text-xs text-gray-500">Utilisez le bouton « Télécharger » pour ouvrir le fichier.</p>
    </div>
  );
}

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
    void utils.memberDocument.unreadBreakdownForMe.invalidate();
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

        {/* Aperçu selon le type de fichier. */}
        <div className="min-h-0 flex-1 bg-gray-100">
          {(() => {
            switch (detectDocKind(doc)) {
              case "pdf":
                return <PdfViewer src={src} />;
              case "markdown":
                return <MarkdownDocView src={src} />;
              case "text":
                return <TextDocView src={src} />;
              default:
                return <UnsupportedDocView />;
            }
          })()}
        </div>
      </aside>
    </>
  );
}
