#!/usr/bin/env bash
#
# AKFC — Groupes, increment 2b-1/N : visibilité + publication ciblant les groupes.
#
#   - `visibleToUser` (router) : un doc ciblé est visible si le membre est
#     destinataire ad hoc OU membre d'un groupe visé (appartenance résolue
#     dynamiquement) ;
#   - `publish` accepte `groupIds` EN PLUS de `recipientUserIds` (les deux
#     ensemble possibles) ; SPECIFIC exige ≥1 groupe OU membre ;
#   - la route de livraison `/api/media/member-document/[id]` applique la même
#     garde élargie.
#
# Nécessite les increments 1 groupes + documents appliqués (+ generate).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-groups-visibility.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-groups-visibility.sh
#
set -euo pipefail

ROUTER="packages/backend/src/modules/memberDocuments/router.ts"
ROUTE="apps/web/src/app/api/media/member-document/[id]/route.ts"

if [ ! -f "package.json" ] || [ ! -f "$ROUTER" ] || [ ! -f "$ROUTE" ]; then
  echo "ERREUR: lance depuis la racine (router + route livraison attendus)." >&2
  exit 1
fi

python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "groupIds" in s:
    print("router déjà à jour"); sys.exit(0)

# 1) visibleToUser
V_OLD = r'''function visibleToUser(userId: string) {
  return {
    OR: [
      { audience: "ALL_MEMBERS" as const },
      { audience: "SPECIFIC" as const, recipients: { some: { userId } } },
    ],
  };
}'''
V_NEW = r'''function visibleToUser(userId: string) {
  return {
    OR: [
      { audience: "ALL_MEMBERS" as const },
      {
        audience: "SPECIFIC" as const,
        // Ciblé : destinataire ad hoc OU membre d'un groupe visé (appartenance
        // résolue dynamiquement → un membre ajouté au groupe hérite des docs
        // déjà posés).
        OR: [
          { recipients: { some: { userId } } },
          {
            groups: { some: { group: { memberships: { some: { userId } } } } },
          },
        ],
      },
    ],
  };
}'''
assert s.count(V_OLD) == 1, "ancre visibleToUser introuvable"
s = s.replace(V_OLD, V_NEW)

# 2) publish input : + groupIds
I_OLD = r'''        recipientUserIds: z.array(z.string()).optional(),
      }),'''
I_NEW = r'''        recipientUserIds: z.array(z.string()).optional(),
        groupIds: z.array(z.string()).optional(),
      }),'''
assert s.count(I_OLD) == 1, "ancre input publish introuvable"
s = s.replace(I_OLD, I_NEW)

# 3) publish validation : ≥1 groupe OU membre
C_OLD = r'''      if (
        input.audience === "SPECIFIC" &&
        (!input.recipientUserIds || input.recipientUserIds.length === 0)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Au moins un destinataire est requis pour une diffusion restreinte.",
        });
      }'''
C_NEW = r'''      const recipientIds =
        input.audience === "SPECIFIC" ? (input.recipientUserIds ?? []) : [];
      const groupIds =
        input.audience === "SPECIFIC" ? (input.groupIds ?? []) : [];
      if (
        input.audience === "SPECIFIC" &&
        recipientIds.length === 0 &&
        groupIds.length === 0
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Choisissez au moins un groupe ou un membre.",
        });
      }'''
assert s.count(C_OLD) == 1, "ancre validation publish introuvable"
s = s.replace(C_OLD, C_NEW)

# 4) create : retirer le recipientIds dupliqué + ajouter groups
D_OLD = r'''      const recipientIds =
        input.audience === "SPECIFIC" ? (input.recipientUserIds ?? []) : [];

      const doc = await ctx.prisma.memberDocument.create({
        data: {
          mediaAssetId: asset.id,
          title: input.title,
          audience: input.audience,
          publishedById: ctx.sessionClient.user.id,
          recipients: { create: recipientIds.map((id) => ({ userId: id })) },
        },
        select: { id: true },
      });'''
D_NEW = r'''      const doc = await ctx.prisma.memberDocument.create({
        data: {
          mediaAssetId: asset.id,
          title: input.title,
          audience: input.audience,
          publishedById: ctx.sessionClient.user.id,
          recipients: { create: recipientIds.map((id) => ({ userId: id })) },
          groups: { create: groupIds.map((id) => ({ groupId: id })) },
        },
        select: { id: true },
      });'''
assert s.count(D_OLD) == 1, "ancre create publish introuvable"
s = s.replace(D_OLD, D_NEW)

p.write_text(s, encoding="utf-8")
print("router : visibilité groupe + publish accepte les groupes")
PY

python3 - "$ROUTE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "memberships" in s:
    print("route déjà à jour"); sys.exit(0)
OLD = r'''        { audience: "ALL_MEMBERS" },
        { audience: "SPECIFIC", recipients: { some: { userId } } },'''
NEW = r'''        { audience: "ALL_MEMBERS" },
        {
          audience: "SPECIFIC",
          OR: [
            { recipients: { some: { userId } } },
            {
              groups: {
                some: { group: { memberships: { some: { userId } } } },
              },
            },
          ],
        },'''
assert s.count(OLD) == 1, "ancre garde route introuvable"
p.write_text(s.replace(OLD, NEW), encoding="utf-8")
print("route livraison : garde élargie aux groupes")
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
if git commit -m "feat(groups): visibilité par appartenance de groupe + publish accepte les groupes" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi