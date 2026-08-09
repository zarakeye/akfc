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
