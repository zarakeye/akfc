#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, incrément 1a : modèle + migration + helper + router.
#
# Additif, NON cassant :
#   - MemberGroup.isCollaborative (Boolean, défaut false) : distingue une liste
#     de diffusion (défaut) d'un groupe collaboratif (espace finder dédié).
#   - MemberGroupMembership.access (enum VIEWER|EDITOR, défaut EDITOR) : droit
#     dans l'espace du groupe collaboratif. « Appartenir = éditer » -> défaut
#     EDITOR ; on rétrograde en VIEWER pour une consultation seule.
#   - helper resolveGroupBaseFolder -> `${appRoot}/groups/${slug}-${groupId}`
#     (jumeau de resolvePersoBaseFolder ; pas encore branché sur l'upload = 1b).
#   - router memberGroup : create/update/list exposent isCollaborative ;
#     members expose access ; addMember accepte access ; + setMemberAccess.
#
# Les groupes existants restent des listes de diffusion (isCollaborative=false),
# leurs appartenances passent EDITOR par défaut (sans effet tant que le groupe
# n'est pas collaboratif).
#
# Usage normal (Stéphane), sur la branche du chantier, depuis la racine du repo :
#   bash apply-collab-1a-model-router.sh
# Usage Claude sur clone (édits seulement, ni prisma, ni typecheck, ni commit) :
#   AKFC_APPLY_ONLY=1 bash apply-collab-1a-model-router.sh
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
ROUTER="packages/backend/src/modules/memberGroups/router.ts"
HELPER="packages/backend/src/modules/media/services/resolveGroupBaseFolder.service.ts"
MIG_DIR="prisma/migrations/20261015000000_member_group_collaborative_access"

if [ ! -f "package.json" ] || [ ! -f "$SCHEMA" ] || [ ! -f "$ROUTER" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($SCHEMA + $ROUTER attendus)." >&2
  exit 1
fi

# ── Garde de branche : ce chantier ne commit PAS sur main ──────────────────
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier collaboratif va sur sa branche." >&2
    echo "  git switch -c feat/groupes-collaboratifs   (ou: git switch feat/groupes-collaboratifs)" >&2
    exit 1
  fi
fi

# ── 1) Schéma Prisma ────────────────────────────────────────────────────────
python3 - "$SCHEMA" <<'PY'
import sys, pathlib
sp = pathlib.Path(sys.argv[1]); s = sp.read_text(encoding="utf-8")

if "MemberGroupAccess" in s:
    print("schéma déjà à jour")
else:
    # (a) enum MemberGroupAccess, inséré juste avant le modèle MemberGroup
    ANCHOR_COMMENT = "/// Groupe de membres (ex. « Bureau »), géré dans le panneau de contrôle. Sert"
    ENUM = (
        "/// Droit d'un membre dans l'espace d'un groupe collaboratif.\n"
        "enum MemberGroupAccess {\n"
        "  VIEWER\n"
        "  EDITOR\n"
        "}\n\n"
    )
    assert s.count(ANCHOR_COMMENT) == 1, "ancre commentaire MemberGroup introuvable"
    s = s.replace(ANCHOR_COMMENT, ENUM + ANCHOR_COMMENT)

    # (b) champ isCollaborative sur MemberGroup
    G_OLD = ("model MemberGroup {\n"
             "  id          String   @id @default(cuid())\n"
             "  name        String\n"
             "  description String?\n"
             "  createdAt   DateTime @default(now())")
    G_NEW = ("model MemberGroup {\n"
             "  id          String   @id @default(cuid())\n"
             "  name        String\n"
             "  description String?\n"
             "  /// Diffusion (défaut) vs espace collaboratif (dossier finder dédié + droits).\n"
             "  isCollaborative Boolean @default(false)\n"
             "  createdAt   DateTime @default(now())")
    assert s.count(G_OLD) == 1, "ancre modèle MemberGroup introuvable"
    s = s.replace(G_OLD, G_NEW)

    # (c) champ access sur MemberGroupMembership
    M_OLD = ('  user    User        @relation("MemberGroupMembership", fields: [userId], references: [id], onDelete: Cascade)\n'
             "\n"
             "  @@unique([groupId, userId])")
    M_NEW = ('  user    User        @relation("MemberGroupMembership", fields: [userId], references: [id], onDelete: Cascade)\n'
             "  /// Droit dans l'espace d'un groupe COLLABORATIF : EDITOR = dépôt/suppression,\n"
             "  /// VIEWER = consultation seule. Sans effet sur une liste de diffusion.\n"
             "  access  MemberGroupAccess @default(EDITOR)\n"
             "\n"
             "  @@unique([groupId, userId])")
    assert s.count(M_OLD) == 1, "ancre modèle MemberGroupMembership introuvable"
    s = s.replace(M_OLD, M_NEW)

    sp.write_text(s, encoding="utf-8")
    print("schéma patché (enum access + isCollaborative + access)")
PY

# ── 2) Migration SQL ────────────────────────────────────────────────────────
if [ ! -f "$MIG_DIR/migration.sql" ]; then
  mkdir -p "$MIG_DIR"
  cat > "$MIG_DIR/migration.sql" <<'SQL'
-- CreateEnum
CREATE TYPE "MemberGroupAccess" AS ENUM ('VIEWER', 'EDITOR');

-- AlterTable
ALTER TABLE "MemberGroup" ADD COLUMN "isCollaborative" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MemberGroupMembership" ADD COLUMN "access" "MemberGroupAccess" NOT NULL DEFAULT 'EDITOR';
SQL
  echo "migration SQL écrite : $MIG_DIR/migration.sql"
else
  echo "migration déjà présente"
fi

# ── 3) Router memberGroup ───────────────────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
rp = pathlib.Path(sys.argv[1]); s = rp.read_text(encoding="utf-8")

if "setMemberAccess" in s:
    print("router déjà à jour")
else:
    # list: select + map
    L_SEL_OLD = ("      select: {\n"
                 "        id: true,\n"
                 "        name: true,\n"
                 "        description: true,\n"
                 "        _count: { select: { memberships: true } },\n"
                 "      },")
    L_SEL_NEW = ("      select: {\n"
                 "        id: true,\n"
                 "        name: true,\n"
                 "        description: true,\n"
                 "        isCollaborative: true,\n"
                 "        _count: { select: { memberships: true } },\n"
                 "      },")
    assert s.count(L_SEL_OLD) == 1, "ancre list.select introuvable"
    s = s.replace(L_SEL_OLD, L_SEL_NEW)

    L_MAP_OLD = ("    return groups.map((g) => ({\n"
                 "      id: g.id,\n"
                 "      name: g.name,\n"
                 "      description: g.description,\n"
                 "      memberCount: g._count.memberships,\n"
                 "    }));")
    L_MAP_NEW = ("    return groups.map((g) => ({\n"
                 "      id: g.id,\n"
                 "      name: g.name,\n"
                 "      description: g.description,\n"
                 "      isCollaborative: g.isCollaborative,\n"
                 "      memberCount: g._count.memberships,\n"
                 "    }));")
    assert s.count(L_MAP_OLD) == 1, "ancre list.map introuvable"
    s = s.replace(L_MAP_OLD, L_MAP_NEW)

    # create: input + data
    C_OLD = ("  create: adminProcedure\n"
             "    .input(\n"
             "      z.object({\n"
             "        name: z.string().trim().min(1).max(120),\n"
             "        description: z.string().trim().max(500).optional(),\n"
             "      }),\n"
             "    )\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      const group = await ctx.prisma.memberGroup.create({\n"
             "        data: { name: input.name, description: input.description },")
    C_NEW = ("  create: adminProcedure\n"
             "    .input(\n"
             "      z.object({\n"
             "        name: z.string().trim().min(1).max(120),\n"
             "        description: z.string().trim().max(500).optional(),\n"
             "        isCollaborative: z.boolean().optional(),\n"
             "      }),\n"
             "    )\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      const group = await ctx.prisma.memberGroup.create({\n"
             "        data: {\n"
             "          name: input.name,\n"
             "          description: input.description,\n"
             "          isCollaborative: input.isCollaborative ?? false,\n"
             "        },")
    assert s.count(C_OLD) == 1, "ancre create introuvable"
    s = s.replace(C_OLD, C_NEW)

    # update: input + data
    U_OLD = ("  update: adminProcedure\n"
             "    .input(\n"
             "      z.object({\n"
             "        id: z.string(),\n"
             "        name: z.string().trim().min(1).max(120),\n"
             "        description: z.string().trim().max(500).optional(),\n"
             "      }),\n"
             "    )\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      await ctx.prisma.memberGroup.update({\n"
             "        where: { id: input.id },\n"
             "        data: { name: input.name, description: input.description ?? null },\n"
             "      });")
    U_NEW = ("  update: adminProcedure\n"
             "    .input(\n"
             "      z.object({\n"
             "        id: z.string(),\n"
             "        name: z.string().trim().min(1).max(120),\n"
             "        description: z.string().trim().max(500).optional(),\n"
             "        isCollaborative: z.boolean().optional(),\n"
             "      }),\n"
             "    )\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      await ctx.prisma.memberGroup.update({\n"
             "        where: { id: input.id },\n"
             "        data: {\n"
             "          name: input.name,\n"
             "          description: input.description ?? null,\n"
             "          isCollaborative: input.isCollaborative,\n"
             "        },\n"
             "      });")
    assert s.count(U_OLD) == 1, "ancre update introuvable"
    s = s.replace(U_OLD, U_NEW)

    # members: select + map
    ME_OLD = ("        select: {\n"
              "          user: {\n"
              "            select: { id: true, firstName: true, lastName: true, email: true },\n"
              "          },\n"
              "        },\n"
              "      });\n"
              "      return memberships\n"
              "        .map((m) => ({ id: m.user.id, name: memberName(m.user) }))")
    ME_NEW = ("        select: {\n"
              "          access: true,\n"
              "          user: {\n"
              "            select: { id: true, firstName: true, lastName: true, email: true },\n"
              "          },\n"
              "        },\n"
              "      });\n"
              "      return memberships\n"
              "        .map((m) => ({ id: m.user.id, name: memberName(m.user), access: m.access }))")
    assert s.count(ME_OLD) == 1, "ancre members introuvable"
    s = s.replace(ME_OLD, ME_NEW)

    # addMember: input + upsert
    A_OLD = ("  addMember: adminProcedure\n"
             "    .input(z.object({ groupId: z.string(), userId: z.string() }))\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      await ctx.prisma.memberGroupMembership.upsert({\n"
             "        where: {\n"
             "          groupId_userId: { groupId: input.groupId, userId: input.userId },\n"
             "        },\n"
             "        create: { groupId: input.groupId, userId: input.userId },\n"
             "        update: {},\n"
             "      });")
    A_NEW = ("  addMember: adminProcedure\n"
             "    .input(\n"
             "      z.object({\n"
             "        groupId: z.string(),\n"
             "        userId: z.string(),\n"
             '        access: z.enum(["VIEWER", "EDITOR"]).optional(),\n'
             "      }),\n"
             "    )\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      await ctx.prisma.memberGroupMembership.upsert({\n"
             "        where: {\n"
             "          groupId_userId: { groupId: input.groupId, userId: input.userId },\n"
             "        },\n"
             "        create: {\n"
             "          groupId: input.groupId,\n"
             "          userId: input.userId,\n"
             '          access: input.access ?? "EDITOR",\n'
             "        },\n"
             "        update: input.access ? { access: input.access } : {},\n"
             "      });")
    assert s.count(A_OLD) == 1, "ancre addMember introuvable"
    s = s.replace(A_OLD, A_NEW)

    # setMemberAccess : inséré avant la fermeture du router (ancre = removeMember)
    R_OLD = ("  removeMember: adminProcedure\n"
             "    .input(z.object({ groupId: z.string(), userId: z.string() }))\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      await ctx.prisma.memberGroupMembership.deleteMany({\n"
             "        where: { groupId: input.groupId, userId: input.userId },\n"
             "      });\n"
             "      return { success: true };\n"
             "    }),\n"
             "});")
    R_NEW = ("  removeMember: adminProcedure\n"
             "    .input(z.object({ groupId: z.string(), userId: z.string() }))\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      await ctx.prisma.memberGroupMembership.deleteMany({\n"
             "        where: { groupId: input.groupId, userId: input.userId },\n"
             "      });\n"
             "      return { success: true };\n"
             "    }),\n"
             "\n"
             "  /** Change le droit d'un membre dans un groupe collaboratif (VIEWER/EDITOR). */\n"
             "  setMemberAccess: adminProcedure\n"
             "    .input(\n"
             "      z.object({\n"
             "        groupId: z.string(),\n"
             "        userId: z.string(),\n"
             '        access: z.enum(["VIEWER", "EDITOR"]),\n'
             "      }),\n"
             "    )\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      await ctx.prisma.memberGroupMembership.update({\n"
             "        where: {\n"
             "          groupId_userId: { groupId: input.groupId, userId: input.userId },\n"
             "        },\n"
             "        data: { access: input.access },\n"
             "      });\n"
             "      return { success: true };\n"
             "    }),\n"
             "});")
    assert s.count(R_OLD) == 1, "ancre removeMember introuvable"
    s = s.replace(R_OLD, R_NEW)

    rp.write_text(s, encoding="utf-8")
    print("router patché (isCollaborative + access + setMemberAccess)")
PY

# ── 4) Helper d'espace de groupe (jumeau de resolvePersoBaseFolder) ─────────
if [ ! -f "$HELPER" ]; then
  cat > "$HELPER" <<'TS'
import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const SLUG_OPTIONS = { lower: true, strict: true } as const;

function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

/**
 * Résout le dossier RACINE de l'espace d'un groupe COLLABORATIF, SANS
 * sous-dossier de média — même logique que `resolvePersoBaseFolder`, mais
 * dérivée du groupe. Le segment `-${groupId}` assure l'unicité et reste STABLE
 * même si le nom (donc le slug) change.
 *
 *   → `${appRoot}/groups/${groupSlug}-${groupId}`
 *
 * Lève si le groupe n'existe pas ou n'est pas collaboratif (une liste de
 * diffusion n'a pas d'espace). Pas encore branché sur l'upload : ce sera
 * l'incrément 1b (destination + gardes de dépôt/suppression/consultation).
 */
export async function resolveGroupBaseFolder(params: {
  prisma: PrismaClient;
  appRoot: string;
  groupId: string;
}): Promise<string> {
  const { prisma, appRoot, groupId } = params;

  const group = await prisma.memberGroup.findUnique({
    where: { id: groupId },
    select: { name: true, isCollaborative: true },
  });

  if (!group) {
    throw new Error(`Member group not found (id=${groupId})`);
  }
  if (!group.isCollaborative) {
    throw new Error(`Member group ${groupId} is not collaborative (no space)`);
  }

  const groupSlug = slug(group.name) || `group-${groupId}`;

  return `${appRoot}/groups/${groupSlug}-${groupId}`;
}
TS
  echo "helper écrit : $HELPER"
else
  echo "helper déjà présent"
fi

# ── Fin (mode clone de test) ────────────────────────────────────────────────
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de prisma generate, ni typecheck, ni commit"
  exit 0
fi

echo "prisma generate…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "❌ prisma generate a échoué :"; tail -8 /tmp/akfc_gen.log; exit 1; }
echo "✅ client régénéré"

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
if git commit -m "feat(groups): isCollaborative + access (VIEWER/EDITOR) + helper espace groupe + router (migration)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo ""
  echo "➡️  Applique la migration (base de dev locale) :"
  echo '    PG_IP=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" "$(docker ps -qf name=postgres)")'
  echo '    DATABASE_URL="postgresql://akfc:LE_MDP@${PG_IP}:5432/akfc_db?schema=public" \'
  echo '    DIRECT_DATABASE_URL="postgresql://akfc:LE_MDP@${PG_IP}:5432/akfc_db?schema=public" \'
  echo "    pnpm prisma migrate deploy"
  echo "    (serveur : git pull puis même commande une fois la branche mergée)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi