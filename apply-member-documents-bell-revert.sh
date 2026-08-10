#!/usr/bin/env bash
#
# AKFC — Documents membres : le compteur quitte la cloche pour l'item navbar.
#
#   1. REVERT de `apply-member-documents-bell.sh` : `NotificationBell` revient à
#      son état bibliothèque-uniquement (managers) ;
#   2. nouveau `unreadBreakdownForMe` (membre) : non-lus ventilés `{ general,
#      perso }` — généraux ALL_MEMBERS bornés à l'année d'adhésion, persos
#      SPECIFIC toujours signalés. Alimentera le badge de l'item « Documents ».
#
# Nécessite les increments 1, 2 appliqués (+ la cloche telle que livrée par
# apply-member-documents-bell.sh).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-bell-revert.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-bell-revert.sh
#
set -euo pipefail

BELL="apps/web/src/features/app-shell/NotificationBell.tsx"
ROUTER="packages/backend/src/modules/memberDocuments/router.ts"

if [ ! -f "package.json" ] || [ ! -f "$BELL" ] || [ ! -f "$ROUTER" ]; then
  echo "ERREUR: lance depuis la racine (NotificationBell + router memberDocuments attendus)." >&2
  exit 1
fi

# ── 1) Revert de la cloche ──────────────────────────────────────────────────
python3 - "$BELL" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "unreadCountForMe" not in s:
    print("cloche déjà revertée"); 
else:
    # S1
    S1_NEW = r'''  const { data: unreadDocs = 0 } =
    trpc.memberDocument.unreadCountForMe.useQuery(undefined, {
      enabled: Boolean(user),
    });

  const libraryTotal = (counts?.pending ?? 0) + (counts?.bin ?? 0);
  const total = libraryTotal + unreadDocs;

  // Manager : cloche toujours là (muette si rien à traiter). Membre simple :
  // elle n'apparaît que s'il a des documents à lire.
  if (!user) return null;
  if (!canSee && total === 0) return null;

  const href = canSee ? "/dashboard/library" : "/documents";
  const docsLabel =
    unreadDocs > 0
      ? `${unreadDocs} document${unreadDocs > 1 ? "s" : ""} à lire`
      : "";
  const libLabel =
    canSee && libraryTotal > 0
      ? buildMessage(
          counts!.pending,
          counts!.bin,
          counts!.persoPending,
          counts!.generalPending,
        )
      : "";
  const ariaLabel =
    [libLabel, docsLabel].filter(Boolean).join(" · ") ||
    (canSee ? "Bibliothèque" : "Mes documents");'''
    S1_OLD = r'''  if (!canSee) return null;

  const total = (counts?.pending ?? 0) + (counts?.bin ?? 0);'''
    assert s.count(S1_NEW) == 1, "revert S1 : ancre introuvable"
    s = s.replace(S1_NEW, S1_OLD)

    # S2
    S2_NEW = r'''      <Link
        href={href}
        aria-label={ariaLabel}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >'''
    S2_OLD = r'''      <Link
        href="/dashboard/library"
        aria-label={
          total > 0
            ? buildMessage(
                counts!.pending,
                counts!.bin,
                counts!.persoPending,
                counts!.generalPending,
              )
            : "Bibliothèque"
        }
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >'''
    assert s.count(S2_NEW) == 1, "revert S2 : ancre introuvable"
    s = s.replace(S2_NEW, S2_OLD)

    # S3a
    assert s.count("            {canSee && counts && counts.pending > 0 && (") == 1, "revert S3a : ancre introuvable"
    s = s.replace("            {canSee && counts && counts.pending > 0 && (",
                  "            {counts!.pending > 0 && (")

    # S3b
    S3B_NEW = r'''            {canSee && counts && counts.bin > 0 && (
              <p className={counts.pending > 0 ? 'mt-1.5 border-t border-white/15 pt-1.5' : ''}>
                {counts.bin} contenu{counts.bin > 1 ? 's' : ''} dans la
                corbeille
              </p>
            )}
            {unreadDocs > 0 && (
              <Link
                href="/documents"
                className={
                  canSee && counts && (counts.pending > 0 || counts.bin > 0)
                    ? 'mt-1.5 block border-t border-white/15 pt-1.5 hover:underline'
                    : 'block hover:underline'
                }
              >
                {unreadDocs} document{unreadDocs > 1 ? 's' : ''} à lire
              </Link>
            )}
          </div>'''
    S3B_OLD = r'''            {counts!.bin > 0 && (
              <p className={counts!.pending > 0 ? 'mt-1.5 border-t border-white/15 pt-1.5' : ''}>
                {counts!.bin} contenu{counts!.bin > 1 ? 's' : ''} dans la
                corbeille
              </p>
            )}
          </div>'''
    assert s.count(S3B_NEW) == 1, "revert S3b : ancre introuvable"
    s = s.replace(S3B_NEW, S3B_OLD)

    p.write_text(s, encoding="utf-8")
    print("cloche revertée (bibliothèque uniquement)")
PY

# ── 2) unreadBreakdownForMe ─────────────────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "unreadBreakdownForMe" in s:
    print("router : breakdown déjà présent"); sys.exit(0)

OLD = r'''        ...(yearStart ? { publishedAt: { gte: yearStart } } : {}),
      },
    });
  }),'''
NEW = r'''        ...(yearStart ? { publishedAt: { gte: yearStart } } : {}),
      },
    });
  }),

  /** Non-lus ventilés : généraux (ALL_MEMBERS, bornés à l'année d'adhésion) et
   *  persos (SPECIFIC pour ce membre, toujours signalés). Pour le badge de
   *  l'item « Documents » de la navbar. */
  unreadBreakdownForMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    const me = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: { memberSince: true },
    });
    const yearStart = me?.memberSince
      ? new Date(Date.UTC(me.memberSince.getUTCFullYear(), 0, 1))
      : null;
    const unread = { receipts: { none: { userId, readAt: { not: null } } } };

    const [general, perso] = await Promise.all([
      ctx.prisma.memberDocument.count({
        where: {
          audience: "ALL_MEMBERS" as const,
          ...unread,
          ...(yearStart ? { publishedAt: { gte: yearStart } } : {}),
        },
      }),
      ctx.prisma.memberDocument.count({
        where: {
          audience: "SPECIFIC" as const,
          recipients: { some: { userId } },
          ...unread,
        },
      }),
    ]);
    return { general, perso };
  }),'''
assert s.count(OLD) == 1, "ancre fin unreadCountForMe introuvable"
s = s.replace(OLD, NEW, 1)
p.write_text(s, encoding="utf-8")
print("router : unreadBreakdownForMe ajouté")
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
if git commit -m "refactor(documents): retirer le compteur de la cloche + unreadBreakdownForMe (général/perso)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi