#!/usr/bin/env bash
#
# AKFC — Documents membres : tri de la page (généraux / persos) + renommage.
#
#   - page /documents : deux sections « Documents du club » (audience
#     ALL_MEMBERS) et « Vos documents personnels » (SPECIFIC), chacune affichée
#     seulement si non vide, via un composant de liste réutilisable ;
#   - item navbar « Mes documents » → « Documents » (donne accès aux deux) ;
#     titre de page idem.
#
# Nécessite l'increment 4a appliqué (page + navbar).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-page-split.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-page-split.sh
#
set -euo pipefail

PAGE="apps/web/src/app/(public)/documents/page.tsx"
NAV="apps/web/src/features/app-shell/navEntries.ts"

if [ ! -f "package.json" ] || [ ! -f "$PAGE" ] || [ ! -f "$NAV" ]; then
  echo "ERREUR: lance depuis la racine (page /documents + navEntries attendus)." >&2
  exit 1
fi

# ── 1) Page réécrite avec tri ───────────────────────────────────────────────
cat > "$PAGE" <<'PAGE_EOF'
"use client";

import { useMemo, useState } from "react";
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
};

function DocList({
  items,
  onSelect,
}: {
  items: DocItem[];
  onSelect: (id: string) => void;
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

  const general = docs.filter((d) => d.audience === "ALL_MEMBERS");
  const perso = docs.filter((d) => d.audience === "SPECIFIC");

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
          {general.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Documents du club
              </h2>
              <DocList items={general} onSelect={setSelectedId} />
            </section>
          )}
          {perso.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Vos documents personnels
              </h2>
              <DocList items={perso} onSelect={setSelectedId} />
            </section>
          )}
        </div>
      )}

      <DocumentReaderPanel doc={selected} onClose={() => setSelectedId(null)} />
    </main>
  );
}
PAGE_EOF
echo "page /documents réécrite (tri généraux / persos)"

# ── 2) Renommage navbar ─────────────────────────────────────────────────────
python3 - "$NAV" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
OLD = '{ kind: "link", href: "/documents", label: "Mes documents", requiresUser: true },'
NEW = '{ kind: "link", href: "/documents", label: "Documents", requiresUser: true },'
if NEW in s:
    print("navbar déjà renommée")
else:
    assert s.count(OLD) == 1, "ancre navbar introuvable — abandon"
    p.write_text(s.replace(OLD, NEW), encoding="utf-8")
    print("navbar : « Mes documents » → « Documents »")
PY

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
if git commit -m "feat(documents): page triée généraux/persos + item navbar « Documents »" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi