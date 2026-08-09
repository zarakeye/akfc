#!/usr/bin/env bash
#
# AKFC — Documents membres, increment 4a/6 : coquille front.
#
#   - item navbar « Mes documents » (requiresUser) ;
#   - page /documents : liste `listForMe` avec badge « Nouveau » (non lu) ;
#   - panneau latéral escamotable responsive (accosté desktop, plein écran
#     mobile) avec : marquage LU à l'ouverture, toggle lu/non-lu, bouton
#     Télécharger (?download=1). Zone d'aperçu = embed natif PROVISOIRE, à
#     remplacer par le viewer react-pdf léché en 4b.
#
# Nécessite les increments 1+2 appliqués (client tRPC connaît memberDocument).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-front.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-front.sh
#
set -euo pipefail

NAV="apps/web/src/features/app-shell/navEntries.ts"
PAGE="apps/web/src/app/(public)/documents/page.tsx"
PANEL="apps/web/src/features/member-documents/DocumentReaderPanel.tsx"

if [ ! -f "package.json" ] || [ ! -f "$NAV" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($NAV attendu)." >&2
  exit 1
fi

# ── 1) Item navbar ──────────────────────────────────────────────────────────
python3 - "$NAV" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if '"/documents"' in s:
    print("navEntries déjà à jour"); sys.exit(0)
OLD = '  { kind: "link", href: "/dashboard", label: "Dashboard", requiresUser: true },'
NEW = ('  { kind: "link", href: "/dashboard", label: "Dashboard", requiresUser: true },\n'
       '  { kind: "link", href: "/documents", label: "Mes documents", requiresUser: true },')
assert s.count(OLD) == 1, "ancre navEntries introuvable/multiple — abandon"
p.write_text(s.replace(OLD, NEW), encoding="utf-8"); print("item navbar ajouté")
PY

# ── 2) Panneau ──────────────────────────────────────────────────────────────
if [ -f "$PANEL" ]; then echo "panneau déjà présent"; else
mkdir -p "$(dirname "$PANEL")"
cat > "$PANEL" <<'PANEL_EOF'
"use client";

import { useEffect } from "react";
import { X, Download, BookmarkCheck, BookmarkMinus } from "lucide-react";

import { trpc } from "@trpc/trpcClient";

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

        {/* Aperçu — embed natif provisoire (remplacé par react-pdf en 4b). */}
        <div className="min-h-0 flex-1 bg-gray-100">
          <object data={src} type="application/pdf" className="h-full w-full">
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-gray-600">
              <p>L&apos;aperçu n&apos;est pas disponible sur cet appareil.</p>
              <a
                href={`${src}?download=1`}
                className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
              >
                Télécharger le document
              </a>
            </div>
          </object>
        </div>
      </aside>
    </>
  );
}
PANEL_EOF
echo "panneau créé"
fi

# ── 3) Page ─────────────────────────────────────────────────────────────────
if [ -f "$PAGE" ]; then echo "page déjà présente"; else
mkdir -p "$(dirname "$PAGE")"
cat > "$PAGE" <<'PAGE_EOF'
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, CircleDot } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { DocumentReaderPanel } from "@features/member-documents/DocumentReaderPanel";

export default function DocumentsPage() {
  const user = useSessionStore((s) => s.session?.user);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQuery = trpc.memberDocument.listForMe.useQuery(undefined, {
    enabled: Boolean(user),
  });

  const docs = listQuery.data ?? [];
  const selected = useMemo(
    () => docs.find((d) => d.id === selectedId) ?? null,
    [docs, selectedId],
  );

  if (!user) {
    return (
      <main className="akfc-page py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Mes documents</h1>
        <p className="text-gray-600">
          Cette page est réservée aux membres.{" "}
          <Link href="/" className="font-medium text-emerald-700 hover:underline">
            Retour à l&apos;accueil
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="akfc-page py-10">
      <h1 className="mb-2 text-2xl font-bold">Mes documents</h1>
      <p className="mb-8 text-sm text-gray-600">
        Les documents mis à votre disposition par le club.
      </p>

      {listQuery.isLoading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : docs.length === 0 ? (
        <p className="text-gray-500">Aucun document pour le moment.</p>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {docs.map((d) => {
            const unread = d.readAt == null;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-gray-900">
                      {d.title}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {new Date(d.publishedAt).toLocaleDateString("fr-FR")}
                    </span>
                  </span>
                  {unread && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <CircleDot className="h-3 w-3" />
                      Nouveau
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <DocumentReaderPanel doc={selected} onClose={() => setSelectedId(null)} />
    </main>
  );
}
PAGE_EOF
echo "page créée"
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(documents): front — navbar + page /documents + panneau escamotable (viewer intérimaire)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi