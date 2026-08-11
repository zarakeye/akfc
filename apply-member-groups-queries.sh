#!/usr/bin/env bash
#
# AKFC — Groupes, increment 2b-2/N : face membre du backend (additif).
#
#   - `listForMe` : chaque doc expose `personal` (destinataire direct ?) et
#     `groups` (les groupes visés DONT le membre fait partie → par quel groupe
#     il l'a reçu). Champs existants inchangés.
#   - `unreadBreakdownForMe` : gagne `total` (compte DISTINCT pour le badge, un
#     doc multi-canal compté une fois) et `byGroup` ([{groupId,name,count}]).
#     `general`/`perso` conservés → non cassant pour la navbar actuelle.
#
# Nécessite l'increment 2b-1 appliqué.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-groups-member-queries.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-groups-member-queries.sh
#
set -euo pipefail

SVC="packages/backend/src/modules/memberDocuments/router.ts"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "myGroupIds" in s:
    print("déjà appliqué — rien à faire"); sys.exit(0)

# ── listForMe : select enrichi + map (personal + groups) ────────────────────
L_OLD = r'''    const userId = ctx.sessionClient.user.id;
    const docs = await ctx.prisma.memberDocument.findMany({
      where: visibleToUser(userId),
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        audience: true,
        publishedAt: true,
        mediaAsset: {
          select: {
            displayName: true,
            originalFileName: true,
            mimeType: true,
            format: true,
          },
        },
        receipts: { where: { userId }, select: { readAt: true } },
      },
    });

    return docs.map((d) => ({
      id: d.id,
      title:
        d.title ?? d.mediaAsset.displayName ?? d.mediaAsset.originalFileName,
      audience: d.audience,
      publishedAt: d.publishedAt,
      mimeType: d.mediaAsset.mimeType,
      format: d.mediaAsset.format,
      // Pas de reçu, ou reçu à readAt null (re-marqué non lu) = non lu.
      readAt: d.receipts[0]?.readAt ?? null,
    }));'''
L_NEW = r'''    const userId = ctx.sessionClient.user.id;
    const myGroupIds = new Set(
      (
        await ctx.prisma.memberGroupMembership.findMany({
          where: { userId },
          select: { groupId: true },
        })
      ).map((m) => m.groupId),
    );
    const docs = await ctx.prisma.memberDocument.findMany({
      where: visibleToUser(userId),
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        audience: true,
        publishedAt: true,
        mediaAsset: {
          select: {
            displayName: true,
            originalFileName: true,
            mimeType: true,
            format: true,
          },
        },
        receipts: { where: { userId }, select: { readAt: true } },
        recipients: { where: { userId }, select: { userId: true } },
        groups: { select: { group: { select: { id: true, name: true } } } },
      },
    });

    return docs.map((d) => ({
      id: d.id,
      title:
        d.title ?? d.mediaAsset.displayName ?? d.mediaAsset.originalFileName,
      audience: d.audience,
      publishedAt: d.publishedAt,
      mimeType: d.mediaAsset.mimeType,
      format: d.mediaAsset.format,
      // Pas de reçu, ou reçu à readAt null (re-marqué non lu) = non lu.
      readAt: d.receipts[0]?.readAt ?? null,
      // Destinataire direct (document personnel) ?
      personal: d.recipients.length > 0,
      // Groupes visés dont ce membre fait partie (par quel groupe il l'a reçu).
      groups: d.groups.map((g) => g.group).filter((g) => myGroupIds.has(g.id)),
    }));'''
assert s.count(L_OLD) == 1, "ancre listForMe introuvable"
s = s.replace(L_OLD, L_NEW)

# ── unreadBreakdownForMe : + total + byGroup ────────────────────────────────
B_OLD = r'''    const unread = { receipts: { none: { userId, readAt: { not: null } } } };

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
    return { general, perso };'''
B_NEW = r'''    const unread = { receipts: { none: { userId, readAt: { not: null } } } };
    const generalBound = yearStart ? { publishedAt: { gte: yearStart } } : {};

    const myGroups = await ctx.prisma.memberGroupMembership.findMany({
      where: { userId },
      select: { group: { select: { id: true, name: true } } },
    });

    const [general, perso, total, ...groupCounts] = await Promise.all([
      ctx.prisma.memberDocument.count({
        where: { audience: "ALL_MEMBERS" as const, ...unread, ...generalBound },
      }),
      ctx.prisma.memberDocument.count({
        where: {
          audience: "SPECIFIC" as const,
          recipients: { some: { userId } },
          ...unread,
        },
      }),
      // Total DISTINCT (un doc atteignant le membre par plusieurs canaux compté
      // une seule fois) : sert au badge.
      ctx.prisma.memberDocument.count({
        where: {
          ...unread,
          OR: [
            { audience: "ALL_MEMBERS" as const, ...generalBound },
            {
              audience: "SPECIFIC" as const,
              OR: [
                { recipients: { some: { userId } } },
                {
                  groups: {
                    some: { group: { memberships: { some: { userId } } } },
                  },
                },
              ],
            },
          ],
        },
      }),
      ...myGroups.map(({ group }) =>
        ctx.prisma.memberDocument.count({
          where: {
            audience: "SPECIFIC" as const,
            groups: { some: { groupId: group.id } },
            ...unread,
          },
        }),
      ),
    ]);

    const byGroup = myGroups
      .map(({ group }, i) => ({
        groupId: group.id,
        name: group.name,
        count: groupCounts[i] ?? 0,
      }))
      .filter((g) => g.count > 0);

    return { general, perso, total, byGroup };'''
assert s.count(B_OLD) == 1, "ancre unreadBreakdownForMe introuvable"
s = s.replace(B_OLD, B_NEW)

p.write_text(s, encoding="utf-8")
print("listForMe (personal + groups) + unreadBreakdownForMe (total + byGroup)")
PY

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
if git commit -m "feat(groups): listForMe expose les groupes + breakdown non-lus à 3 familles" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi