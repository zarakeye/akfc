#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, socle Option B (backend) : le dépôt dans un
# espace de groupe = PUBLICATION d'un MemberDocument ciblé sur le groupe, mais
# initiée par un ÉDITEUR (au lieu d'admin-only).
#
# Réutilise tout le système documents existant (reçus DocumentReceipt, badges
# nouveau/màj, markRead à l'aperçu, listForMe/unreadBreakdownForMe). La nouvelle
# mutation `memberDocument.depositToGroupSpace` :
#   - protectedProcedure, gardée par `assertCanWriteGroupSpace` (éditeur du
#     groupe OU admin) ;
#   - résout le MediaAsset par chemin (comme `publish`) ;
#   - crée un MemberDocument audience SPECIFIC ciblé sur CE groupe
#     (`publishedById = ctx.sessionClient.user.id`) ;
#   - idempotent doux : si déjà publié, renvoie l'existant sans dupliquer.
#
# Le front (uploader membre qui appelle cette mutation après l'upload
# `kind:"group"`) = incrément suivant.
#
# Prérequis : 1a + 1b appliqués (assertCanWriteGroupSpace). Pas de migration.
# Usage : bash apply-collab-2c-socle-deposit.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-2c-socle-deposit.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/memberDocuments/router.ts"

if [ ! -f "package.json" ] || [ ! -f "$ROUTER" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($ROUTER attendu)." >&2
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
rp = pathlib.Path(sys.argv[1]); s = rp.read_text(encoding="utf-8")

if "depositToGroupSpace" in s:
    print("router memberDocuments déjà à jour")
    sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# import de la garde
s = sub(
    'import { isAdmin } from "@backend/trpc/middleware";',
    'import { isAdmin } from "@backend/trpc/middleware";\n'
    'import { assertCanWriteGroupSpace } from "@backend/modules/memberGroups/assertCanWriteGroupSpace.service";',
    "import garde")

# mutation depositToGroupSpace, insérée entre publish et unpublish
s = sub(
    "      return { id: doc.id };\n"
    "    }),\n"
    "\n"
    "  /** Retire la mise à disposition (cascade reçus + destinataires). */\n"
    "  unpublish: adminProcedure",
    "      return { id: doc.id };\n"
    "    }),\n"
    "\n"
    "  /**\n"
    "   * Dépôt d'un fichier dans l'espace d'un groupe collaboratif par un\n"
    "   * ÉDITEUR (ou admin) : publie le MediaAsset comme MemberDocument ciblé\n"
    "   * sur CE groupe, pour que tout le système documents (reçus, badges,\n"
    "   * cloche) s'applique. Idempotent doux (ne re-publie pas un asset déjà\n"
    "   * mis à disposition).\n"
    "   */\n"
    "  depositToGroupSpace: protectedProcedure\n"
    "    .input(\n"
    "      z.object({\n"
    "        path: z.string(),\n"
    "        groupId: z.string(),\n"
    "        title: z.string().trim().max(300).optional(),\n"
    "      }),\n"
    "    )\n"
    "    .mutation(async ({ ctx, input }) => {\n"
    "      await assertCanWriteGroupSpace({\n"
    "        prisma: ctx.prisma,\n"
    "        userId: ctx.sessionClient.user.id,\n"
    "        groupId: input.groupId,\n"
    "      });\n"
    "\n"
    "      const asset = await ctx.prisma.mediaAsset.findFirst({\n"
    "        where: {\n"
    "          OR: [\n"
    "            { fullPath: input.path },\n"
    "            { fullPath: { startsWith: `${input.path}.` } },\n"
    "          ],\n"
    "        },\n"
    "        select: { id: true },\n"
    "      });\n"
    "      if (!asset) {\n"
    '        throw new TRPCError({ code: "NOT_FOUND", message: "Fichier introuvable." });\n'
    "      }\n"
    "\n"
    "      const existing = await ctx.prisma.memberDocument.findUnique({\n"
    "        where: { mediaAssetId: asset.id },\n"
    "        select: { id: true },\n"
    "      });\n"
    "      if (existing) {\n"
    "        return { id: existing.id, alreadyPublished: true };\n"
    "      }\n"
    "\n"
    "      const doc = await ctx.prisma.memberDocument.create({\n"
    "        data: {\n"
    "          mediaAssetId: asset.id,\n"
    "          title: input.title,\n"
    '          audience: "SPECIFIC",\n'
    "          publishedById: ctx.sessionClient.user.id,\n"
    "          groups: { create: [{ groupId: input.groupId }] },\n"
    "        },\n"
    "        select: { id: true },\n"
    "      });\n"
    "      return { id: doc.id, alreadyPublished: false };\n"
    "    }),\n"
    "\n"
    "  /** Retire la mise à disposition (cascade reçus + destinataires). */\n"
    "  unpublish: adminProcedure",
    "mutation depositToGroupSpace")

rp.write_text(s, encoding="utf-8")
print("router memberDocuments patché (depositToGroupSpace)")
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
if git commit -m "feat(groups): dépôt éditeur = publication MemberDocument ciblée sur le groupe (socle Option B)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi