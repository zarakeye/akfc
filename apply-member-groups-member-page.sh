#!/usr/bin/env bash
#
# AKFC — Groupes, increment 5/N : page membre à trois familles.
#
# Page /documents réécrite : « Documents du club » (ALL_MEMBERS), « Documents
# de groupe » (UNE zone ; chaque doc étiqueté smart « du groupe X » / « des
# groupes X, Y et Z » via Intl.ListFormat, d'après les groupes du membre par
# lesquels il arrive), « Vos documents personnels » (destinataire ad hoc).
# Chaque section n'apparaît que si non vide. Données : listForMe (2b-2).
#
# Nécessite l'increment 2b-2 appliqué (listForMe : personal + groups).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-groups-member-page.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-groups-member-page.sh
#
set -euo pipefail

PAGE="apps/web/src/app/(public)/documents/page.tsx"

if [ ! -f "package.json" ] || [ ! -f "$PAGE" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($PAGE attendu)." >&2
  exit 1
fi

cat > "$PAGE" <<'PAGE_EOF'
"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
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

      <DocumentReaderPanel doc={selected} onClose={() => setSelectedId(null)} />
    </main>
  );
}
PAGE_EOF
echo "page /documents réécrite (3 familles + étiquette smart)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(groups): page membre à 3 familles (club/groupe/perso) + étiquette smart" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi