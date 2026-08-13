#!/usr/bin/env bash
#
# AKFC — Groupes, increment 6/N : badge + tooltip navbar à trois familles.
#
# `DocumentsNavLink` : badge = `total` DISTINCT (un doc multi-canal compté une
# fois) ; tooltip = une ligne par famille non vide — club, chaque groupe
# (byGroup), personnels — chacune cliquable. S'appuie sur unreadBreakdownForMe
# (2b-2 : general / perso / total / byGroup).
#
# Nécessite l'increment 2b-2 + le composant DocumentsNavLink (badge d'origine).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-groups-nav-badge.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-groups-nav-badge.sh
#
set -euo pipefail

CMP="apps/web/src/features/member-documents/DocumentsNavLink.tsx"

if [ ! -f "package.json" ] || [ ! -f "$CMP" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($CMP attendu)." >&2
  exit 1
fi

cat > "$CMP" <<'CMP_EOF'
"use client";

import Link from "next/link";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Entrée de navbar « Documents » avec badge de non-lus (total DISTINCT) et, sur
 * desktop, un tooltip détaillé au survol : une ligne par famille non vide —
 * club, chaque groupe, personnels. Le burger passe `withTooltip={false}` :
 * pas de survol tactile, juste le badge.
 */
export function DocumentsNavLink({
  href,
  label,
  className,
  withTooltip = true,
}: {
  href: string;
  label: string;
  className?: string;
  withTooltip?: boolean;
}) {
  const user = useSessionStore((s) => s.session?.user);
  const { data } = trpc.memberDocument.unreadBreakdownForMe.useQuery(undefined, {
    enabled: Boolean(user),
  });
  const general = data?.general ?? 0;
  const perso = data?.perso ?? 0;
  const byGroup = data?.byGroup ?? [];
  const total = data?.total ?? 0;

  const plural = (n: number) => (n > 1 ? "s" : "");
  const lines: { key: string; text: string }[] = [];
  if (general > 0) {
    lines.push({
      key: "general",
      text: `${general} document${plural(general)} du club à lire`,
    });
  }
  for (const g of byGroup) {
    lines.push({
      key: g.groupId,
      text: `${g.count} document${plural(g.count)} du groupe ${g.name} à lire`,
    });
  }
  if (perso > 0) {
    lines.push({
      key: "perso",
      text: `${perso} document${plural(perso)} personnel${plural(perso)} à lire`,
    });
  }

  return (
    <span
      className={
        withTooltip
          ? "group relative inline-flex items-center"
          : "relative flex items-center"
      }
    >
      <Link href={href} className={className}>
        {label}
      </Link>
      {total > 0 && (
        <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {total}
        </span>
      )}
      {withTooltip && lines.length > 0 && (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-left text-xs text-white shadow-lg group-hover:pointer-events-auto group-hover:block"
        >
          {lines.map((line, i) => (
            <Link
              key={line.key}
              href="/documents"
              className={
                i > 0
                  ? "mt-1.5 block border-t border-white/15 pt-1.5 hover:underline"
                  : "block hover:underline"
              }
            >
              {line.text}
            </Link>
          ))}
        </div>
      )}
    </span>
  );
}
CMP_EOF
echo "DocumentsNavLink réécrit (badge total distinct + tooltip 3 familles)"

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
if git commit -m "feat(groups): badge total distinct + tooltip navbar à 3 familles (club/groupe/perso)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi