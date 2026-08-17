#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, ÉTAPE 3a : modèle d'INCLUSION (arbre).
#
# Un groupe peut être INCLUS dans un autre (imbrication). Modèle = ARBRE :
# chaque groupe a AU PLUS un parent (`parentGroupId`, auto-relation).
#
#   - Schéma : `MemberGroup.parentGroupId` + relation self `GroupHierarchy`
#     (onDelete: SetNull → supprimer un parent orpheline ses enfants au top-
#     level, pas de cascade destructrice) + index. Migration additive.
#   - Router : mutation `setParentGroup(groupId, parentGroupId|null)` (admin),
#     avec garde ANTI-CYCLE (le parent ne peut être ni le groupe lui-même ni
#     l'un de ses descendants) ; `parentGroupId` exposé dans `list`.
#
# ADDITIF (défaut parentGroupId=null → tous les groupes restent top-level).
# L'HÉRITAGE d'accès (membre du parent → accès aux descendants) = 3b.
# Le finder imbriqué = 3c. Le choix du parent sur la fiche = 3a-front.
#
# Prérequis : 1a. Migration à appliquer ensuite (local + serveur).
# Usage : bash apply-collab-3a-inclusion-model.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-3a-inclusion-model.sh   (clone)
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
ROUTER="packages/backend/src/modules/memberGroups/router.ts"
MIG_DIR="prisma/migrations/20261017000000_member_group_hierarchy"

for f in "package.json" "$SCHEMA" "$ROUTER"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f (lance depuis la racine)." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── 1) Schéma ───────────────────────────────────────────────────────────────
python3 - "$SCHEMA" <<'PY'
import sys, pathlib
sp = pathlib.Path(sys.argv[1]); s = sp.read_text(encoding="utf-8")
if "parentGroupId" in s:
    print("schéma déjà à jour")
else:
    OLD = ("  memberships MemberGroupMembership[]\n"
           "  documents   MemberDocumentGroup[]\n"
           "}")
    NEW = ("  /// Inclusion / imbrication (arbre) : le groupe parent. Ses membres\n"
           "  /// héritent de l'accès aux espaces des groupes descendants (voir 3b).\n"
           "  parentGroupId String?\n"
           "  parentGroup   MemberGroup?  @relation(\"GroupHierarchy\", fields: [parentGroupId], references: [id], onDelete: SetNull)\n"
           "  childGroups   MemberGroup[] @relation(\"GroupHierarchy\")\n"
           "\n"
           "  memberships MemberGroupMembership[]\n"
           "  documents   MemberDocumentGroup[]\n"
           "\n"
           "  @@index([parentGroupId])\n"
           "}")
    assert s.count(OLD) == 1, "ancre relations MemberGroup introuvable"
    s = s.replace(OLD, NEW)
    sp.write_text(s, encoding="utf-8")
    print("schéma patché (parentGroupId + relation self + index)")
PY

# ── 2) Migration ────────────────────────────────────────────────────────────
if [ ! -f "$MIG_DIR/migration.sql" ]; then
  mkdir -p "$MIG_DIR"
  cat > "$MIG_DIR/migration.sql" <<'SQL'
-- AlterTable
ALTER TABLE "MemberGroup" ADD COLUMN "parentGroupId" TEXT;

-- CreateIndex
CREATE INDEX "MemberGroup_parentGroupId_idx" ON "MemberGroup"("parentGroupId");

-- AddForeignKey
ALTER TABLE "MemberGroup" ADD CONSTRAINT "MemberGroup_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "MemberGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
SQL
  echo "migration écrite : $MIG_DIR/migration.sql"
else
  echo "migration déjà présente"
fi

# ── 3) Router ───────────────────────────────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
rp = pathlib.Path(sys.argv[1]); s = rp.read_text(encoding="utf-8")
if "setParentGroup" in s:
    print("router déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# import TRPCError
s = sub('import { z } from "zod";',
        'import { z } from "zod";\nimport { TRPCError } from "@trpc/server";',
        "import TRPCError")

# list : exposer parentGroupId (select + map)
s = sub("        isCollaborative: true,\n"
        "        _count: { select: { memberships: true } },",
        "        isCollaborative: true,\n"
        "        parentGroupId: true,\n"
        "        _count: { select: { memberships: true } },",
        "list select")
s = sub("      isCollaborative: g.isCollaborative,\n"
        "      memberCount: g._count.memberships,",
        "      isCollaborative: g.isCollaborative,\n"
        "      parentGroupId: g.parentGroupId,\n"
        "      memberCount: g._count.memberships,",
        "list map")

# setParentGroup, inséré après delete
s = sub(
    "  delete: adminProcedure\n"
    "    .input(z.object({ id: z.string() }))\n"
    "    .mutation(async ({ ctx, input }) => {\n"
    "      await ctx.prisma.memberGroup.delete({ where: { id: input.id } });\n"
    "      return { success: true };\n"
    "    }),",
    "  delete: adminProcedure\n"
    "    .input(z.object({ id: z.string() }))\n"
    "    .mutation(async ({ ctx, input }) => {\n"
    "      await ctx.prisma.memberGroup.delete({ where: { id: input.id } });\n"
    "      return { success: true };\n"
    "    }),\n"
    "\n"
    "  /**\n"
    "   * Définit (ou retire, si parentGroupId=null) le groupe PARENT d'un\n"
    "   * groupe — l'inclusion/hiérarchie (arbre). Garde anti-cycle : le nouveau\n"
    "   * parent ne peut être ni le groupe lui-même ni l'un de ses descendants.\n"
    "   */\n"
    "  setParentGroup: adminProcedure\n"
    "    .input(\n"
    "      z.object({\n"
    "        groupId: z.string(),\n"
    "        parentGroupId: z.string().nullable(),\n"
    "      }),\n"
    "    )\n"
    "    .mutation(async ({ ctx, input }) => {\n"
    "      const { groupId, parentGroupId } = input;\n"
    "\n"
    "      if (parentGroupId === groupId) {\n"
    "        throw new TRPCError({\n"
    '          code: "BAD_REQUEST",\n'
    '          message: "Un groupe ne peut pas être son propre parent.",\n'
    "        });\n"
    "      }\n"
    "\n"
    "      if (parentGroupId) {\n"
    "        const exists = await ctx.prisma.memberGroup.findUnique({\n"
    "          where: { id: parentGroupId },\n"
    "          select: { id: true },\n"
    "        });\n"
    "        if (!exists) {\n"
    '          throw new TRPCError({ code: "NOT_FOUND", message: "Groupe parent introuvable." });\n'
    "        }\n"
    "\n"
    "        // Le parent ne doit pas être un DESCENDANT du groupe (→ cycle) :\n"
    "        // on remonte la chaîne des ancêtres du parent ; si on croise le\n"
    "        // groupe, c'est qu'il est déjà un ancêtre du parent.\n"
    "        let cursor: string | null = parentGroupId;\n"
    "        const seen = new Set<string>();\n"
    "        while (cursor) {\n"
    "          if (cursor === groupId) {\n"
    "            throw new TRPCError({\n"
    '              code: "BAD_REQUEST",\n'
    '              message: "Cycle interdit : le parent choisi est un descendant du groupe.",\n'
    "            });\n"
    "          }\n"
    "          if (seen.has(cursor)) break;\n"
    "          seen.add(cursor);\n"
    "          const parent: { parentGroupId: string | null } | null =\n"
    "            await ctx.prisma.memberGroup.findUnique({\n"
    "              where: { id: cursor },\n"
    "              select: { parentGroupId: true },\n"
    "            });\n"
    "          cursor = parent?.parentGroupId ?? null;\n"
    "        }\n"
    "      }\n"
    "\n"
    "      await ctx.prisma.memberGroup.update({\n"
    "        where: { id: groupId },\n"
    "        data: { parentGroupId },\n"
    "      });\n"
    "      return { success: true };\n"
    "    }),",
    "setParentGroup")

rp.write_text(s, encoding="utf-8")
print("router patché (list.parentGroupId + setParentGroup)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de prisma generate, ni typecheck, ni commit"
  exit 0
fi

echo "prisma generate…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "❌ prisma generate a échoué :"; tail -8 /tmp/akfc_gen.log; exit 1; }
echo "✅ client régénéré"

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
if git commit -m "feat(groups): étape 3a — modèle d'inclusion (arbre : parentGroupId + setParentGroup anti-cycle)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "➡️  Applique la migration : pnpm prisma migrate deploy (local + serveur au merge)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi