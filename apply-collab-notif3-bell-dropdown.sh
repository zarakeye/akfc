#!/usr/bin/env bash
#
# AKFC — Cloche collaborative (point 4 des retours).
#
#  - Backend : query `memberDocument.collaborativeUnreadForMe` = LISTE des docs
#    non lus ciblant les espaces collaboratifs accessibles (héritage compris),
#    hors ses propres dépôts : {id, title, groupName}.
#  - Front : `CollaborativeBell` réécrite —
#      * MASQUÉE pour les managers/admins (permissions > 0) : leur cloche
#        bibliothèque + le finder admin suffisent (fin de la redondance) ;
#      * pour un membre NON-admin avec espaces : cloche + badge + DROPDOWN
#        listant les liens des nouveaux docs (titre + groupe), ouvrant le finder
#        membre /mes-espaces.
#
# Prérequis : notif1 (ancre) + notif2 (composant) + helper collaborativeEntriesForMember.
# Front NON testé → valider. Pas de migration.
# Usage : bash apply-collab-notif3-bell-dropdown.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-notif3-bell-dropdown.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/memberDocuments/router.ts"
BELL="apps/web/src/features/app-shell/CollaborativeBell.tsx"

for f in "package.json" "$ROUTER" "$BELL"; do
  [ -f "$f" ] || { echo "ERREUR: fichier manquant: $f (notif1+notif2 appliqués ?)." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── backend : query liste ───────────────────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "collaborativeUnreadForMe" in s:
    print("router déjà à jour"); sys.exit(0)

OLD = (
    "  collaborativeUnreadCountForMe: protectedProcedure.query(async ({ ctx }) => {\n"
    "    const userId = ctx.sessionClient.user.id;\n"
    "    const entries = await collaborativeEntriesForMember(ctx.prisma, userId);\n"
    "    const groupIds = entries.map((e) => e.groupId);\n"
    "    if (groupIds.length === 0) return 0;\n"
    "\n"
    "    return ctx.prisma.memberDocument.count({\n"
    "      where: {\n"
    "        groups: { some: { groupId: { in: groupIds } } },\n"
    "        receipts: { none: { userId, readAt: { not: null } } },\n"
    "        NOT: { publishedById: userId },\n"
    "      },\n"
    "    });\n"
    "  }),"
)
NEW = OLD + ("\n"
    "\n"
    "  /**\n"
    "   * LISTE des documents non lus des espaces collaboratifs accessibles\n"
    "   * (héritage compris), hors ses propres dépôts — pour le menu de la cloche.\n"
    "   */\n"
    "  collaborativeUnreadForMe: protectedProcedure.query(async ({ ctx }) => {\n"
    "    const userId = ctx.sessionClient.user.id;\n"
    "    const entries = await collaborativeEntriesForMember(ctx.prisma, userId);\n"
    "    const groupIds = entries.map((e) => e.groupId);\n"
    "    if (groupIds.length === 0) return [];\n"
    "\n"
    "    const docs = await ctx.prisma.memberDocument.findMany({\n"
    "      where: {\n"
    "        groups: { some: { groupId: { in: groupIds } } },\n"
    "        receipts: { none: { userId, readAt: { not: null } } },\n"
    "        NOT: { publishedById: userId },\n"
    "      },\n"
    "      select: {\n"
    "        id: true,\n"
    "        title: true,\n"
    "        mediaAsset: { select: { originalFileName: true } },\n"
    "        groups: { select: { group: { select: { id: true, name: true } } } },\n"
    "      },\n"
    "      orderBy: { publishedAt: \"desc\" },\n"
    "      take: 20,\n"
    "    });\n"
    "\n"
    "    return docs.map((d) => ({\n"
    "      id: d.id,\n"
    "      title: d.title ?? d.mediaAsset?.originalFileName ?? \"Document\",\n"
    "      groupName:\n"
    "        d.groups.find((g) => groupIds.includes(g.group.id))?.group.name ??\n"
    "        d.groups[0]?.group.name ??\n"
    "        \"\",\n"
    "    }));\n"
    "  }),"
)
assert s.count(OLD) == 1, "ancre notif1 (collaborativeUnreadCountForMe) introuvable"
s = s.replace(OLD, NEW)
p.write_text(s, encoding="utf-8")
print("router patché (collaborativeUnreadForMe)")
PY

# ── front : CollaborativeBell réécrite ──────────────────────────────────────
cat > "$BELL" <<'TSX'
"use client";

import { type JSX } from "react";
import Link from "next/link";
import { Bell, Users } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Cloche des espaces COLLABORATIFS — réservée aux membres NON-admin.
 *
 * Un manager/admin accède déjà à ses espaces via sa cloche « bibliothèque »
 * (NotificationBell) et le finder admin : pas de cloche redondante pour lui.
 * Pour un membre collaboratif : badge du nombre de documents non lus + menu
 * déroulant listant les nouveaux documents (titre + groupe), chacun ouvrant le
 * finder membre `/mes-espaces`. Absente si le membre n'a aucun espace.
 */
export function CollaborativeBell(): JSX.Element | null {
  const user = useSessionStore((s) => s.session?.user);
  const { data: spaces } = trpc.storage.myCollaborativeSpaces.useQuery();
  const { data: unread } =
    trpc.memberDocument.collaborativeUnreadForMe.useQuery();

  // Managers/admins : exclus (ils ont la cloche bibliothèque + le finder admin).
  const isManager = (user?.role?.permissions?.length ?? 0) > 0;
  if (isManager) return null;
  if (!spaces || spaces.length === 0) return null;

  const items = unread ?? [];
  const total = items.length;
  const plural = total > 1 ? "x" : "";

  return (
    <div className="group relative">
      <style>{`
        @keyframes akfc-collab-bell-shake {
          0%, 15%, 100% { transform: rotate(0deg); }
          2%  { transform: rotate(14deg); }
          5%  { transform: rotate(-12deg); }
          8%  { transform: rotate(9deg); }
          11% { transform: rotate(-6deg); }
          13% { transform: rotate(3deg); }
        }
        .akfc-collab-bell-shaking {
          animation: akfc-collab-bell-shake 6s ease-in-out infinite;
          transform-origin: top center;
        }
        @media (prefers-reduced-motion: reduce) {
          .akfc-collab-bell-shaking { animation: none; }
        }
      `}</style>

      <Link
        href="/mes-espaces"
        aria-label={
          total > 0
            ? `${total} nouveau${plural} document${total > 1 ? "s" : ""} — mes espaces`
            : "Mes espaces collaboratifs"
        }
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        {total > 0 ? (
          <>
            <Bell className="akfc-collab-bell-shaking h-5 w-5" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {total}
            </span>
          </>
        ) : (
          <Users className="h-5 w-5" aria-hidden />
        )}
      </Link>

      {/* Menu déroulant au survol */}
      <div className="absolute right-0 top-full z-50 hidden pt-1 group-hover:block">
        <div className="w-80 max-w-[90vw] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {total === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              Aucun nouveau document.
            </div>
          ) : (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {total} nouveau{plural} document{total > 1 ? "s" : ""}
              </div>
              {items.map((it) => (
                <Link
                  key={it.id}
                  href="/mes-espaces"
                  className="block px-3 py-2 hover:bg-gray-100"
                >
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {it.title}
                  </span>
                  {it.groupName && (
                    <span className="block truncate text-xs text-gray-500">
                      {it.groupName}
                    </span>
                  )}
                </Link>
              ))}
              <Link
                href="/mes-espaces"
                className="block border-t border-gray-100 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-gray-50"
              >
                Ouvrir mes espaces →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
TSX
echo "CollaborativeBell réécrite : $BELL"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(notif): cloche collaborative réservée aux membres + dropdown des nouveaux docs" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Valider : admin = pas de cloche collaborative ; membre = cloche + menu listant les nouveaux docs → /mes-espaces."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi