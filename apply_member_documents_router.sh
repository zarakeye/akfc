#!/usr/bin/env bash
#
# AKFC — Documents membres, increment 2/6 : router tRPC (backend).
#
# Nouveau router `memberDocument` + enregistrement dans modules/index.ts.
#   Membre (protectedProcedure) : listForMe, unreadCountForMe, markRead,
#     markUnread (upsert DocumentReceipt : readAt now / null).
#   Admin (isAdmin) : publish (crée un MemberDocument sur un MediaAsset, audience
#     ALL_MEMBERS ou SPECIFIC + destinataires), unpublish, listAdmin.
# Visibilité membre = ALL_MEMBERS OU (SPECIFIC ET destinataire).
#
# Nécessite l'increment 1 appliqué (modèles + `prisma generate`), sinon le
# typecheck échoue (ctx.prisma.memberDocument inconnu).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-router.sh
# Usage Claude sur clone (crée le fichier + enregistre, sans typecheck) :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-router.sh
#
set -euo pipefail

ROUTER="packages/backend/src/modules/memberDocuments/router.ts"
INDEX="packages/backend/src/modules/index.ts"

if [ ! -f "package.json" ] || [ ! -f "$INDEX" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($INDEX attendu)." >&2
  exit 1
fi

# ── 1) Fichier router (si absent) ───────────────────────────────────────────
if [ -f "$ROUTER" ]; then
  echo "router déjà présent — laissé tel quel"
else
  mkdir -p "$(dirname "$ROUTER")"
  cat > "$ROUTER" <<'ROUTER_EOF'
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

/**
 * Documents membres : fichiers du finder mis à disposition des membres, avec
 * statut de lecture par membre.
 *
 * Modèle : `MemberDocument` (surcouche sur un MediaAsset) ; audience
 * ALL_MEMBERS (tous, nouveaux inclus d'office) ou SPECIFIC (destinataires
 * explicites = perso aujourd'hui, bureau demain) ; `DocumentReceipt` = lu/non
 * lu par membre (absence de ligne ou readAt null = non lu).
 */

const adminProcedure = protectedProcedure.use(isAdmin);

/** Condition Prisma « ce document concerne l'utilisateur ». */
function visibleToUser(userId: string) {
  return {
    OR: [
      { audience: "ALL_MEMBERS" as const },
      { audience: "SPECIFIC" as const, recipients: { some: { userId } } },
    ],
  };
}

export const memberDocumentRouter = router({
  // ─── Membre ────────────────────────────────────────────────────────────

  /** Documents visibles par le membre courant, avec son statut de lecture. */
  listForMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
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
    }));
  }),

  /** Nombre de documents non lus (pour la cloche). */
  unreadCountForMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    return ctx.prisma.memberDocument.count({
      where: {
        ...visibleToUser(userId),
        // Non lu = aucun reçu daté pour ce membre.
        receipts: { none: { userId, readAt: { not: null } } },
        // Raffinement possible (à décider) : ne notifier que le postérieur à
        // l'adhésion → ajouter `publishedAt: { gte: <memberSince> }`.
      },
    });
  }),

  /** Marquer lu (à l'ouverture de l'aperçu). */
  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;
      const visible = await ctx.prisma.memberDocument.findFirst({
        where: { id: input.id, ...visibleToUser(userId) },
        select: { id: true },
      });
      if (!visible) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document introuvable." });
      }
      await ctx.prisma.documentReceipt.upsert({
        where: { memberDocumentId_userId: { memberDocumentId: input.id, userId } },
        create: { memberDocumentId: input.id, userId, readAt: new Date() },
        update: { readAt: new Date() },
      });
      return { success: true };
    }),

  /** Re-marquer non lu (garde le signal de la cloche pour y revenir). */
  markUnread: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;
      const visible = await ctx.prisma.memberDocument.findFirst({
        where: { id: input.id, ...visibleToUser(userId) },
        select: { id: true },
      });
      if (!visible) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document introuvable." });
      }
      await ctx.prisma.documentReceipt.upsert({
        where: { memberDocumentId_userId: { memberDocumentId: input.id, userId } },
        create: { memberDocumentId: input.id, userId, readAt: null },
        update: { readAt: null },
      });
      return { success: true };
    }),

  // ─── Admin ─────────────────────────────────────────────────────────────

  /** Met un fichier du finder à disposition des membres. */
  publish: adminProcedure
    .input(
      z.object({
        mediaAssetId: z.string(),
        title: z.string().trim().max(300).optional(),
        audience: z.enum(["ALL_MEMBERS", "SPECIFIC"]),
        recipientUserIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        input.audience === "SPECIFIC" &&
        (!input.recipientUserIds || input.recipientUserIds.length === 0)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Au moins un destinataire est requis pour une diffusion restreinte.",
        });
      }

      const asset = await ctx.prisma.mediaAsset.findUnique({
        where: { id: input.mediaAssetId },
        select: { id: true },
      });
      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Fichier introuvable." });
      }

      const existing = await ctx.prisma.memberDocument.findUnique({
        where: { mediaAssetId: input.mediaAssetId },
        select: { id: true },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ce fichier est déjà mis à disposition des membres.",
        });
      }

      const recipientIds =
        input.audience === "SPECIFIC" ? (input.recipientUserIds ?? []) : [];

      const doc = await ctx.prisma.memberDocument.create({
        data: {
          mediaAssetId: input.mediaAssetId,
          title: input.title,
          audience: input.audience,
          publishedById: ctx.sessionClient.user.id,
          recipients: { create: recipientIds.map((id) => ({ userId: id })) },
        },
        select: { id: true },
      });
      return { id: doc.id };
    }),

  /** Retire la mise à disposition (cascade reçus + destinataires). */
  unpublish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.memberDocument.delete({ where: { id: input.id } });
      return { success: true };
    }),

  /** Liste admin de tous les documents mis à disposition. */
  listAdmin: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.memberDocument.findMany({
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        audience: true,
        publishedAt: true,
        mediaAsset: { select: { displayName: true, originalFileName: true } },
        _count: { select: { recipients: true, receipts: true } },
      },
    });
  }),
});
ROUTER_EOF
  echo "router memberDocument créé"
fi

# ── 2) Enregistrement dans modules/index.ts ─────────────────────────────────
python3 - "$INDEX" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "memberDocumentRouter" in s:
    print("index déjà à jour")
    sys.exit(0)

IMP_OLD = 'import { sitePageRouter } from "@backend/modules/sitePages/router";'
IMP_NEW = ('import { sitePageRouter } from "@backend/modules/sitePages/router";\n'
           'import { memberDocumentRouter } from "@backend/modules/memberDocuments/router";')
assert s.count(IMP_OLD) == 1, "ancre import index introuvable/multiple — abandon"
s = s.replace(IMP_OLD, IMP_NEW)

REG_OLD = '  breakingNews: breakingNewsRouter,\n});'
REG_NEW = '  breakingNews: breakingNewsRouter,\n  memberDocument: memberDocumentRouter,\n});'
assert s.count(REG_OLD) == 1, "ancre enregistrement index introuvable/multiple — abandon"
s = s.replace(REG_OLD, REG_NEW)

p.write_text(s, encoding="utf-8")
print("router enregistré dans index.ts")
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
if git commit -m "feat(documents): router memberDocument (publish/list/read-status)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi