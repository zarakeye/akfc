#!/usr/bin/env bash
#
# AKFC — Groupes, increment 2a/N : router CRUD `memberGroup` (backend).
#
# Admin (isAdmin) : list (groupes + nb membres), create, update (renommer/
# description), delete (cascade appartenances + liens documents), members
# (membres d'un groupe), addMember (upsert idempotent), removeMember.
#
# Nécessite l'increment 1 groupes appliqué (modèles + migration + generate).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-groups-router.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-groups-router.sh
#
set -euo pipefail

ROUTER="packages/backend/src/modules/memberGroups/router.ts"
INDEX="packages/backend/src/modules/index.ts"

if [ ! -f "package.json" ] || [ ! -f "$INDEX" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($INDEX attendu)." >&2
  exit 1
fi

if [ -f "$ROUTER" ]; then
  echo "router déjà présent"
else
  mkdir -p "$(dirname "$ROUTER")"
  cat > "$ROUTER" <<'ROUTER_EOF'
import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

const adminProcedure = protectedProcedure.use(isAdmin);

/** Nom affichable d'un membre (prénom/nom, sinon email). */
function memberName(u: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
}

/**
 * Groupes de membres (ex. « Bureau »), gérés dans le panneau de contrôle.
 * Servent de listes de diffusion : l'appartenance est dynamique (utilisée à la
 * volée pour la visibilité des documents, cf. router memberDocument).
 */
export const memberGroupRouter = router({
  /** Groupes + nombre de membres. */
  list: adminProcedure.query(async ({ ctx }) => {
    const groups = await ctx.prisma.memberGroup.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        _count: { select: { memberships: true } },
      },
    });
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      memberCount: g._count.memberships,
    }));
  }),

  /** Crée un groupe. */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.memberGroup.create({
        data: { name: input.name, description: input.description },
        select: { id: true },
      });
      return { id: group.id };
    }),

  /** Renomme / met à jour un groupe. */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.memberGroup.update({
        where: { id: input.id },
        data: { name: input.name, description: input.description ?? null },
      });
      return { success: true };
    }),

  /** Supprime un groupe (cascade appartenances + liens documents). */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.memberGroup.delete({ where: { id: input.id } });
      return { success: true };
    }),

  /** Membres d'un groupe. */
  members: adminProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const memberships = await ctx.prisma.memberGroupMembership.findMany({
        where: { groupId: input.groupId },
        select: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });
      return memberships
        .map((m) => ({ id: m.user.id, name: memberName(m.user) }))
        .sort((a, b) => a.name.localeCompare(b.name, "fr"));
    }),

  /** Ajoute un membre à un groupe (idempotent). */
  addMember: adminProcedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.memberGroupMembership.upsert({
        where: {
          groupId_userId: { groupId: input.groupId, userId: input.userId },
        },
        create: { groupId: input.groupId, userId: input.userId },
        update: {},
      });
      return { success: true };
    }),

  /** Retire un membre d'un groupe. */
  removeMember: adminProcedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.memberGroupMembership.deleteMany({
        where: { groupId: input.groupId, userId: input.userId },
      });
      return { success: true };
    }),
});
ROUTER_EOF
  echo "router memberGroup créé"
fi

python3 - "$INDEX" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "memberGroupRouter" in s:
    print("index déjà à jour"); sys.exit(0)
IMP_OLD = 'import { memberDocumentRouter } from "@backend/modules/memberDocuments/router";'
IMP_NEW = (IMP_OLD + '\n'
           'import { memberGroupRouter } from "@backend/modules/memberGroups/router";')
assert s.count(IMP_OLD) == 1, "ancre import index introuvable"
s = s.replace(IMP_OLD, IMP_NEW)
REG_OLD = '  memberDocument: memberDocumentRouter,\n});'
REG_NEW = '  memberDocument: memberDocumentRouter,\n  memberGroup: memberGroupRouter,\n});'
assert s.count(REG_OLD) == 1, "ancre enregistrement index introuvable"
s = s.replace(REG_OLD, REG_NEW)
p.write_text(s, encoding="utf-8")
print("router enregistré dans index.ts")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification"; exit 0
fi

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
if git commit -m "feat(groups): router memberGroup (CRUD + gestion des membres)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi