#!/usr/bin/env bash
#
# AKFC — Chantier « En construction » (publication par page), BRIQUE 1 : backend.
#
#   - Modèle `PageVisibility { key @id, published @default(false), updatedAt }`
#     (clé = clé de route publique ; défaut false = « en construction »).
#   - Migration 20261020000000_page_visibility.
#   - Router `pageVisibility` :
#       * `publishedKeys` (PUBLIC) → clés publiées, pour la porte (middleware).
#       * `all` (admin) → états, pour le centre de contrôle.
#       * `setPublished` (admin) → upsert d'une page.
#       * `setAll` (admin) → upsert en masse (le toggle global ; reçoit les clés
#         du registre côté front).
#   - Enregistrement dans l'appRouter.
#
# ⚠️ MIGRATION → après ce script : `pnpm prisma migrate deploy` (local + serveur).
# Le script fait `prisma generate` avant le typecheck (sinon le client Prisma
# ignore PageVisibility). Gate admin = role.name === "ADMIN" (inline).
# Usage : bash apply-construction-1-backend.sh
#         AKFC_APPLY_ONLY=1 bash apply-construction-1-backend.sh   (clone)
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
ROUTER="packages/backend/src/modules/pageVisibility/router.ts"
INDEX="packages/backend/src/modules/index.ts"
MIG_DIR="prisma/migrations/20261020000000_page_visibility"

for f in "package.json" "$SCHEMA" "$INDEX"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── schéma : modèle PageVisibility ──────────────────────────────────────────
if grep -q "model PageVisibility" "$SCHEMA"; then
  echo "modèle déjà présent"
else
  cat >> "$SCHEMA" <<'PRISMA'

/// Publication par page (mode « En construction »). La clé est la clé de route
/// publique (ex. "gallery", "about"). Absence de ligne OU published=false =
/// page masquée aux non-admins ; published=true = visible du public/membres.
model PageVisibility {
  key       String   @id
  published Boolean  @default(false)
  updatedAt DateTime @updatedAt
}
PRISMA
  echo "modèle PageVisibility ajouté au schéma"
fi

# ── migration ───────────────────────────────────────────────────────────────
if [ ! -d "$MIG_DIR" ]; then
  mkdir -p "$MIG_DIR"
  cat > "$MIG_DIR/migration.sql" <<'SQL'
-- CreateTable
CREATE TABLE "PageVisibility" (
    "key" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageVisibility_pkey" PRIMARY KEY ("key")
);
SQL
  echo "migration écrite : $MIG_DIR/migration.sql"
else
  echo "migration déjà présente"
fi

# ── router ──────────────────────────────────────────────────────────────────
mkdir -p "$(dirname "$ROUTER")"
cat > "$ROUTER" <<'TS'
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";

/** Réserve l'action aux administrateurs (role.name === "ADMIN"). */
async function assertAdmin(ctx: {
  prisma: PrismaClient;
  user: { id: string };
}): Promise<void> {
  const me = await ctx.prisma.user.findUnique({
    where: { id: ctx.user.id },
    select: { role: { select: { name: true } } },
  });
  if (me?.role?.name !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Réservé aux administrateurs." });
  }
}

/**
 * Publication par page (mode « En construction »).
 *
 * `publishedKeys` est PUBLIC : c'est la porte (middleware) qui décide, pour un
 * non-admin, si une route est servie ou renvoyée vers « en construction ».
 * Le reste est réservé aux admins (centre de contrôle).
 */
export const pageVisibilityRouter = router({
  publishedKeys: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.pageVisibility.findMany({
      where: { published: true },
      select: { key: true },
    });
    return rows.map((r) => r.key);
  }),

  all: protectedProcedure.query(async ({ ctx }) => {
    await assertAdmin(ctx);
    return ctx.prisma.pageVisibility.findMany({
      select: { key: true, published: true },
    });
  }),

  setPublished: protectedProcedure
    .input(z.object({ key: z.string().min(1), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx);
      return ctx.prisma.pageVisibility.upsert({
        where: { key: input.key },
        create: { key: input.key, published: input.published },
        update: { published: input.published },
      });
    }),

  setAll: protectedProcedure
    .input(z.object({ keys: z.array(z.string().min(1)), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx);
      await ctx.prisma.$transaction(
        input.keys.map((key) =>
          ctx.prisma.pageVisibility.upsert({
            where: { key },
            create: { key, published: input.published },
            update: { published: input.published },
          }),
        ),
      );
      return { count: input.keys.length };
    }),
});
TS
echo "router écrit : $ROUTER"

# ── enregistrement dans l'appRouter ─────────────────────────────────────────
python3 - "$INDEX" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "pageVisibilityRouter" in s:
    print("appRouter déjà à jour"); sys.exit(0)

imp_old = 'import { memberGroupRouter } from "@backend/modules/memberGroups/router";'
assert s.count(imp_old) == 1, "ancre import (memberGroupRouter) introuvable"
s = s.replace(imp_old, imp_old + '\nimport { pageVisibilityRouter } from "@backend/modules/pageVisibility/router";')

reg_old = "export const appRouter = router({\n"
assert s.count(reg_old) == 1, "ancre appRouter introuvable"
s = s.replace(reg_old, reg_old + "  pageVisibility: pageVisibilityRouter,\n")

p.write_text(s, encoding="utf-8")
print("appRouter patché (pageVisibility)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "prisma generate (pour que le client connaisse PageVisibility)…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "❌ prisma generate a échoué :"; tail -5 /tmp/akfc_gen.log; exit 1; }

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
if git commit -m "feat(pages): modèle PageVisibility + router (publication par page)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  MIGRATION : lance 'pnpm prisma migrate deploy' en LOCAL puis sur le SERVEUR."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi