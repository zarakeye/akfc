#!/usr/bin/env bash
#
# AKFC — Vision NOTIFICATIONS, incrément 1 (backend) : compteur de la cloche.
#
# `memberDocument.collaborativeUnreadCountForMe` : nombre de documents NON LUS
# ciblant les groupes COLLABORATIFS accessibles au membre (héritage compris, via
# `collaborativeEntriesForMember`), en excluant ses propres dépôts. C'est le
# nombre affiché sur la cloche collaborative (UI = incrément suivant).
#
# Sépare bien collaboratif ↔ « Documents » : cette query ne compte QUE les docs
# ciblant un groupe collaboratif (relation `groups`), pas le perso/diffusion.
#
# Prérequis : 3b-spaces (helper collaborativeEntriesForMember) + 2c-socle (dépôt
# pose publishedById + groups) + 3a. Backend seul, testable. Pas de migration.
# Usage : bash apply-collab-notif1-unread-count.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-notif1-unread-count.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/memberDocuments/router.ts"

if [ ! -f "package.json" ] || [ ! -f "$ROUTER" ]; then
  echo "ERREUR: lance depuis la racine ($ROUTER attendu)." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "collaborativeUnreadCountForMe" in s:
    print("router déjà à jour"); sys.exit(0)

# import du helper
IMP_OLD = 'import { isAdmin } from "@backend/trpc/middleware";'
IMP_NEW = (IMP_OLD + "\n"
           'import { collaborativeEntriesForMember } from "@backend/modules/memberGroups/collaborativeEntriesForMember.service";')
assert s.count(IMP_OLD) == 1, "ancre import introuvable"
s = s.replace(IMP_OLD, IMP_NEW)

# nouvelle query après unreadCountForMe
OLD = ("        ...(yearStart ? { publishedAt: { gte: yearStart } } : {}),\n"
       "      },\n"
       "    });\n"
       "  }),")
NEW = OLD + ("\n"
       "\n"
       "  /**\n"
       "   * Compteur de la CLOCHE collaborative : documents non lus ciblant les\n"
       "   * groupes collaboratifs accessibles au membre (héritage compris), hors\n"
       "   * ses propres dépôts. Distinct de « Documents » (perso/diffusion).\n"
       "   */\n"
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
       "  }),")
assert s.count(OLD) == 1, "ancre fin unreadCountForMe introuvable"
s = s.replace(OLD, NEW, 1)

p.write_text(s, encoding="utf-8")
print("router patché (collaborativeUnreadCountForMe)")
PY

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
if git commit -m "feat(notif): compteur non-lus collaboratifs (collaborativeUnreadCountForMe)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi