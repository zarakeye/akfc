"use client";

import { Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, CircleDot } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { DocumentReaderPanel } from "@features/member-documents/DocumentReaderPanel";

type DocItem = {
  id: string;
  title: string;
  audience: "ALL_MEMBERS" | "SPECIFIC";
  publishedAt: string | Date;
  readAt: string | Date | null;
  personal: boolean;
  groups: { id: string; name: string }[];
};

/** « du groupe X » (1) / « des groupes X, Y et Z » (N). */
function groupLabel(names: string[]): string {
  const list = new Intl.ListFormat("fr", { type: "conjunction" }).format(names);
  return names.length <= 1 ? `du groupe ${list}` : `des groupes ${list}`;
}

function DocList({
  items,
  onSelect,
  showGroups = false,
}: {
  items: DocItem[];
  onSelect: (id: string) => void;
  showGroups?: boolean;
}) {
  return (
    <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {items.map((d) => {
        const unread = d.readAt == null;
        return (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onSelect(d.id)}
              data-tour="documents.item"
              className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-gray-50"
            >
              <FileText className="h-5 w-5 shrink-0 text-emerald-600" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-900">
                  {d.title}
                </span>
                <span className="block text-xs text-gray-500">
                  {new Date(d.publishedAt).toLocaleDateString("fr-FR")}
                  {showGroups && d.groups.length > 0
                    ? ` · ${groupLabel(d.groups.map((g) => g.name))}`
                    : ""}
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
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * `?doc=<id>` ouvre directement ce document (lien de la cloche collaborative) : son ouverture le
 * marque lu, comme depuis la liste. `useSearchParams` exige une frontière Suspense.
 */
export default function DocumentsPageWithParams() {
  return (
    <Suspense>
      <DocumentsPage />
    </Suspense>
  );
}

function DocumentsPage() {
  const user = useSessionStore((s) => s.session?.user);
  const docParam = useSearchParams().get("doc");
  const [selectedId, setSelectedId] = useState<string | null>(docParam);

  const listQuery = trpc.memberDocument.listForMe.useQuery(undefined, {
    enabled: Boolean(user),
  });

  const docs = listQuery.data ?? [];
  // Sans useMemo : `docs` est un nouveau tableau à chaque rendu tant que la requête n'a pas répondu
  // (`?? []`), ce qui rendait la mémoïsation inutile ; le React Compiler mémoïse lui-même.
  const selected = docs.find((d) => d.id === selectedId) ?? null;

  const club = docs.filter((d) => d.audience === "ALL_MEMBERS");
  const groupDocs = docs.filter(
    (d) => d.audience === "SPECIFIC" && d.groups.length > 0,
  );
  const personalDocs = docs.filter(
    (d) => d.audience === "SPECIFIC" && d.groups.length === 0 && d.personal,
  );

  if (!user) {
    return (
      <main className="akfc-page py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Documents</h1>
        <p className="text-gray-600">
          Cette page est réservée aux membres.{" "}
          <Link
            href="/"
            className="font-medium text-emerald-700 hover:underline"
          >
            Retour à l&apos;accueil
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="akfc-page py-10">
      <h1 className="mb-2 text-2xl font-bold">Documents</h1>
      <p className="mb-8 text-sm text-gray-600">
        Les documents mis à votre disposition par le club.
      </p>

      <div data-tour="documents.list">
        {listQuery.isLoading ? (
          <p className="text-gray-500">Chargement…</p>
        ) : docs.length === 0 ? (
          <p className="text-gray-500">Aucun document pour le moment.</p>
        ) : (
          <div className="space-y-8">
            {club.length > 0 && (
              <Section title="Documents du club">
                <DocList items={club} onSelect={setSelectedId} />
              </Section>
            )}
            {groupDocs.length > 0 && (
              <Section title="Documents de groupe">
                <DocList items={groupDocs} onSelect={setSelectedId} showGroups />
              </Section>
            )}
            {personalDocs.length > 0 && (
              <Section title="Vos documents personnels">
                <DocList items={personalDocs} onSelect={setSelectedId} />
              </Section>
            )}
          </div>
        )}
      </div>

      <DocumentReaderPanel doc={selected} onClose={() => setSelectedId(null)} />
    </main>
  );
}
